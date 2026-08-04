<#
.SYNOPSIS
  Crea label, milestone, issue e GitHub Project a partire da scripts/backlog.tsv.

.DESCRIPTION
  Legge il backlog in formato TSV e replica su GitHub:
    1. le label (milestone, area, priorita)
    2. le 10 milestone GitHub con le date di scadenza
    3. una issue per ogni task, con label, milestone, assegnatario e Definition of Done
    4. un GitHub Project (v2) con i campi "Data Inizio", "Target date" e "Priority",
       popolato con tutte le issue

  Lo script e idempotente: rilanciandolo non duplica nulla, crea solo cio che manca.

.PREREQUISITI
  gh --version                  GitHub CLI installato
  gh auth login                 autenticato
  gh auth refresh -s project    scope necessario per i Projects v2

.ESEMPI
  .\scripts\bootstrap-backlog.ps1
  .\scripts\bootstrap-backlog.ps1 -SkipProject
  .\scripts\bootstrap-backlog.ps1 -ProjectTitle "Portfolio Roadmap"
#>

[CmdletBinding()]
param(
    # owner/repo. Se omesso viene dedotto dal remote git corrente.
    [string]$Repo,

    # Proprietario del Project. Se omesso usa l'owner del repo.
    [string]$Owner,

    [string]$ProjectTitle = 'Portfolio Roadmap',

    # Username GitHub a cui assegnare le issue. Stringa vuota = nessun assegnatario.
    [string]$Assignee = '@me',

    # Crea solo label, milestone e issue, senza toccare i Projects.
    [switch]$SkipProject,

    # Lavora solo sulle prime N issue. 0 = tutte. Utile per una prova.
    [int]$Limit = 0
)

# 'Continue' e voluto: gh scrive avvisi su stderr e con 'Stop' Windows PowerShell
# li trasformerebbe in eccezioni bloccanti. Gli errori veri li intercettiamo
# controllando $LASTEXITCODE dopo ogni chiamata.
$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

# ---------------------------------------------------------------- utility ---

function Write-Step { param([string]$Text) Write-Host "`n=== $Text" -ForegroundColor Cyan }
function Write-Ok   { param([string]$Text) Write-Host "  + $Text" -ForegroundColor Green }
function Write-Skip { param([string]$Text) Write-Host "  = $Text" -ForegroundColor DarkGray }
function Write-Bad  { param([string]$Text) Write-Host "  ! $Text" -ForegroundColor Yellow }

function ConvertTo-IsoDate {
    param([string]$Value)
    if ([string]::IsNullOrWhiteSpace($Value)) { return $null }
    $culture = [Globalization.CultureInfo]::InvariantCulture
    return ([datetime]::ParseExact($Value.Trim(), 'MMM d, yyyy', $culture)).ToString('yyyy-MM-dd')
}

function ConvertTo-Slug {
    param([string]$Value)
    $s = $Value.ToLowerInvariant()
    $s = $s -replace '[^a-z0-9]+', '-'
    return $s.Trim('-')
}

# Windows PowerShell 5.1 non sa deserializzare un JSON multiriga arrivato dalla
# pipeline riga per riga: va ricomposto in una stringa unica con Out-String.
function Invoke-GhJson {
    # Gli argomenti si passano come array esplicito: con ValueFromRemainingArguments
    # PowerShell interpreta le virgole come operatore array e fonde i token
    # ("--json title,url" diventerebbe il campo inesistente "title url").
    param([Parameter(Mandatory = $true)][string[]]$GhArgs)
    $out = (& gh @GhArgs 2>&1 | Out-String)
    if ($LASTEXITCODE -ne 0) { throw "gh $($GhArgs -join ' ') -> $out" }
    if ([string]::IsNullOrWhiteSpace($out)) { return $null }
    return ($out | ConvertFrom-Json)
}

# ------------------------------------------------------------ prerequisiti ---

Write-Step 'Controllo prerequisiti'

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI non trovato. Installa con: winget install --id GitHub.cli"
}

gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Non sei autenticato. Esegui: gh auth login" }
Write-Ok 'GitHub CLI autenticato'

if (-not $Repo) {
    $remote = (git remote get-url origin 2>$null)
    if (-not $remote) { throw "Nessun remote 'origin'. Passa il repo con -Repo owner/nome" }
    if ($remote -match 'github\.com[:/](?<o>[^/]+)/(?<r>[^/.]+)') {
        $Repo = "$($Matches.o)/$($Matches.r)"
    } else {
        throw "Remote non riconosciuto: $remote"
    }
}
if (-not $Owner) { $Owner = $Repo.Split('/')[0] }
Write-Ok "Repository: $Repo"
Write-Ok "Owner:      $Owner"

