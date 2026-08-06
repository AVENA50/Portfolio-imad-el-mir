"use client";

import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import {
  Canvas,
  extend,
  useFrame,
  useThree,
  type ThreeElement,
  type ThreeEvent,
} from "@react-three/fiber";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from "@react-three/rapier";
import {
  MeshLineGeometry,
  MeshLineMaterial,
  type MeshLineMaterialParameters,
} from "meshline";
import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import { CatmullRomCurve3, Vector2, Vector3, type Mesh } from "three";

import { useBadgeTexture, useBandTexture } from "./lanyard-textures";

/**
 * Badge appeso al cordino, trascinabile.
 *
 * Come funziona, in una riga: quattro corpi rigidi collegati da giunti a
 * corda formano il cordino, un quinto corpo e la card, e una curva di
 * Catmull-Rom passa per le loro posizioni per disegnare il nastro. La
 * fisica la calcola Rapier (WebAssembly); noi ci limitiamo a leggere dove
 * sono finiti i corpi a ogni frame.
 *
 * **Questo file e volutamente pesante e volutamente isolato.** Rapier,
 * three e i moduli @react-three/* insieme superano il megabyte: se questo
 * componente venisse importato normalmente finirebbe nel bundle di ogni
 * pagina. Per questo l'unico modo di usarlo e `lanyard.tsx`, che lo carica
 * con `next/dynamic` solo quando la sezione entra nello schermo.
 */

