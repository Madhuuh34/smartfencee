import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useFarm } from '../../context/FarmContext';
import { ANIMALS, FARM_ZONES, WATER_PUMP_LOCATION } from '../../data/farmData';
import { Eye, Maximize2, Moon, RotateCcw, Sun, Volume2, VolumeX, Zap } from 'lucide-react';

interface Droplet {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
}

interface SplashParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
}

export const FarmScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    stage,
    selectedAnimal,
    isNightMode,
    isWaterSpraying,
    animalWorldPos,
    animalHeadingDeg,
    historicalTrail,
    setIsNightMode,
    isMuted,
    setIsMuted,
    testWaterSpray,
    stopWaterSpray,
  } = useFarm();

  // Floating screen projection state for the HUD bounding box
  const [hudScreenPos, setHudScreenPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  const [activeCamPreset, setActiveCamPreset] = useState<'iso' | 'nozzle' | 'top' | 'camera2'>('iso');

  // References to Three.js entities
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animalGroupRef = useRef<THREE.Group | null>(null);
  const legRefs = useRef<THREE.Mesh[]>([]);
  const headRef = useRef<THREE.Mesh | null>(null);
  const tailRef = useRef<THREE.Mesh | null>(null);
  const trunkRef = useRef<THREE.Group | null>(null);
  const earsRef = useRef<THREE.Group | null>(null);
  const nozzleMeshRef = useRef<THREE.Group | null>(null);
  const pumpLightRef = useRef<THREE.PointLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const trailLineRef = useRef<THREE.Line | null>(null);

  // Particles for water spray
  const dropletsRef = useRef<Droplet[]>([]);
  const splashesRef = useRef<SplashParticle[]>([]);
  const sprayPointsRef = useRef<THREE.Points | null>(null);
  const splashPointsRef = useRef<THREE.Points | null>(null);

  // Initialize Three.js scene once
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isNightMode ? 0x050c0a : 0x0b1a15);
    scene.fog = new THREE.FogExp2(isNightMode ? 0x050c0a : 0x0c201a, 0.015);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 200);
    camera.position.set(22, 20, 26);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1; // Don't go below ground
    controls.minDistance = 6;
    controls.maxDistance = 60;
    controls.target.set(6, 1, 0); // Focus near deterrence buffer zone
    controlsRef.current = controls;

    // --- LIGHTS ---
    const hemiLight = new THREE.HemisphereLight(0xd9f99d, 0x064e3b, isNightMode ? 0.35 : 0.85);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfffaed, isNightMode ? 0.3 : 1.4);
    dirLight.position.set(20, 35, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 5;
    dirLight.shadow.camera.far = 70;
    dirLight.shadow.camera.left = -25;
    dirLight.shadow.camera.right = 25;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -25;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Ambient farm perimeter neon glow
    const perimeterLight = new THREE.PointLight(0x10b981, 1.2, 40);
    perimeterLight.position.set(0, 4, 0);
    scene.add(perimeterLight);

    // --- TERRAIN & FARM BASE ---
    const groundGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x142b22,
      roughness: 0.85,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid lines for agricultural soil rows
    const gridHelper = new THREE.GridHelper(56, 28, 0x10b981, 0x164e3e);
    gridHelper.position.y = 0.02;
    scene.add(gridHelper);

    // --- CROP FIELDS & ORCHARDS ---
    // Zone A: Orchards (Trees)
    const treeGeo = new THREE.ConeGeometry(0.8, 1.8, 6);
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.7 });
    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.8, 5);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });

    for (let x = -14; x <= -2; x += 3.5) {
      for (let z = -14; z <= -3; z += 3.5) {
        const treeGroup = new THREE.Group();
        const foliage = new THREE.Mesh(treeGeo, treeMat);
        foliage.position.y = 1.3;
        foliage.castShadow = true;
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.4;
        trunk.castShadow = true;
        treeGroup.add(trunk, foliage);
        treeGroup.position.set(x + (Math.random() - 0.5) * 0.4, 0, z + (Math.random() - 0.5) * 0.4);
        scene.add(treeGroup);
      }
    }

    // Zone B: Cornfields (Green crop ridges)
    const cropRowGeo = new THREE.BoxGeometry(0.4, 0.6, 14);
    const cropRowMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    for (let x = 6; x <= 18; x += 2.2) {
      const row = new THREE.Mesh(cropRowGeo, cropRowMat);
      row.position.set(x, 0.3, -4);
      row.castShadow = true;
      row.receiveShadow = true;
      scene.add(row);
    }

    // Zone C: South Vegetable Beds
    const vegBedGeo = new THREE.BoxGeometry(6, 0.15, 2);
    const vegBedMat = new THREE.MeshStandardMaterial({ color: 0x1e3a2b, roughness: 0.9 });
    for (let z = 6; z <= 14; z += 3.5) {
      const bed = new THREE.Mesh(vegBedGeo, vegBedMat);
      bed.position.set(-6, 0.08, z);
      bed.receiveShadow = true;
      scene.add(bed);
    }

    // --- FENCE POSTS & GLOWING EMERALD PERIMETER WIRE ---
    const fencePostsGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6);
    const fencePostMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });
    const postPositions = [
      [-19, -19], [0, -19], [19, -19],
      [19, 0], [19, 19],
      [0, 19], [-19, 19],
      [-19, 0],
    ];

    postPositions.forEach(([px, pz]) => {
      const post = new THREE.Mesh(fencePostsGeo, fencePostMat);
      post.position.set(px, 0.8, pz);
      post.castShadow = true;
      scene.add(post);

      // Glowing sensor cap
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x10b981 })
      );
      cap.position.set(px, 1.65, pz);
      scene.add(cap);
    });

    // Outer boundary glowing perimeter polyline
    const boundaryPoints = [
      new THREE.Vector3(-19, 0.8, -19),
      new THREE.Vector3(19, 0.8, -19),
      new THREE.Vector3(19, 0.8, 19),
      new THREE.Vector3(-19, 0.8, 19),
      new THREE.Vector3(-19, 0.8, -19),
    ];
    const boundaryGeo = new THREE.BufferGeometry().setFromPoints(boundaryPoints);
    const boundaryMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });
    const boundaryLine = new THREE.Line(boundaryGeo, boundaryMat);
    scene.add(boundaryLine);

    // --- CAMERA POLES ---
    const camPoleGeo = new THREE.CylinderGeometry(0.1, 0.12, 3.2, 8);
    const camPoleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 });
    const camHeadGeo = new THREE.BoxGeometry(0.4, 0.25, 0.6);
    const camHeadMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });

    const cameraConfigs = [
      { pos: [0, 1.6, -16], rotY: Math.PI },
      { pos: [16, 1.6, -2], rotY: -Math.PI / 2 },
      { pos: [-4, 1.6, 15], rotY: 0 },
      { pos: [-17, 1.6, 0], rotY: Math.PI / 2 },
    ];

    cameraConfigs.forEach((cfg) => {
      const camPole = new THREE.Mesh(camPoleGeo, camPoleMat);
      camPole.position.set(cfg.pos[0], 1.6, cfg.pos[2]);
      camPole.castShadow = true;
      scene.add(camPole);

      const camHead = new THREE.Mesh(camHeadGeo, camHeadMat);
      camHead.position.set(cfg.pos[0], 3.2, cfg.pos[2]);
      camHead.rotation.y = cfg.rotY;
      camHead.castShadow = true;
      scene.add(camHead);

      // Camera lens light
      const lensLight = new THREE.PointLight(0x06b6d4, 0.6, 6);
      lensLight.position.set(cfg.pos[0], 3.2, cfg.pos[2]);
      scene.add(lensLight);
    });

    // --- ULTRASONIC SENSOR NODES ---
    const usGeo = new THREE.BoxGeometry(0.3, 0.5, 0.2);
    const usMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
    const usNode = new THREE.Mesh(usGeo, usMat);
    usNode.position.set(11, 0.9, -1);
    scene.add(usNode);

    // Ultrasonic telemetry pulse ring
    const ringGeo = new THREE.RingGeometry(0.4, 0.55, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
    const usRing = new THREE.Mesh(ringGeo, ringMat);
    usRing.position.set(11, 0.9, -1);
    usRing.rotation.x = Math.PI / 2;
    scene.add(usRing);

    // --- WATER PUMP STATION & SPRAY NOZZLE ---
    const pumpGroup = new THREE.Group();
    pumpGroup.position.set(
      WATER_PUMP_LOCATION.worldPos[0],
      WATER_PUMP_LOCATION.worldPos[1],
      WATER_PUMP_LOCATION.worldPos[2]
    );

    // Water tank (cylindrical tank with cyan accent)
    const tankGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.4, 16);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.3 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(0, 1.2, 0);
    tank.castShadow = true;
    pumpGroup.add(tank);

    // Tank level stripe
    const stripeGeo = new THREE.CylinderGeometry(1.21, 1.21, 0.2, 16);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(0, 1.4, 0);
    pumpGroup.add(stripe);

    // Pump unit enclosure
    const pumpBoxGeo = new THREE.BoxGeometry(0.9, 0.8, 0.9);
    const pumpBoxMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7 });
    const pumpBox = new THREE.Mesh(pumpBoxGeo, pumpBoxMat);
    pumpBox.position.set(1.4, 0.4, 0);
    pumpBox.castShadow = true;
    pumpGroup.add(pumpBox);

    // Pump LED status light
    const pumpLight = new THREE.PointLight(0x10b981, 0.5, 5);
    pumpLight.position.set(1.4, 0.9, 0);
    pumpGroup.add(pumpLight);
    pumpLightRef.current = pumpLight;

    // Delivery Pipe
    const pipeGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.8 });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.position.set(1.4, 1.1, 0);
    pipe.rotation.z = -Math.PI / 3;
    pumpGroup.add(pipe);

    // Spray Nozzle turret (rotates toward target)
    const nozzleGroup = new THREE.Group();
    nozzleGroup.position.set(1.8, 1.4, 0);

    const nozzleHeadGeo = new THREE.ConeGeometry(0.18, 0.5, 8);
    const nozzleHeadMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9 });
    const nozzleHead = new THREE.Mesh(nozzleHeadGeo, nozzleHeadMat);
    nozzleHead.rotation.z = -Math.PI / 2;
    nozzleGroup.add(nozzleHead);

    pumpGroup.add(nozzleGroup);
    nozzleMeshRef.current = nozzleGroup;
    scene.add(pumpGroup);

    // --- WATER SPRAY PARTICLE SYSTEMS ---
    // Main spray droplets
    const maxDroplets = 450;
    const sprayGeo = new THREE.BufferGeometry();
    const sprayPositions = new Float32Array(maxDroplets * 3);
    const sprayColors = new Float32Array(maxDroplets * 3);
    sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPositions, 3));
    sprayGeo.setAttribute('color', new THREE.BufferAttribute(sprayColors, 3));

    const sprayMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const sprayPoints = new THREE.Points(sprayGeo, sprayMat);
    scene.add(sprayPoints);
    sprayPointsRef.current = sprayPoints;

    // Splash particles
    const maxSplashes = 150;
    const splashGeo = new THREE.BufferGeometry();
    const splashPositions = new Float32Array(maxSplashes * 3);
    splashGeo.setAttribute('position', new THREE.BufferAttribute(splashPositions, 3));
    const splashMat = new THREE.PointsMaterial({
      size: 0.18,
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const splashPoints = new THREE.Points(splashGeo, splashMat);
    scene.add(splashPoints);
    splashPointsRef.current = splashPoints;

    // --- HISTORICAL TRAIL LINE ---
    const maxTrailPoints = 120;
    const trailPositions = new Float32Array(maxTrailPoints * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineDashedMaterial({
      color: 0x10b981,
      dashSize: 0.4,
      gapSize: 0.3,
      linewidth: 2,
    });
    const trailLine = new THREE.Line(trailGeo, trailMat);
    scene.add(trailLine);
    trailLineRef.current = trailLine;

    // --- RESIZE HANDLER ---
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Update lighting on Day/Night switch
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current) return;
    sceneRef.current.background = new THREE.Color(isNightMode ? 0x050c0a : 0x0b1a15);
    if (sceneRef.current.fog) {
      sceneRef.current.fog.color = new THREE.Color(isNightMode ? 0x050c0a : 0x0c201a);
    }
    if (hemiLightRef.current) {
      hemiLightRef.current.intensity = isNightMode ? 0.35 : 0.9;
    }
    if (dirLightRef.current) {
      dirLightRef.current.intensity = isNightMode ? 0.3 : 1.4;
      dirLightRef.current.color = new THREE.Color(isNightMode ? 0x93c5fd : 0xfffaed);
    }
  }, [isNightMode]);

  // Build / Rebuild Procedural 3D Animal Model whenever selectedAnimal changes
  useEffect(() => {
    if (!sceneRef.current) return;

    // Remove old animal group
    if (animalGroupRef.current) {
      sceneRef.current.remove(animalGroupRef.current);
    }

    const animalGroup = new THREE.Group();
    const legs: THREE.Mesh[] = [];
    let headMesh: THREE.Mesh | null = null;
    let tailMesh: THREE.Mesh | null = null;
    let trunkGrp: THREE.Group | null = null;
    let earsGrp: THREE.Group | null = null;

    if (selectedAnimal === 'deer') {
      // Deer Model
      const bodyGeo = new THREE.BoxGeometry(1.6, 0.9, 0.7);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.6 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.3;
      body.castShadow = true;
      animalGroup.add(body);

      // Neck & Head
      const neckGeo = new THREE.BoxGeometry(0.35, 0.8, 0.4);
      const neck = new THREE.Mesh(neckGeo, bodyMat);
      neck.position.set(-0.7, 1.8, 0);
      neck.rotation.z = -0.3;
      animalGroup.add(neck);

      const headGeo = new THREE.BoxGeometry(0.6, 0.45, 0.4);
      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.set(-1.0, 2.1, 0);
      head.castShadow = true;
      animalGroup.add(head);
      headMesh = head;

      // Antlers
      const antlerGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.6, 5);
      const antlerMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
      const antlerLeft = new THREE.Mesh(antlerGeo, antlerMat);
      antlerLeft.position.set(-1.0, 2.45, 0.15);
      antlerLeft.rotation.z = -0.4;
      const antlerRight = new THREE.Mesh(antlerGeo, antlerMat);
      antlerRight.position.set(-1.0, 2.45, -0.15);
      antlerRight.rotation.z = -0.4;
      animalGroup.add(antlerLeft, antlerRight);

      // 4 Slender Legs
      const legGeo = new THREE.CylinderGeometry(0.07, 0.06, 1.1, 6);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
      const legOffsets = [
        [-0.55, 0.55, 0.25],
        [-0.55, 0.55, -0.25],
        [0.55, 0.55, 0.25],
        [0.55, 0.55, -0.25],
      ];
      legOffsets.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, ly, lz);
        leg.castShadow = true;
        animalGroup.add(leg);
        legs.push(leg);
      });

      // Small Tail
      const tailGeo = new THREE.ConeGeometry(0.1, 0.35, 5);
      const tailMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7 });
      const tail = new THREE.Mesh(tailGeo, tailMat);
      tail.position.set(0.85, 1.35, 0);
      tail.rotation.z = Math.PI / 3;
      animalGroup.add(tail);
      tailMesh = tail;
    } else if (selectedAnimal === 'wild_boar') {
      // Wild Boar Model
      const bodyGeo = new THREE.BoxGeometry(1.7, 0.95, 0.85);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.85 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.85;
      body.castShadow = true;
      animalGroup.add(body);

      // Snout / Head
      const headGeo = new THREE.ConeGeometry(0.45, 0.9, 6);
      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.set(-1.1, 0.85, 0);
      head.rotation.z = Math.PI / 2;
      head.castShadow = true;
      animalGroup.add(head);
      headMesh = head;

      // Tusks
      const tuskGeo = new THREE.CylinderGeometry(0.03, 0.01, 0.3, 4);
      const tuskMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.2 });
      const tuskLeft = new THREE.Mesh(tuskGeo, tuskMat);
      tuskLeft.position.set(-1.3, 0.75, 0.2);
      tuskLeft.rotation.x = -0.4;
      const tuskRight = new THREE.Mesh(tuskGeo, tuskMat);
      tuskRight.position.set(-1.3, 0.75, -0.2);
      tuskRight.rotation.x = 0.4;
      animalGroup.add(tuskLeft, tuskRight);

      // 4 Sturdy Trot Legs
      const legGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.7, 6);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x27272a });
      const legOffsets = [
        [-0.55, 0.35, 0.3],
        [-0.55, 0.35, -0.3],
        [0.55, 0.35, 0.3],
        [0.55, 0.35, -0.3],
      ];
      legOffsets.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, ly, lz);
        leg.castShadow = true;
        animalGroup.add(leg);
        legs.push(leg);
      });

      // Tail
      const tailGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.4, 4);
      const tail = new THREE.Mesh(tailGeo, bodyMat);
      tail.position.set(0.9, 0.95, 0);
      tail.rotation.z = 0.5;
      animalGroup.add(tail);
      tailMesh = tail;
    } else if (selectedAnimal === 'elephant') {
      // Elephant Model
      const bodyGeo = new THREE.BoxGeometry(2.6, 1.8, 1.4);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 2.0;
      body.castShadow = true;
      animalGroup.add(body);

      // Head
      const headGeo = new THREE.BoxGeometry(1.1, 1.1, 1.1);
      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.set(-1.6, 2.3, 0);
      head.castShadow = true;
      animalGroup.add(head);
      headMesh = head;

      // Large Floppy Ears
      const earGroup = new THREE.Group();
      const earGeo = new THREE.BoxGeometry(0.15, 1.1, 0.9);
      const earLeft = new THREE.Mesh(earGeo, bodyMat);
      earLeft.position.set(-1.6, 2.3, 0.75);
      const earRight = new THREE.Mesh(earGeo, bodyMat);
      earRight.position.set(-1.6, 2.3, -0.75);
      earGroup.add(earLeft, earRight);
      animalGroup.add(earGroup);
      earsGrp = earGroup;

      // Swiveling Trunk
      const trunkGroup = new THREE.Group();
      trunkGroup.position.set(-2.2, 2.0, 0);
      const seg1 = new THREE.CylinderGeometry(0.18, 0.14, 0.7, 6);
      const mSeg1 = new THREE.Mesh(seg1, bodyMat);
      mSeg1.position.y = -0.3;
      trunkGroup.add(mSeg1);
      const seg2 = new THREE.CylinderGeometry(0.14, 0.08, 0.7, 6);
      const mSeg2 = new THREE.Mesh(seg2, bodyMat);
      mSeg2.position.set(-0.2, -0.85, 0);
      mSeg2.rotation.z = -0.5;
      trunkGroup.add(mSeg2);
      animalGroup.add(trunkGroup);
      trunkGrp = trunkGroup;

      // 4 Pillar Column Legs
      const legGeo = new THREE.CylinderGeometry(0.22, 0.24, 1.6, 8);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      const legOffsets = [
        [-0.85, 0.8, 0.55],
        [-0.85, 0.8, -0.55],
        [0.85, 0.8, 0.55],
        [0.85, 0.8, -0.55],
      ];
      legOffsets.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, ly, lz);
        leg.castShadow = true;
        animalGroup.add(leg);
        legs.push(leg);
      });
    } else {
      // Field Rat / Rodent Model
      const bodyGeo = new THREE.BoxGeometry(0.8, 0.45, 0.4);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.7 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.35;
      body.castShadow = true;
      animalGroup.add(body);

      // Pointed Snout Head
      const headGeo = new THREE.ConeGeometry(0.22, 0.45, 6);
      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.set(-0.55, 0.35, 0);
      head.rotation.z = Math.PI / 2;
      animalGroup.add(head);
      headMesh = head;

      // Long Tapered Tail
      const tailGeo = new THREE.CylinderGeometry(0.04, 0.01, 0.8, 4);
      const tailMat = new THREE.MeshStandardMaterial({ color: 0xf472b6 });
      const tail = new THREE.Mesh(tailGeo, tailMat);
      tail.position.set(0.65, 0.3, 0);
      tail.rotation.z = -0.4;
      animalGroup.add(tail);
      tailMesh = tail;

      // 4 Quick Legs
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 4);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46 });
      const legOffsets = [
        [-0.25, 0.12, 0.15],
        [-0.25, 0.12, -0.15],
        [0.25, 0.12, 0.15],
        [0.25, 0.12, -0.15],
      ];
      legOffsets.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, ly, lz);
        animalGroup.add(leg);
        legs.push(leg);
      });
    }

    // Set initial position
    animalGroup.position.set(animalWorldPos[0], animalWorldPos[1], animalWorldPos[2]);
    sceneRef.current.add(animalGroup);

    animalGroupRef.current = animalGroup;
    legRefs.current = legs;
    headRef.current = headMesh;
    tailRef.current = tailMesh;
    trunkRef.current = trunkGrp;
    earsRef.current = earsGrp;
  }, [selectedAnimal]);

  // Main Animation Loop: Animal Walk Cycle + Water Particle Physics + Projection
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let walkPhase = 0;

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // 1. Controls update
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // 2. Animate Animal Position and Leg Walking Gait
      if (animalGroupRef.current) {
        // Smoothly lerp animal position to target world pos
        animalGroupRef.current.position.x = THREE.MathUtils.lerp(
          animalGroupRef.current.position.x,
          animalWorldPos[0],
          0.15
        );
        animalGroupRef.current.position.z = THREE.MathUtils.lerp(
          animalGroupRef.current.position.z,
          animalWorldPos[2],
          0.15
        );

        // Heading rotation (convert heading deg to radians)
        const targetRotY = (animalHeadingDeg * Math.PI) / 180 + Math.PI / 2;
        animalGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          animalGroupRef.current.rotation.y,
          targetRotY,
          0.12
        );

        // Walk cycle oscillation (active when moving or in full demo)
        walkPhase += dt * (selectedAnimal === 'rat' ? 14 : selectedAnimal === 'elephant' ? 4 : 8);
        const swing = Math.sin(walkPhase);

        if (legRefs.current.length === 4) {
          // Front-left & rear-right swing forward, front-right & rear-left swing backward
          legRefs.current[0].rotation.z = swing * 0.45;
          legRefs.current[1].rotation.z = -swing * 0.45;
          legRefs.current[2].rotation.z = -swing * 0.45;
          legRefs.current[3].rotation.z = swing * 0.45;
        }

        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(walkPhase * 0.5) * 0.12;
        }

        if (tailRef.current) {
          tailRef.current.rotation.y = Math.cos(walkPhase) * 0.25;
        }

        if (trunkRef.current) {
          trunkRef.current.rotation.y = Math.sin(walkPhase * 0.7) * 0.35;
        }

        if (earsRef.current) {
          earsRef.current.rotation.y = Math.sin(walkPhase * 0.4) * 0.15;
        }
      }

      // 3. Update Historical Trail Buffer
      if (trailLineRef.current && historicalTrail.length > 1) {
        const posAttr = trailLineRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const pts = historicalTrail.slice(-100);
        for (let i = 0; i < pts.length; i++) {
          posAttr.setXYZ(i, pts[i][0], 0.1, pts[i][2]);
        }
        trailLineRef.current.geometry.setDrawRange(0, pts.length);
        posAttr.needsUpdate = true;
      }

      // 4. ANIMATED WATER SPRAY SIMULATION
      const nozzleOrigin = new THREE.Vector3(
        WATER_PUMP_LOCATION.nozzlePos[0],
        WATER_PUMP_LOCATION.nozzlePos[1],
        WATER_PUMP_LOCATION.nozzlePos[2]
      );

      // Safe deterrence target direction: towards a buffer area near animal, safely in front of it
      const targetPos = new THREE.Vector3(animalWorldPos[0] + 0.5, 0.2, animalWorldPos[2] - 0.5);

      // Rotate nozzle toward target
      if (nozzleMeshRef.current) {
        const dir = new THREE.Vector3().subVectors(targetPos, nozzleOrigin).normalize();
        const angleY = Math.atan2(dir.x, dir.z);
        nozzleMeshRef.current.rotation.y = THREE.MathUtils.lerp(nozzleMeshRef.current.rotation.y, angleY, 0.1);
      }

      // Generate new water droplets if pump is ON
      if (isWaterSpraying) {
        // Spawn 6 new particles per frame
        const toTargetDir = new THREE.Vector3().subVectors(targetPos, nozzleOrigin).normalize();

        for (let i = 0; i < 7; i++) {
          // Spread fan: add cone variance
          const spreadAngle = (Math.random() - 0.5) * 0.35;
          const spreadElevation = (Math.random() - 0.5) * 0.2;
          const speed = 7.5 + Math.random() * 2.5;

          const spreadDir = toTargetDir
            .clone()
            .applyAxisAngle(new THREE.Vector3(0, 1, 0), spreadAngle);
          spreadDir.y += 0.35 + spreadElevation; // Parabolic launch angle
          spreadDir.normalize();

          dropletsRef.current.push({
            x: nozzleOrigin.x + (Math.random() - 0.5) * 0.1,
            y: nozzleOrigin.y + (Math.random() - 0.5) * 0.1,
            z: nozzleOrigin.z + (Math.random() - 0.5) * 0.1,
            vx: spreadDir.x * speed,
            vy: spreadDir.y * speed,
            vz: spreadDir.z * speed,
            life: 0,
            maxLife: 1.2 + Math.random() * 0.4,
            size: 0.18 + Math.random() * 0.12,
          });
        }
      }

      // Update existing droplets
      const gravity = -9.8;
      const aliveDroplets: Droplet[] = [];

      for (let i = 0; i < dropletsRef.current.length; i++) {
        const d = dropletsRef.current[i];
        d.life += dt;
        d.vy += gravity * dt; // Gravity arc
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.z += d.vz * dt;

        // Ground collision (splash!)
        if (d.y <= 0.05) {
          // Spawn 2 ground splashes
          for (let s = 0; s < 2; s++) {
            splashesRef.current.push({
              x: d.x,
              y: 0.06,
              z: d.z,
              vx: (Math.random() - 0.5) * 1.5,
              vy: 0.8 + Math.random() * 0.8,
              vz: (Math.random() - 0.5) * 1.5,
              life: 0,
              maxLife: 0.35,
            });
          }
        } else if (d.life < d.maxLife) {
          aliveDroplets.push(d);
        }
      }
      dropletsRef.current = aliveDroplets;

      // Update Splash particles
      const aliveSplashes: SplashParticle[] = [];
      for (let i = 0; i < splashesRef.current.length; i++) {
        const sp = splashesRef.current[i];
        sp.life += dt;
        sp.vy += gravity * dt;
        sp.x += sp.vx * dt;
        sp.y = Math.max(0.04, sp.y + sp.vy * dt);
        sp.z += sp.vz * dt;
        if (sp.life < sp.maxLife) {
          aliveSplashes.push(sp);
        }
      }
      splashesRef.current = aliveSplashes;

      // Write droplet data into Three.js BufferAttribute
      if (sprayPointsRef.current) {
        const posAttr = sprayPointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const colAttr = sprayPointsRef.current.geometry.attributes.color as THREE.BufferAttribute;
        const total = Math.min(dropletsRef.current.length, 450);

        for (let i = 0; i < total; i++) {
          const d = dropletsRef.current[i];
          posAttr.setXYZ(i, d.x, d.y, d.z);
          // Color fades from electric cyan to lighter misty white
          const lifeRatio = d.life / d.maxLife;
          const r = 0.2 + lifeRatio * 0.4;
          const g = 0.7 + lifeRatio * 0.3;
          const b = 1.0;
          colAttr.setXYZ(i, r, g, b);
        }
        sprayPointsRef.current.geometry.setDrawRange(0, total);
        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;
      }

      // Write splash data
      if (splashPointsRef.current) {
        const posAttr = splashPointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const total = Math.min(splashesRef.current.length, 150);
        for (let i = 0; i < total; i++) {
          const sp = splashesRef.current[i];
          posAttr.setXYZ(i, sp.x, sp.y, sp.z);
        }
        splashPointsRef.current.geometry.setDrawRange(0, total);
        posAttr.needsUpdate = true;
      }

      // 5. Project Animal 3D Position onto Screen for HUD Overlay
      if (cameraRef.current && containerRef.current && animalGroupRef.current) {
        const animalPos = new THREE.Vector3(
          animalGroupRef.current.position.x,
          animalGroupRef.current.position.y + 1.2,
          animalGroupRef.current.position.z
        );
        animalPos.project(cameraRef.current);

        const widthHalf = containerRef.current.clientWidth / 2;
        const heightHalf = containerRef.current.clientHeight / 2;

        const screenX = animalPos.x * widthHalf + widthHalf;
        const screenY = -(animalPos.y * heightHalf) + heightHalf;

        // Is in front of camera?
        const isVisible = animalPos.z < 1.0;

        setHudScreenPos({
          x: Math.round(screenX),
          y: Math.round(screenY),
          visible: isVisible,
        });
      }

      // Render
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [animalWorldPos, animalHeadingDeg, selectedAnimal, isWaterSpraying, historicalTrail]);

  // Camera presets
  const applyCamPreset = (preset: 'iso' | 'nozzle' | 'top' | 'camera2') => {
    if (!cameraRef.current || !controlsRef.current) return;
    setActiveCamPreset(preset);

    if (preset === 'iso') {
      cameraRef.current.position.set(22, 20, 26);
      controlsRef.current.target.set(6, 1, 0);
    } else if (preset === 'nozzle') {
      cameraRef.current.position.set(12, 5, 4);
      controlsRef.current.target.set(6.8, 1.4, -2.2);
    } else if (preset === 'top') {
      cameraRef.current.position.set(0, 42, 0.01);
      controlsRef.current.target.set(0, 0, 0);
    } else if (preset === 'camera2') {
      // Perspective matching CAM-02-E
      cameraRef.current.position.set(16, 4, -2);
      controlsRef.current.target.set(6, 1, 0);
    }
    controlsRef.current.update();
  };

  const animalConfig = ANIMALS[selectedAnimal];

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl bg-slate-950">
      {/* Three.js Canvas container */}
      <div ref={containerRef} className="w-full h-full absolute inset-0">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* TOP HUD BAR */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/30 text-xs pointer-events-auto">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-mono font-bold text-emerald-400">3D DIGITAL TWIN</span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 font-medium">Zone B — East Sector</span>
          <span className="text-slate-500">|</span>
          <span className="text-xs text-amber-400 font-mono">
            {stage === 'spraying'
              ? 'WATER SPRAY ACTIVE'
              : stage === 'detecting'
              ? 'SIMULATED AI DETECTION'
              : stage === 'monitoring'
              ? 'MONITORING STANDBY'
              : 'LIVE SIMULATION'}
          </span>
        </div>

        {/* View Controls & Day/Night Switch */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* Preset Buttons */}
          <div className="hidden sm:flex items-center bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => applyCamPreset('iso')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeCamPreset === 'iso'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Isometric
            </button>
            <button
              onClick={() => applyCamPreset('nozzle')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeCamPreset === 'nozzle'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sprinkler Focus
            </button>
            <button
              onClick={() => applyCamPreset('camera2')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeCamPreset === 'camera2'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              CAM-02 Feed View
            </button>
            <button
              onClick={() => applyCamPreset('top')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeCamPreset === 'top'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overhead
            </button>
          </div>

          {/* Day / Night Toggle */}
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-all shadow-lg"
            title={isNightMode ? 'Switch to Daytime' : 'Switch to Night Vision'}
          >
            {isNightMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-all shadow-lg"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Reset Camera */}
          <button
            onClick={() => applyCamPreset('iso')}
            className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-all shadow-lg"
            title="Reset 3D View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DYNAMIC SCREEN-PROJECTED HUD BOUNDING BOX FOLLOWING THE ANIMAL */}
      {hudScreenPos.visible && (
        <div
          className="absolute pointer-events-none transition-all duration-75 ease-out z-20"
          style={{
            left: `${hudScreenPos.x}px`,
            top: `${hudScreenPos.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Corner brackets */}
          <div
            className={`w-28 h-28 relative transition-colors duration-300 ${
              stage === 'detecting' || stage === 'sensing' || stage === 'spraying'
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {/* Top-left bracket */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-current"></div>
            {/* Top-right bracket */}
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-current"></div>
            {/* Bottom-left bracket */}
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-current"></div>
            {/* Bottom-right bracket */}
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-current"></div>

            {/* Crosshair Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-current rounded-full opacity-60"></div>

            {/* Floating Banner Tag */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-slate-950/90 border border-current text-[10px] font-mono font-bold tracking-wider shadow-lg">
              {stage === 'detecting' || stage === 'sensing' || stage === 'spraying' || stage === 'recording'
                ? 'AI DETECTION CONFIRMED — DEMO'
                : 'ANIMAL APPROACHING'}
            </div>

            {/* Species & Class Badge */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-slate-900/90 text-[10px] font-mono text-slate-300 border border-slate-700">
              {animalConfig.name} {stage === 'detecting' && '• 94.6%'}
            </div>
          </div>
        </div>
      )}

      {/* WATER SPRAY NOZZLE HUD STATUS OVERLAY (BOTTOM LEFT) */}
      <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 text-xs shadow-xl max-w-xs z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isWaterSpraying ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'
              }`}
            ></span>
            <span className="font-mono font-bold text-white">ECO SPRAY NOZZLE #1</span>
          </div>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              isWaterSpraying
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isWaterSpraying ? 'DISPENSING' : 'IDLE'}
          </span>
        </div>

        <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
          {isWaterSpraying
            ? 'Water particles spraying fan-arc pattern toward safe buffer perimeter to deter intrusion.'
            : 'Safe deterrence standby. Ready for automatic trigger or manual test spray.'}
        </p>

        {/* Quick Spray Controls */}
        <div className="flex items-center space-x-2">
          {!isWaterSpraying ? (
            <button
              onClick={testWaterSpray}
              className="flex-1 py-1 px-2.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 font-semibold border border-cyan-500/40 transition-all text-xs flex items-center justify-center space-x-1"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>TEST WATER SPRAY</span>
            </button>
          ) : (
            <button
              onClick={stopWaterSpray}
              className="flex-1 py-1 px-2.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 font-semibold border border-rose-500/40 transition-all text-xs"
            >
              STOP SPRAY
            </button>
          )}
        </div>
      </div>

      {/* BOTTOM RIGHT LEGEND & INTERACTION HINT */}
      <div className="absolute bottom-3 right-3 hidden sm:flex items-center space-x-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-[11px] text-slate-400 z-10">
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Perimeter</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Sprinkler Stream</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>Ultrasonic Sensor</span>
        </span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-400">Left Click + Drag to Orbit • Scroll to Zoom</span>
      </div>
    </div>
  );
};