$tsvPath = Join-Path $PSScriptRoot 'backlog.tsv'
if (-not (Test-Path $tsvPath)) { throw "File non trovato: $tsvPath" }

$rows = @(Import-Csv -Path $tsvPath -Delimiter "`t")
Write-Ok "Righe lette: $($rows.Count)"

# Posizione di ogni riga nel backlog. Diventa il campo "Ordine" del Project:
# senza, raggruppando o filtrando la board l'ordine M1 -> M10 si perde.
$orderByTitle = @{}
$n = 0
foreach ($r in $rows) { $n++; $orderByTitle[$r.Title.Trim()] = $n }

# ------------------------------------------------------- classifica righe ---

$milestoneRows  = @($rows | Where-Object { $_.Title -match '^M\d+ - ' -and $_.Title -notmatch '^M\d+ - T\d+ ' })
$taskRows       = @($rows | Where-Object { $_.Title -match '^M\d+ - T\d+ ' })
$checkpointRows = @($rows | Where-Object { $_.Title -match '^Milestone - ' })

Write-Ok "Milestone: $($milestoneRows.Count) | Task: $($taskRows.Count) | Checkpoint: $($checkpointRows.Count)"

# Mappa M1 -> titolo completo della milestone
$milestoneByCode = @{}
foreach ($m in $milestoneRows) {
    $code = ($m.Title -split ' - ')[0]
    $milestoneByCode[$code] = $m.Title
}

# --------------------------------------------------------------- 1. label ---

Write-Step '1/4  Label'

$labelColors = @{
    'setup'      = '0E8A16'
    'ui'         = 'D4C5F9'
    'layout'     = 'F9D0C4'
    'content'    = 'FEF2C0'
    'projects'   = 'C5DEF5'
    'case-study' = 'BFDADC'
    'home'       = 'FFD8B1'
    'pages'      = 'E4E669'
    'qa'         = 'D93F0B'
    'checkpoint' = '5319E7'
    'P0'         = 'B60205'
    'P1'         = 'FBCA04'
    'P2'         = '0E8A16'
}

$existingLabels = @(gh label list --repo $Repo --limit 200 --json name --jq '.[].name' 2>$null)

$wanted = New-Object System.Collections.Generic.List[string]
foreach ($r in $rows) {
    foreach ($l in ($r.Labels -split ',')) {
        $l = $l.Trim()
        if ($l -and $l -ne 'milestone' -and -not $wanted.Contains($l)) { $wanted.Add($l) }
    }
    if ($r.Priority) {
        $p = $r.Priority.Trim()
        if ($p -and -not $wanted.Contains($p)) { $wanted.Add($p) }
    }
}

foreach ($label in $wanted) {
    if ($existingLabels -contains $label) { Write-Skip "label $label"; continue }
    $color = if ($labelColors.ContainsKey($label)) { $labelColors[$label] } else { '1D76DB' }
    $desc  = if ($label -match '^M\d+$') { "Milestone $label" } else { $label }
    gh label create $label --repo $Repo --color $color --description $desc --force | Out-Null
    Write-Ok "label $label"
}

# ----------------------------------------------------------- 2. milestone ---

Write-Step '2/4  Milestone GitHub'

$existingMilestones = @(gh api "repos/$Repo/milestones?state=all&per_page=100" --jq '.[].title' 2>$null)

foreach ($m in $milestoneRows) {
    if ($existingMilestones -contains $m.Title) { Write-Skip $m.Title; continue }
    $due   = ConvertTo-IsoDate $m.'Target date'
    $start = ConvertTo-IsoDate $m.'Data Inizio'
    gh api "repos/$Repo/milestones" -X POST `
        -f title="$($m.Title)" `
        -f state='open' `
        -f description="Periodo: $start -> $due" `
        -f due_on="${due}T23:59:59Z" | Out-Null
    Write-Ok $m.Title
}

# --------------------------------------------------------------- 3. issue ---

Write-Step '3/4  Issue'

$existing = @(Invoke-GhJson @('issue', 'list', '--repo', $Repo, '--state', 'all', '--limit', '500', '--json', 'title,url'))
$urlByTitle = @{}
foreach ($e in $existing) { $urlByTitle[$e.title] = $e.url }