extend({ MeshLineGeometry, MeshLineMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}

const MODEL_URL = "/models/card.glb";

/**
 * Le tre mesh del modello, senza materiali.
 *
 * Il GLB e stato ripulito: contiene solo geometria, e ogni superficie la
 * vestiamo qui. Il vantaggio non e solo il peso — significa che i colori
 * della card seguono i token del sito invece di essere cotti dentro un
 * file binario che nessuno puo piu modificare.
 */
interface CardModel {
  nodes: {
    card: Mesh;
    clip: Mesh;
    clamp: Mesh;
  };
}

/**
 * Faccia stampata della card, misurata sul modello:
 * x da -0.3582 a 0.3582, y da 0.0229 a 1.0229, fronte a z 0.0054.
 * Il piano sta 0.0008 davanti alla superficie — abbastanza da non
 * litigare con lo z-buffer, troppo poco perche si veda lo stacco.
 */
const BADGE_FACE = {
  width: 0.7164,
  height: 1.0,
  y: 0.5229,
  z: 0.0062,
} as const;

const SEGMENT = {
  type: "dynamic",
  canSleep: true,
  colliders: false,
  angularDamping: 4,
  linearDamping: 4,
} as const;

/** Quanti punti della curva finiscono nel nastro. 32 e gia liscio. */
const CURVE_RESOLUTION = 32;

/**
 * I giunti di Rapier dichiarano ref **non nulli**, ma qualunque ref parte
 * da null e si riempie al montaggio. Non e una svista della libreria: i
 * suoi hook controllano da soli che i due corpi esistano prima di creare
 * il giunto. Questa funzione concentra il cast in un punto, con la sua
 * spiegazione, invece di spargere `as` su quattro chiamate.
 */
function body(ref: RefObject<RapierRigidBody | null>) {
  return ref as RefObject<RapierRigidBody>;
}

interface BandProps {
  name: string;
  role: string;
  footer: string;
  photoUrl?: string;
  /** Etichetta ripetuta sul nastro. */
  bandLabel: string;
}

function Band({ name, role, footer, photoUrl, bandLabel }: BandProps) {
  const band = useRef<Mesh<MeshLineGeometry, MeshLineMaterial>>(null);
  const fixed = useRef<RapierRigidBody>(null);
  const j1 = useRef<RapierRigidBody>(null);
  const j2 = useRef<RapierRigidBody>(null);
  const j3 = useRef<RapierRigidBody>(null);
  const card = useRef<RapierRigidBody>(null);

  /**
   * Vettori riusati a ogni frame.
   *
   * `useFrame` gira 60 volte al secondo: allocare qui dentro sei Vector3
   * significa creare 360 oggetti al secondo da dare in pasto al garbage
   * collector, e il garbage collector si fa sentire con micro-scatti.
   * Vivono nei ref e vengono sovrascritti.
   */
  const pointer = useRef(new Vector3());
  const direction = useRef(new Vector3());
  const angular = useRef(new Vector3());
  const rotation = useRef(new Vector3());
  const lerped1 = useRef(new Vector3());
  const lerped2 = useRef(new Vector3());
  const seeded = useRef(false);

  const { nodes } = useGLTF(MODEL_URL) as unknown as CardModel;
  const badge = useBadgeTexture({ name, role, footer, photoUrl });
  const bandTexture = useBandTexture(bandLabel);

  const { width, height } = useThree((state) => state.size);

  /**
   * Argomenti del costruttore del materiale, creati **una volta sola**.
   *
   * r3f ricostruisce l'oggetto quando `args` cambia identita: un array
   * scritto inline sarebbe nuovo a ogni render, e il materiale del nastro
   * verrebbe distrutto e ricreato sessanta volte al secondo. Il valore
   * iniziale qui serve solo a soddisfare il costruttore; quello vero, che
   * segue i ridimensionamenti, arriva dalla prop `resolution`.
   */
  const [materialArgs] = useState<[MeshLineMaterialParameters]>(() => [
    { resolution: new Vector2(width, height) },
  ]);

  const [curve] = useState(() => {
    const created = new CatmullRomCurve3([
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
    ]);
    // "chordal" distribuisce i punti in base alla distanza reale: con la
    // parametrizzazione uniforme il nastro fa gomiti quando i segmenti
    // hanno lunghezze molto diverse, cioe proprio mentre lo si trascina.
    created.curveType = "chordal";
    return created;
  });

  /** Offset fra il punto afferrato e il centro della card. */
  const grab = useRef<Vector3 | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  /**
   * Il cursore e roba del DOM, non della scena.
   *
   * Sta in un effetto e non nel render perche toccare `document.body`
   * mentre React calcola l'albero e un effetto collaterale: quel render
   * puo essere scartato, e il cursore resterebbe "grabbing" su una pagina
   * che nessuno sta trascinando. La pulizia lo rimette a posto anche se il
   * componente sparisce a meta trascinamento.
   */
  useEffect(() => {
    if (!dragging && !hovered) return;

    document.body.style.cursor = dragging ? "grabbing" : "grab";
    return () => {
      document.body.style.cursor = "";
    };
  }, [dragging, hovered]);

  // Tre corde uguali fanno il cordino, un giunto sferico attacca la card:
  // e la differenza fra un nastro che si piega e una card che oscilla.
  useRopeJoint(body(fixed), body(j1), [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(body(j1), body(j2), [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(body(j2), body(j3), [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(body(j3), body(card), [
    [0, 0, 0],
    [0, 1.45, 0],
  ]);

  useFrame((state, delta) => {
    const fixedBody = fixed.current;
    const body1 = j1.current;
    const body2 = j2.current;
    const body3 = j3.current;
    const cardBody = card.current;
    const bandMesh = band.current;

    if (!fixedBody || !body1 || !body2 || !body3 || !cardBody || !bandMesh) {
      return;
    }

    if (dragging && grab.current) {
      // Dal puntatore 2D al punto 3D sul piano della card: si proietta il
      // puntatore nella scena e si avanza lungo quella direzione fino alla
      // distanza a cui sta la camera.
      pointer.current
        .set(state.pointer.x, state.pointer.y, 0.5)
        .unproject(state.camera);
      direction.current
        .copy(pointer.current)
        .sub(state.camera.position)
        .normalize();
      pointer.current.add(
        direction.current.multiplyScalar(state.camera.position.length()),
      );

      for (const body of [cardBody, body1, body2, body3, fixedBody]) {
        body.wakeUp();
      }

      cardBody.setNextKinematicTranslation({
        x: pointer.current.x - grab.current.x,
        y: pointer.current.y - grab.current.y,
        z: pointer.current.z - grab.current.z,
      });
    }

    // I due punti centrali della curva seguono i giunti in ritardo: senza
    // questo smorzamento il nastro tremola, perche la fisica corregge le
    // posizioni a scatti e la curva le copia pari pari.
    if (!seeded.current) {
      lerped1.current.copy(body1.translation());
      lerped2.current.copy(body2.translation());
      seeded.current = true;
    }

    for (const [body, lerped] of [
      [body1, lerped1.current],
      [body2, lerped2.current],
    ] as const) {
      const position = body.translation();
      // Piu il punto e lontano dal bersaglio, piu in fretta lo raggiunge:
      // reagisce agli strattoni senza vibrare quando e quasi fermo.
      const distance = Math.max(0.1, Math.min(1, lerped.distanceTo(position)));
      lerped.lerp(position, delta * distance * 50);
    }

    curve.points[0]?.copy(body3.translation());
    curve.points[1]?.copy(lerped2.current);
    curve.points[2]?.copy(lerped1.current);
    curve.points[3]?.copy(fixedBody.translation());
    bandMesh.geometry.setPoints(curve.getPoints(CURVE_RESOLUTION));

    // Frena la rotazione sull'asse verticale: senza, la card continua a
    // girare su se stessa all'infinito e non torna mai a mostrare la faccia.
    angular.current.copy(cardBody.angvel());
    rotation.current.copy(cardBody.rotation());
    cardBody.setAngvel(
      {
        x: angular.current.x,
        y: angular.current.y - rotation.current.y * 0.25,
        z: angular.current.z,
      },
      true,
    );
  });

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...SEGMENT} type="fixed" />

        <RigidBody position={[0.5, 0, 0]} ref={j1} {...SEGMENT}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...SEGMENT}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...SEGMENT}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...SEGMENT}
          type={dragging ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />

          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerUp={(event: ThreeEvent<PointerEvent>) => {
              (event.target as HTMLElement).releasePointerCapture(
                event.pointerId,
              );
              grab.current = null;
              setDragging(false);
            }}
            // Il puntatore viene "catturato": da qui in poi gli eventi
            // arrivano qui anche se il dito esce dal canvas. Senza, la card
            // resta incollata al cursore quando trascini oltre il bordo.
            onPointerDown={(event: ThreeEvent<PointerEvent>) => {
              (event.target as HTMLElement).setPointerCapture(event.pointerId);
              const translation = card.current?.translation();
              if (!translation) return;
              grab.current = new Vector3()
                .copy(event.point)
                .sub(new Vector3(translation.x, translation.y, translation.z));
              setDragging(true);
            }}
          >
            {/* Corpo della card: plastica scura con vernice trasparente
                sopra, come un badge plastificato vero. */}
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                color="#0b0e1a"
                clearcoat={1}
                clearcoatRoughness={0.16}
                roughness={0.5}
                metalness={0.2}
              />
            </mesh>

            {/* La stampa: un piano appoggiato sulla faccia, con la texture
                disegnata a runtime. `transparent` serve agli angoli, che
                nel canvas sono vuoti per lasciar vedere la plastica. */}
            {badge && (
              <mesh position={[0, BADGE_FACE.y, BADGE_FACE.z]} renderOrder={1}>
                <planeGeometry args={[BADGE_FACE.width, BADGE_FACE.height]} />
                <meshStandardMaterial
                  map={badge}
                  transparent
                  roughness={0.42}
                  metalness={0.04}
                  polygonOffset
                  polygonOffsetFactor={-4}
                />
              </mesh>
            )}

            <mesh geometry={nodes.clip.geometry}>
              <meshStandardMaterial
                color="#aab4c6"
                metalness={0.9}
                roughness={0.28}
              />
            </mesh>
            <mesh geometry={nodes.clamp.geometry}>
              <meshStandardMaterial
                color="#aab4c6"
                metalness={0.9}
                roughness={0.28}
              />
            </mesh>
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          args={materialArgs}
          color="white"
          depthTest={false}
          // La risoluzione serve a meshline per tenere lo spessore costante
          // in pixel: senza, il nastro si assottiglia ridimensionando.
          resolution={[width, height]}
          useMap={bandTexture ? 1 : 0}
          map={bandTexture ?? undefined}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}

export interface LanyardSceneProps {
  name: string;
  role: string;
  footer: string;
  photoUrl?: string;
  bandLabel: string;
  /** Testo per chi usa uno screen reader: il 3D di per se non dice nulla. */
  ariaLabel: string;
  /** Ferma il ciclo di rendering quando la scena non e sullo schermo. */
  paused?: boolean;
  className?: string;
}

/**
 * Il canvas.
 *
 * `dpr` e limitato a 1.5: su uno schermo Retina il valore vero e 2 o 3, e
 * significa rendere quattro o nove volte i pixel per una differenza che
 * su una scena scura e sfocata non si vede. E la singola impostazione che
 * pesa di piu sui portatili.
 */
export default function LanyardScene({
  name,
  role,
  footer,
  photoUrl,
  bandLabel,
  ariaLabel,
  paused = false,
  className,
}: LanyardSceneProps) {
  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0, 30], fov: 20 }}
      // `never` non e "nascondi": e "non chiamare piu requestAnimationFrame".
      // La differenza si misura in batteria, perche un canvas invisibile che
      // continua a calcolare fisica consuma esattamente quanto uno visibile.
      frameloop={paused ? "never" : "always"}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      aria-label={ariaLabel}
      role="img"
    >
      <ambientLight intensity={Math.PI} />

      <Suspense fallback={null}>
        <Physics gravity={[0, -40, 0]} timeStep={1 / 60}>
          <Band
            name={name}
            role={role}
            footer={footer}
            photoUrl={photoUrl}
            bandLabel={bandLabel}
          />
        </Physics>

        {/* Ambiente costruito a mano invece di una HDRI scaricata: quattro
            luci piatte pesano zero e bastano a far brillare la vernice e
            il metallo della clip. `frames={1}` lo calcola una volta sola. */}
        <Environment blur={0.75} frames={1}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="#c4b5fd"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