$issueEntries = New-Object System.Collections.Generic.List[object]
# Nell'ordine del TSV, non prima i task e poi i checkpoint: cosi i numeri
# delle issue su GitHub seguono la sequenza reale del backlog.
$issueRows = @($rows | Where-Object { $_.Title -match '^M\d+ - T\d+ ' -or $_.Title -match '^Milestone - ' })
if ($Limit -gt 0) {
    $issueRows = @($issueRows | Select-Object -First $Limit)
    Write-Bad "Modalita prova: solo le prime $Limit issue"
}

foreach ($row in $issueRows) {
    $title = $row.Title.Trim()

    if ($urlByTitle.ContainsKey($title)) {
        Write-Skip $title
        $issueEntries.Add([pscustomobject]@{ Row = $row; Url = $urlByTitle[$title] })
        continue
    }

    $start = ConvertTo-IsoDate $row.'Data Inizio'
    $due   = ConvertTo-IsoDate $row.'Target date'
    $prio  = if ($row.Priority) { $row.Priority.Trim() } else { '-' }

    $msTitle = $null
    $docName = $null

    if ($title -match '^M(?<m>\d+) - T(?<t>\d+) (?<rest>.+)$') {
        $mNum   = $Matches.m
        $tNum   = $Matches.t
        $rest   = $Matches.rest
        $words  = @($rest -split '\s+')
        $branch = "feat/m$mNum-t$tNum-" + (ConvertTo-Slug (($words | Select-Object -First 4) -join ' '))
        $msTitle = $milestoneByCode["M$mNum"]
        $docName = "M$mNum-T$tNum" + '_' + ((($words | Select-Object -First 3) -join '_') -replace '[^A-Za-z0-9_]', '')
    }
    else {
        $branch = 'chore/' + (ConvertTo-Slug $title)
    }

    $bodyLines = New-Object System.Collections.Generic.List[string]
    $bodyLines.Add("**Periodo:** $start -> $due")
    $bodyLines.Add("**Priorita:** $prio")
    if ($msTitle) { $bodyLines.Add("**Milestone:** $msTitle") }
    $bodyLines.Add('')
    $bodyLines.Add('### Definition of Done')
    $bodyLines.Add('')
    $bodyLines.Add('- [ ] Implementazione coerente con `docs/struttura-portfolio.md`')
    $bodyLines.Add('- [ ] `npm run check` verde (typecheck + lint + test)')
    $bodyLines.Add("- [ ] Branch ``$branch`` mergiato tramite Pull Request")
    if ($docName) { $bodyLines.Add("- [ ] Documento ``docs/tasks/$docName.docx`` scritto e committato") }
    $bodyLines.Add('')
    $bodyLines.Add('---')
    $bodyLines.Add('')
    $bodyLines.Add('Issue generata da `scripts/bootstrap-backlog.ps1`.')
    $body = $bodyLines -join "`n"

    $ghArgs = @('issue', 'create', '--repo', $Repo, '--title', $title, '--body', $body)
    foreach ($l in ($row.Labels -split ',')) {
        $l = $l.Trim()
        if ($l -and $l -ne 'milestone') { $ghArgs += @('--label', $l) }
    }
    if ($row.Priority) { $ghArgs += @('--label', $row.Priority.Trim()) }
    if ($msTitle)      { $ghArgs += @('--milestone', $msTitle) }
    if ($Assignee)     { $ghArgs += @('--assignee', $Assignee) }

    $url = (& gh @ghArgs 2>&1) | Select-Object -Last 1
    if ($LASTEXITCODE -ne 0) {
        Write-Bad "$title  ->  $url"
        continue
    }
    Write-Ok $title
    $issueEntries.Add([pscustomobject]@{ Row = $row; Url = "$url" })
}

Write-Host "`n  Issue disponibili: $($issueEntries.Count)" -ForegroundColor Cyan

# ------------------------------------------------------------- 4. project ---

if ($SkipProject) {
    Write-Step 'Project saltato (-SkipProject)'
    Write-Host "`nFatto." -ForegroundColor Green
    return
}

Write-Step '4/4  GitHub Project'

$authInfo = (gh auth status 2>&1 | Out-String)
if ($authInfo -notmatch 'project') {
    Write-Bad "Manca lo scope 'project'."
    Write-Bad "Esegui:  gh auth refresh -s project  poi rilancia lo script."
    return
}

$projectList = Invoke-GhJson @('project', 'list', '--owner', $Owner, '--format', 'json')
$project = $projectList.projects | Where-Object { $_.title -eq $ProjectTitle } | Select-Object -First 1

if (-not $project) {
    $project = Invoke-GhJson @('project', 'create', '--owner', $Owner, '--title', $ProjectTitle, '--format', 'json')
    Write-Ok "Project creato: $ProjectTitle (#$($project.number))"
} else {
    Write-Skip "Project esistente: $ProjectTitle (#$($project.number))"
}

$projNumber = $project.number
$projId     = $project.id

$fieldListArgs = @('project', 'field-list', "$projNumber", '--owner', $Owner, '--limit', '60', '--format', 'json')
$fields = (Invoke-GhJson $fieldListArgs).fields

function Get-ProjectField {
    param([string]$Name, $All)
    return ($All | Where-Object { $_.name -eq $Name } | Select-Object -First 1)
}

if (-not (Get-ProjectField 'Data Inizio' $fields)) {
    gh project field-create $projNumber --owner $Owner --name 'Data Inizio' --data-type DATE | Out-Null
    Write-Ok 'campo "Data Inizio"'
}
if (-not (Get-ProjectField 'Target date' $fields)) {
    gh project field-create $projNumber --owner $Owner --name 'Target date' --data-type DATE | Out-Null
    Write-Ok 'campo "Target date"'
}
if (-not (Get-ProjectField 'Priority' $fields)) {
    gh project field-create $projNumber --owner $Owner --name 'Priority' `
        --data-type SINGLE_SELECT --single-select-options 'P0,P1,P2' | Out-Null
    Write-Ok 'campo "Priority"'
}
if (-not (Get-ProjectField 'Ordine' $fields)) {
    gh project field-create $projNumber --owner $Owner --name 'Ordine' --data-type NUMBER | Out-Null
    Write-Ok 'campo "Ordine"'
}

$fields    = (Invoke-GhJson $fieldListArgs).fields
$fStart    = Get-ProjectField 'Data Inizio' $fields
$fTarget   = Get-ProjectField 'Target date' $fields
$fPriority = Get-ProjectField 'Priority'    $fields
$fOrdine   = Get-ProjectField 'Ordine'      $fields
$fStatus   = Get-ProjectField 'Status'      $fields

$existingItems = (Invoke-GhJson @('project', 'item-list', "$projNumber", '--owner', $Owner, '--limit', '500', '--format', 'json')).items

$i = 0
$total = $issueEntries.Count
foreach ($entry in $issueEntries) {
    $i++
    $row = $entry.Row
    $url = $entry.Url
    if (-not $url) { continue }

    $item = $existingItems | Where-Object { $_.content.url -eq $url } | Select-Object -First 1
    if ($item) {
        $itemId = $item.id
    } else {
        $added  = Invoke-GhJson @('project', 'item-add', "$projNumber", '--owner', $Owner, '--url', $url, '--format', 'json')
        $itemId = $added.id
    }

    $pct = [math]::Round(($i / $total) * 100)
    Write-Host ("  [{0,3}%] {1}" -f $pct, $row.Title) -ForegroundColor DarkGray

    $start = ConvertTo-IsoDate $row.'Data Inizio'
    $due   = ConvertTo-IsoDate $row.'Target date'

    if ($start -and $fStart) {
        gh project item-edit --id $itemId --project-id $projId --field-id $fStart.id --date $start | Out-Null
    }
    if ($due -and $fTarget) {
        gh project item-edit --id $itemId --project-id $projId --field-id $fTarget.id --date $due | Out-Null
    }
    if ($fOrdine) {
        $ord = $orderByTitle[$row.Title.Trim()]
        if ($ord) {
            gh project item-edit --id $itemId --project-id $projId --field-id $fOrdine.id --number $ord | Out-Null
        }
    }
    if ($row.Priority -and $fPriority) {
        $opt = $fPriority.options | Where-Object { $_.name -eq $row.Priority.Trim() } | Select-Object -First 1
        if ($opt) {
            gh project item-edit --id $itemId --project-id $projId --field-id $fPriority.id `
                --single-select-option-id $opt.id | Out-Null
        }
    }
    if ($row.Status -and $fStatus) {
        $opt = $fStatus.options | Where-Object { $_.name -eq $row.Status.Trim() } | Select-Object -First 1
        if ($opt) {
            gh project item-edit --id $itemId --project-id $projId --field-id $fStatus.id `
                --single-select-option-id $opt.id | Out-Null
        }
    }
}

Write-Host "`nFatto." -ForegroundColor Green
Write-Host "Project: $($project.url)" -ForegroundColor Green
Write-Host "Issue:   https://github.com/$Repo/issues" -ForegroundColor Green
