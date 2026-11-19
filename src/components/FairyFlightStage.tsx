import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  ArrowLeft,
  Heart,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
  Wand2,
} from 'lucide-react';
import {
  AppCategory,
  DifficultyLevel,
  InstrumentType,
  PlayerProfile,
  RewardItem,
  WardrobeItem,
} from '../types/game';
import { SkyRunChallenge, generateSkyRunChallenge } from '../data/skyRunChallenges';
import { soundEngine } from '../audio/soundEngine';
import { speakWord, stopSpeaking } from '../utils/speech';
import { AppLanguage, TEXT } from '../i18n/translations';
import { ConfirmCloseDialog } from './ConfirmCloseDialog';
import {
  FairyRig,
  createCollectibleStar,
  createFairyPrincess,
  createGlowSpriteTexture,
  createParallaxCloud,
  createSkyDomeTexture,
  createSkyGateArch,
  createStormCloudObstacle,
  createStormCrystalObstacle,
} from '../three/fairyFlightModels';

type FlightPhase =
  | 'FLYING'
  | 'ORBIT_IN'
  | 'QUESTION'
  | 'BLASTING'
  | 'WRONG_SHAKE'
  | 'ORBIT_OUT'
  | 'PAUSED'
  | 'GAME_OVER';

interface ActiveStar {
  group: THREE.Group;
  collected: boolean;
}

interface ActiveObstacle {
  group: THREE.Group;
  kind: 'cloud' | 'crystal';
  cleared: boolean;
}

interface ShatterParticle {
  active: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotVel: THREE.Vector3;
  life: number;
  maxLife: number;
  scale: number;
}

interface TrailParticle {
  active: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  scale: number;
}

interface FairyFlightStageProps {
  profile: PlayerProfile;
  category: AppCategory;
  level: DifficultyLevel;
  instrument: InstrumentType;
  muted: boolean;
  language: AppLanguage;
  externalLocked: boolean;
  onToggleMute: () => void;
  onConsumeFlightTurn: () => void;
  onRecordProgress: (opts: {
    starsEarned: number;
    completedCategory?: AppCategory;
    level?: DifficultyLevel;
    streak?: number;
    skipFlightProgress?: boolean;
  }) => { newWardrobe: WardrobeItem[]; newRewards: RewardItem[] };
  onTriggerConfetti: (intensity: 'small' | 'big') => void;
  onExit: () => void;
}

// Pre-allocated math helpers (zero GC inside animation loop)
const _dummy = new THREE.Object3D();
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _colorTmp = new THREE.Color();

const SPEED_LINE_COUNT = 48;
const TRAIL_POOL_COUNT = 44;
const SHATTER_COUNT = 36;

export function FairyFlightStage({
  profile,
  category,
  level,
  instrument,
  muted,
  language,
  externalLocked,
  onToggleMute,
  onConsumeFlightTurn,
  onRecordProgress,
  onTriggerConfetti,
  onExit,
}: FairyFlightStageProps) {
  const t = TEXT[language];
  const st = t.skyRun;

  const [hearts, setHearts] = useState<number>(2);
  const [starsEarned, setStarsEarned] = useState<number>(0);
  const [obstaclesCleared, setObstaclesCleared] = useState<number>(0);
  const [uiPhase, setUiPhase] = useState<FlightPhase>('FLYING');
  const [activeChallenge, setActiveChallenge] = useState<SkyRunChallenge | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [confirmExit, setConfirmExit] = useState<boolean>(false);
  const [webglUnavailable, setWebglUnavailable] = useState<boolean>(false);
  const [runRewards, setRunRewards] = useState<{
    wardrobe: WardrobeItem[];
    rewards: RewardItem[];
  }>({ wardrobe: [], rewards: [] });
  const [resetSeed, setResetSeed] = useState<number>(0);

  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const phaseRef = useRef<FlightPhase>('FLYING');
  const heartsRef = useRef<number>(2);
  const starsRef = useRef<number>(0);
  const roundIdxRef = useRef<number>(0);
  const externalLockedRef = useRef<boolean>(externalLocked);
  const confirmExitRef = useRef<boolean>(confirmExit);
  const mutedRef = useRef<boolean>(muted);
  const instrumentRef = useRef<InstrumentType>(instrument);
  const levelRef = useRef<DifficultyLevel>(level);
  const categoryRef = useRef<AppCategory>(category);
  const blastResultRef = useRef<'none' | 'correct' | 'wrong'>('none');
  const gameActionsRef = useRef<{
    triggerBlast: () => void;
    triggerWrong: () => void;
    resetFlight: () => void;
  } | null>(null);

  useEffect(() => {
    externalLockedRef.current = externalLocked;
    if (externalLocked) {
      soundEngine.clearScheduled();
      stopSpeaking();
      if (phaseRef.current === 'FLYING') {
        phaseRef.current = 'PAUSED';
        setUiPhase('PAUSED');
      }
    }
  }, [externalLocked]);

  useEffect(() => {
    confirmExitRef.current = confirmExit;
  }, [confirmExit]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    instrumentRef.current = instrument;
  }, [instrument]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    categoryRef.current = category;
  }, [category]);

  const playChallengeAudio = useCallback((challenge: SkyRunChallenge) => {
    if (mutedRef.current) return;
    if (challenge.kind === 'english') {
      speakWord(challenge.target.word, false, 0.86);
    } else if (challenge.kind === 'music_note') {
      soundEngine.playNote(challenge.freq, instrumentRef.current, 0.85);
    } else if (challenge.kind === 'music_chord') {
      soundEngine.playChord(challenge.freqs, instrumentRef.current, 1.45);
    }
  }, []);

  // Auto-play audio when a question challenge opens
  useEffect(() => {
    if (uiPhase === 'QUESTION' && activeChallenge && !externalLockedRef.current) {
      const id = window.setTimeout(() => {
        playChallengeAudio(activeChallenge);
      }, 280);
      return () => window.clearTimeout(id);
    }
  }, [activeChallenge, playChallengeAudio, uiPhase]);

  // Main Three.js Scene & Game Loop
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // Detect software WebGL cleanly per Three.js guideline
    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(canvas);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x93C5FD);
    scene.fog = new THREE.FogExp2(0xBAE6FD, 0.0115);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(
      60,
      (container.clientWidth || window.innerWidth) /
        Math.max(1, container.clientHeight || window.innerHeight),
      0.1,
      240
    );

    // Lighting rig: warm golden sun + cool sky hemisphere + soft magic rim
    const hemiLight = new THREE.HemisphereLight(0xE0F2FE, 0xFBCFE8, 1.05);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xFFFBEB, 1.85);
    keyLight.position.set(8, 14, 10);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 45;
      keyLight.shadow.camera.left = -10;
      keyLight.shadow.camera.right = 10;
      keyLight.shadow.camera.top = 10;
      keyLight.shadow.camera.bottom = -10;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xF472B6, 0.75);
    rimLight.position.set(-8, 4, -10);
    scene.add(rimLight);

    // Sky Dome
    const skyTex = createSkyDomeTexture();
    const skyGeo = new THREE.SphereGeometry(140, 24, 18);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      fog: false,
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);

    // Distant sunlit horizon cloud-sea plane below
    const cloudFloorMat = new THREE.MeshStandardMaterial({
      color: '#E0F2FE',
      emissive: '#BAE6FD',
      emissiveIntensity: 0.25,
      roughness: 0.95,
    });
    const cloudFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(240, 240),
      cloudFloorMat
    );
    cloudFloor.rotation.x = -Math.PI / 2;
    cloudFloor.position.set(0, -14, -40);
    scene.add(cloudFloor);

    // Parallax Clouds (foreground, mid, and distant layers)
    const clouds: Array<{ group: THREE.Group; speedMult: number; baseY: number }> = [];
    for (let i = 0; i < 24; i++) {
      const c = createParallaxCloud();
      const side = i % 2 === 0 ? -1 : 1;
      const layer = i % 3;
      const spreadX =
        layer === 0
          ? side * (6.2 + Math.random() * 6.5)
          : layer === 1
          ? side * (10 + Math.random() * 14)
          : (Math.random() - 0.5) * 44;
      const baseY =
        layer === 2 ? -9 - Math.random() * 3.5 : (Math.random() - 0.35) * 9.5;
      const scale = layer === 2 ? 2.4 + Math.random() * 1.4 : 0.9 + Math.random() * 1.2;
      c.scale.setScalar(scale);
      c.position.set(spreadX, baseY, -i * 5.2 + 8);
      scene.add(c);
      clouds.push({
        group: c,
        speedMult: layer === 0 ? 1.15 : layer === 1 ? 0.72 : 0.42,
        baseY,
      });
    }

    // Sky Corridor Gate Pillars (Temple-Run style forward perspective depth)
    const arches: THREE.Group[] = [];
    for (let i = 0; i < 7; i++) {
      const arch = createSkyGateArch();
      arch.position.set(0, -1.2, -i * 18 - 8);
      scene.add(arch);
      arches.push(arch);
    }

    // Speed Lines InstancedMesh
    const speedGeo = new THREE.BoxGeometry(0.032, 0.032, 3.6);
    const speedMat = new THREE.MeshBasicMaterial({
      color: '#FFFFFF',
      transparent: true,
      opacity: 0.42,
    });
    const speedLinesMesh = new THREE.InstancedMesh(
      speedGeo,
      speedMat,
      SPEED_LINE_COUNT
    );
    speedLinesMesh.frustumCulled = false;
    const speedLineData = Array.from({ length: SPEED_LINE_COUNT }, (_, i) => {
      const angle = (i / SPEED_LINE_COUNT) * Math.PI * 2 + Math.random() * 0.4;
      const radius = 4.6 + Math.random() * 5.5;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.65 + 0.5,
        z: -Math.random() * 90,
        speed: 1.5 + Math.random() * 1.1,
      };
    });
    scene.add(speedLinesMesh);

    // Fairy Princess Rig
    const fairy: FairyRig = createFairyPrincess(profile.equippedWardrobe);
    fairy.root.position.set(0, 0.1, 0);
    scene.add(fairy.root);

    // Glowing Star Trail InstancedMesh behind Fairy
    const trailGeo = new THREE.OctahedronGeometry(0.14, 0);
    const trailMat = new THREE.MeshBasicMaterial({
      color: '#FDE047',
      transparent: true,
      opacity: 0.9,
    });
    const trailMesh = new THREE.InstancedMesh(
      trailGeo,
      trailMat,
      TRAIL_POOL_COUNT
    );
    trailMesh.frustumCulled = false;
    trailMesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(TRAIL_POOL_COUNT * 3),
      3
    );
    const trailPool: TrailParticle[] = Array.from(
      { length: TRAIL_POOL_COUNT },
      () => ({
        active: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 0.7,
        scale: 1,
      })
    );
    const trailPalette = [
      new THREE.Color('#FDE047'),
      new THREE.Color('#F472B6'),
      new THREE.Color('#67E8F9'),
      new THREE.Color('#FFFFFF'),
    ];
    let trailCursor = 0;
    let trailSpawnAccum = 0;
    scene.add(trailMesh);

    // Magic Blast Bolt (wand -> obstacle)
    const glowTex = createGlowSpriteTexture();
    const boltGroup = new THREE.Group();
    const boltCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 16),
      new THREE.MeshBasicMaterial({ color: '#FDE047' })
    );
    const boltHalo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        color: '#F472B6',
        transparent: true,
        blending: THREE.AdditiveBlending,
      })
    );
    boltHalo.scale.set(1.6, 1.6, 1);
    boltGroup.add(boltCore);
    boltGroup.add(boltHalo);
    boltGroup.visible = false;
    scene.add(boltGroup);

    // Shatter Explosion Particles
    const shatterGeo = new THREE.OctahedronGeometry(0.22, 0);
    const shatterMat = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      emissive: '#FDE047',
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.4,
    });
    const shatterMesh = new THREE.InstancedMesh(
      shatterGeo,
      shatterMat,
      SHATTER_COUNT
    );
    shatterMesh.frustumCulled = false;
    shatterMesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(SHATTER_COUNT * 3),
      3
    );
    const shatterPool: ShatterParticle[] = Array.from(
      { length: SHATTER_COUNT },
      () => ({
        active: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        rot: new THREE.Euler(),
        rotVel: new THREE.Vector3(),
        life: 0,
        maxLife: 0.9,
        scale: 1,
      })
    );
    scene.add(shatterMesh);

    // Active Obstacles & Collectible Stars
    const activeStars: ActiveStar[] = [];
    const activeObstacles: ActiveObstacle[] = [];
    let collidingObstacle: ActiveObstacle | null = null;

    // Flight & Camera State
    let fairyX = 0;
    let fairyY = 0.2;
    let targetX = 0;
    let targetY = 0.2;
    let prevFairyX = 0;
    let prevFairyY = 0;
    let invulnTimer = 0;
    let starSpawnTimer = 0.4;
    let obstacleSpawnTimer = 2.1;
    let orbitAngle = 0;
    let targetOrbitAngle = 0;
    let blastTimer = 0;
    let boltHitFired = false;
    let wrongShakeTimer = 0;

    // Smooth camera tracking coordinates
    const camPos = new THREE.Vector3(0, 2.0, 7.6);
    const camLook = new THREE.Vector3(0, 0.2, -7.0);

    const clearActors = () => {
      activeStars.forEach((s) => scene.remove(s.group));
      activeStars.length = 0;
      activeObstacles.forEach((o) => scene.remove(o.group));
      activeObstacles.length = 0;
      collidingObstacle = null;
    };

    const spawnStarCluster = () => {
      const baseX = (Math.random() - 0.5) * 6.0;
      const baseY = (Math.random() - 0.4) * 2.8;
      const count = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const star = createCollectibleStar();
        star.position.set(
          THREE.MathUtils.clamp(baseX + (i - 1) * 0.45, -3.5, 3.5),
          THREE.MathUtils.clamp(baseY + Math.sin(i * 0.8) * 0.25, -1.7, 2.2),
          -82 - i * 2.6
        );
        scene.add(star);
        activeStars.push({ group: star, collected: false });
      }
    };

    const spawnObstacle = () => {
      const kind: 'cloud' | 'crystal' =
        Math.random() < 0.5 ? 'cloud' : 'crystal';
      const group =
        kind === 'cloud'
          ? createStormCloudObstacle()
          : createStormCrystalObstacle();
      // Bias slightly toward playable lanes so dodging & encounters both happen naturally
      const laneX =
        Math.random() < 0.35
          ? THREE.MathUtils.clamp(targetX + (Math.random() - 0.5) * 1.4, -3.2, 3.2)
          : (Math.random() - 0.5) * 6.4;
      const laneY =
        Math.random() < 0.35
          ? THREE.MathUtils.clamp(targetY + (Math.random() - 0.5) * 1.0, -1.5, 2.0)
          : (Math.random() - 0.4) * 3.0;
      group.position.set(laneX, laneY, -86);
      scene.add(group);
      activeObstacles.push({ group, kind, cleared: false });
    };

    const triggerShatterBurst = (
      origin: THREE.Vector3,
      kind: 'cloud' | 'crystal' | 'star'
    ) => {
      const palette =
        kind === 'crystal'
          ? ['#FB7185', '#A855F7', '#FDE047', '#FFFFFF']
          : kind === 'cloud'
          ? ['#818CF8', '#FDE047', '#38BDF8', '#C4B5FD']
          : ['#FDE047', '#FBBF24', '#FFFFFF', '#F472B6'];

      for (let i = 0; i < SHATTER_COUNT; i++) {
        const p = shatterPool[i];
        p.active = true;
        p.pos.copy(origin);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const spd = 3.2 + Math.random() * 6.4;
        p.vel.set(
          Math.sin(phi) * Math.cos(theta) * spd,
          Math.cos(phi) * spd * 0.8 + 1.8,
          Math.sin(phi) * Math.sin(theta) * spd
        );
        p.rot.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        p.rotVel.set(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12
        );
        p.life = 0;
        p.maxLife = 0.65 + Math.random() * 0.45;
        p.scale = kind === 'star' ? 0.55 + Math.random() * 0.45 : 0.8 + Math.random() * 0.9;
        _colorTmp.set(palette[i % palette.length]);
        shatterMesh.setColorAt(i, _colorTmp);
      }
      if (shatterMesh.instanceColor) {
        shatterMesh.instanceColor.needsUpdate = true;
      }
    };

    // Bridge React quiz answers back into Three.js animation state
    gameActionsRef.current = {
      triggerBlast: () => {
        blastResultRef.current = 'correct';
        blastTimer = 0;
        boltHitFired = false;
        phaseRef.current = 'BLASTING';
        setUiPhase('BLASTING');
        soundEngine.playMagicWand();
      },
      triggerWrong: () => {
        blastResultRef.current = 'wrong';
        wrongShakeTimer = 0;
        phaseRef.current = 'WRONG_SHAKE';
        setUiPhase('WRONG_SHAKE');
        soundEngine.playGentleOops();
        soundEngine.playCollapseThud();
      },
      resetFlight: () => {
        clearActors();
        fairyX = 0;
        fairyY = 0.2;
        targetX = 0;
        targetY = 0.2;
        invulnTimer = 1.2;
        orbitAngle = 0;
        targetOrbitAngle = 0;
        starSpawnTimer = 0.3;
        obstacleSpawnTimer = 1.9;
        boltGroup.visible = false;
        heartsRef.current = 2;
        starsRef.current = 0;
        roundIdxRef.current = 0;
        phaseRef.current = 'FLYING';
        setHearts(2);
        setStarsEarned(0);
        setObstaclesCleared(0);
        setActiveChallenge(null);
        setFeedbackBanner(null);
        setRunRewards({ wardrobe: [], rewards: [] });
        setUiPhase('FLYING');
      },
    };

    // Swipe / Drag Pointer Controls
    let dragging = false;
    let lastPtrX = 0;
    let lastPtrY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (phaseRef.current !== 'FLYING' || externalLockedRef.current) return;
      dragging = true;
      lastPtrX = e.clientX;
      lastPtrY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging || phaseRef.current !== 'FLYING') return;
      const dx = e.clientX - lastPtrX;
      const dy = e.clientY - lastPtrY;
      lastPtrX = e.clientX;
      lastPtrY = e.clientY;

      const scaleX = 9.0 / Math.max(320, container.clientWidth || window.innerWidth);
      const scaleY = 6.2 / Math.max(320, container.clientHeight || window.innerHeight);

      targetX = THREE.MathUtils.clamp(targetX + dx * scaleX * 1.35, -3.7, 3.7);
      targetY = THREE.MathUtils.clamp(targetY - dy * scaleY * 1.35, -1.85, 2.35);
    };

    const onPointerUp = () => {
      dragging = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Keyboard flight steering (Arrow keys / WASD) + Esc Pause
    const keysDown = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      if (confirmExitRef.current || externalLockedRef.current) return;
      if (e.key === 'Escape') {
        if (phaseRef.current === 'FLYING') {
          phaseRef.current = 'PAUSED';
          setUiPhase('PAUSED');
        } else if (phaseRef.current === 'PAUSED') {
          phaseRef.current = 'FLYING';
          setUiPhase('FLYING');
        }
        return;
      }
      keysDown.add(e.key.toLowerCase());
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Resize listener
    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = Math.max(1, container.clientHeight || window.innerHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl?.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      if (!sync || !gl) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        if (disposed) {
          gl.deleteSync(sync);
          return;
        }
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const getSpeedForLevel = () => {
      switch (levelRef.current) {
        case 'beginner':
          return 17;
        case 'intermediate':
          return 21;
        case 'advanced':
          return 24.5;
        case 'extreme':
          return 28;
      }
    };

    const tick = () => {
      if (disposed) return;

      const rawDelta = clock.getDelta();
      const dt = Math.min(rawDelta, 0.08);
      const elapsed = clock.elapsedTime;
      const currentPhase = phaseRef.current;

      const forwardActive = currentPhase === 'FLYING';
      const worldSpeed = forwardActive ? getSpeedForLevel() : 0;

      // 1. Fairy Animation (wings always gently flap unless paused/game over)
      if (currentPhase !== 'PAUSED' && currentPhase !== 'GAME_OVER') {
        const wingFreq =
          currentPhase === 'BLASTING'
            ? 24
            : currentPhase === 'FLYING'
            ? 15
            : 11;
        const flap = Math.sin(elapsed * wingFreq);
        fairy.rightUpperWing.rotation.y = -0.32 + flap * 0.54;
        fairy.leftUpperWing.rotation.y = 0.32 - flap * 0.54;
        fairy.rightLowerWing.rotation.y = -0.22 + flap * 0.42;
        fairy.leftLowerWing.rotation.y = 0.22 - flap * 0.42;

        // Gentle wind sway on flowing styled hair + twinkling wing sparkles
        fairy.hairFlowGroup.rotation.x = Math.sin(elapsed * 5.2) * 0.085;
        fairy.hairFlowGroup.rotation.z = Math.cos(elapsed * 3.8) * 0.045;
        for (let i = 0; i < fairy.wingSparkles.length; i++) {
          const twinkle = 0.72 + Math.sin(elapsed * 8.5 + i * 1.1) * 0.38;
          fairy.wingSparkles[i].scale.setScalar(twinkle);
        }

        fairy.haloRing.rotation.z = elapsed * 1.4;
        fairy.wandGemMat.emissiveIntensity =
          0.75 + Math.sin(elapsed * 5.2) * 0.35;
      }

      // 2. Keyboard steering during active flight
      if (forwardActive) {
        const keySteerSpeed = 6.8 * dt;
        if (keysDown.has('arrowleft') || keysDown.has('a')) {
          targetX = THREE.MathUtils.clamp(targetX - keySteerSpeed, -3.7, 3.7);
        }
        if (keysDown.has('arrowright') || keysDown.has('d')) {
          targetX = THREE.MathUtils.clamp(targetX + keySteerSpeed, -3.7, 3.7);
        }
        if (keysDown.has('arrowup') || keysDown.has('w')) {
          targetY = THREE.MathUtils.clamp(targetY + keySteerSpeed, -1.85, 2.35);
        }
        if (keysDown.has('arrowdown') || keysDown.has('s')) {
          targetY = THREE.MathUtils.clamp(targetY - keySteerSpeed, -1.85, 2.35);
        }

        fairyX = THREE.MathUtils.damp(fairyX, targetX, 9.5, dt);
        fairyY = THREE.MathUtils.damp(fairyY, targetY, 9.5, dt);

        const vx = (fairyX - prevFairyX) / Math.max(dt, 0.001);
        const vy = (fairyY - prevFairyY) / Math.max(dt, 0.001);
        prevFairyX = fairyX;
        prevFairyY = fairyY;

        fairy.root.position.set(
          fairyX,
          fairyY + Math.sin(elapsed * 4.5) * 0.09,
          0
        );
        // Bank & pitch into turns
        fairy.bodyGroup.rotation.z = THREE.MathUtils.damp(
          fairy.bodyGroup.rotation.z,
          THREE.MathUtils.clamp(-vx * 0.085, -0.52, 0.52),
          10,
          dt
        );
        fairy.bodyGroup.rotation.x = THREE.MathUtils.damp(
          fairy.bodyGroup.rotation.x,
          -0.24 + THREE.MathUtils.clamp(vy * 0.045, -0.25, 0.28),
          10,
          dt
        );
        fairy.wandArmPivot.rotation.x = THREE.MathUtils.damp(
          fairy.wandArmPivot.rotation.x,
          0,
          8,
          dt
        );
        fairy.wandArmPivot.rotation.z = THREE.MathUtils.damp(
          fairy.wandArmPivot.rotation.z,
          0,
          8,
          dt
        );

        // Shield shimmer countdown
        if (invulnTimer > 0) {
          invulnTimer = Math.max(0, invulnTimer - dt);
          const shieldMat = fairy.shieldBubble.material as THREE.MeshBasicMaterial;
          shieldMat.opacity = 0.28 + Math.sin(elapsed * 18) * 0.14;
          fairy.shieldBubble.rotation.y += dt * 2.5;
        } else {
          (fairy.shieldBubble.material as THREE.MeshBasicMaterial).opacity = 0;
        }
      }

      // 3. Parallax Clouds, Gate Pillars & Speed Lines
      if (forwardActive) {
        for (let i = 0; i < clouds.length; i++) {
          const item = clouds[i];
          item.group.position.z += worldSpeed * item.speedMult * dt;
          item.group.position.y =
            item.baseY + Math.sin(elapsed * 0.8 + i) * 0.18;
          if (item.group.position.z > 16) {
            item.group.position.z = -112 - Math.random() * 14;
          }
        }

        for (let i = 0; i < arches.length; i++) {
          arches[i].position.z += worldSpeed * dt;
          if (arches[i].position.z > 12) {
            arches[i].position.z -= 7 * 18;
          }
        }

        for (let i = 0; i < SPEED_LINE_COUNT; i++) {
          const sl = speedLineData[i];
          sl.z += worldSpeed * sl.speed * dt;
          if (sl.z > 10) sl.z = -85 - Math.random() * 15;
          _dummy.position.set(sl.x, sl.y, sl.z);
          _dummy.rotation.set(0, 0, 0);
          _dummy.scale.set(1, 1, 1);
          _dummy.updateMatrix();
          speedLinesMesh.setMatrixAt(i, _dummy.matrix);
        }
        speedLinesMesh.instanceMatrix.needsUpdate = true;
      }

      // 4. Glowing Star Trail behind Fairy
      if (currentPhase !== 'PAUSED' && currentPhase !== 'GAME_OVER') {
        if (forwardActive || currentPhase === 'ORBIT_OUT') {
          trailSpawnAccum += dt;
          while (trailSpawnAccum >= 0.028) {
            trailSpawnAccum -= 0.028;
            const p = trailPool[trailCursor];
            p.active = true;
            p.pos.set(
              fairy.root.position.x + (Math.random() - 0.5) * 0.42,
              fairy.root.position.y + (Math.random() - 0.5) * 0.38,
              fairy.root.position.z + 0.45
            );
            p.vel.set(
              (Math.random() - 0.5) * 0.65,
              (Math.random() - 0.5) * 0.65,
              forwardActive ? worldSpeed * 0.52 : 2.2
            );
            p.life = 0;
            p.maxLife = 0.55 + Math.random() * 0.25;
            p.scale = 0.65 + Math.random() * 0.7;
            _colorTmp.copy(trailPalette[trailCursor % trailPalette.length]);
            trailMesh.setColorAt(trailCursor, _colorTmp);
            trailCursor = (trailCursor + 1) % TRAIL_POOL_COUNT;
          }
          if (trailMesh.instanceColor) trailMesh.instanceColor.needsUpdate = true;
        }

        for (let i = 0; i < TRAIL_POOL_COUNT; i++) {
          const p = trailPool[i];
          if (!p.active) {
            _dummy.scale.set(0, 0, 0);
            _dummy.updateMatrix();
            trailMesh.setMatrixAt(i, _dummy.matrix);
            continue;
          }
          p.life += dt;
          if (p.life >= p.maxLife) {
            p.active = false;
            _dummy.scale.set(0, 0, 0);
          } else {
            p.pos.addScaledVector(p.vel, dt);
            const tNorm = 1 - p.life / p.maxLife;
            _dummy.position.copy(p.pos);
            _dummy.rotation.set(elapsed * 4 + i, elapsed * 3, 0);
            _dummy.scale.setScalar(p.scale * tNorm);
          }
          _dummy.updateMatrix();
          trailMesh.setMatrixAt(i, _dummy.matrix);
        }
        trailMesh.instanceMatrix.needsUpdate = true;
      }

      // 5. Shatter Explosion Particle Update
      if (currentPhase !== 'PAUSED') {
        for (let i = 0; i < SHATTER_COUNT; i++) {
          const p = shatterPool[i];
          if (!p.active) {
            _dummy.scale.set(0, 0, 0);
            _dummy.updateMatrix();
            shatterMesh.setMatrixAt(i, _dummy.matrix);
            continue;
          }
          p.life += dt;
          if (p.life >= p.maxLife) {
            p.active = false;
            _dummy.scale.set(0, 0, 0);
          } else {
            p.vel.y -= 9.5 * dt;
            p.pos.addScaledVector(p.vel, dt);
            p.rot.x += p.rotVel.x * dt;
            p.rot.y += p.rotVel.y * dt;
            const s = p.scale * (1 - p.life / p.maxLife);
            _dummy.position.copy(p.pos);
            _dummy.rotation.copy(p.rot);
            _dummy.scale.setScalar(Math.max(0.01, s));
          }
          _dummy.updateMatrix();
          shatterMesh.setMatrixAt(i, _dummy.matrix);
        }
        shatterMesh.instanceMatrix.needsUpdate = true;
      }

      // 6. Collectible Stars & Incoming Obstacles Spawning / Collision
      if (forwardActive) {
        starSpawnTimer -= dt;
        if (starSpawnTimer <= 0) {
          spawnStarCluster();
          starSpawnTimer = 1.15 + Math.random() * 0.7;
        }

        obstacleSpawnTimer -= dt;
        if (obstacleSpawnTimer <= 0) {
          spawnObstacle();
          const minGap =
            levelRef.current === 'beginner'
              ? 2.6
              : levelRef.current === 'intermediate'
              ? 2.2
              : levelRef.current === 'advanced'
              ? 1.9
              : 1.65;
          obstacleSpawnTimer = minGap + Math.random() * 0.85;
        }

        // Update Collectible Stars
        for (let i = activeStars.length - 1; i >= 0; i--) {
          const s = activeStars[i];
          s.group.position.z += worldSpeed * dt;
          s.group.rotation.y += dt * 3.2;

          const dx = Math.abs(s.group.position.x - fairyX);
          const dy = Math.abs(s.group.position.y - fairyY);
          const dz = Math.abs(s.group.position.z - 0);

          if (!s.collected && dx < 1.1 && dy < 1.1 && dz < 1.1) {
            s.collected = true;
            soundEngine.playCorrectChime();
            triggerShatterBurst(s.group.position, 'star');
            scene.remove(s.group);
            activeStars.splice(i, 1);
            starsRef.current += 1;
            setStarsEarned(starsRef.current);
            continue;
          }

          if (s.group.position.z > 10) {
            scene.remove(s.group);
            activeStars.splice(i, 1);
          }
        }

        // Update Incoming Obstacles
        for (let i = activeObstacles.length - 1; i >= 0; i--) {
          const obs = activeObstacles[i];
          obs.group.position.z += worldSpeed * dt;
          if (obs.kind === 'crystal') {
            obs.group.rotation.y += dt * 1.9;
            obs.group.rotation.z = Math.sin(elapsed * 2.2 + i) * 0.14;
          } else {
            obs.group.position.y += Math.sin(elapsed * 3.5 + i) * 0.008;
          }

          const dx = Math.abs(obs.group.position.x - fairyX);
          const dy = Math.abs(obs.group.position.y - fairyY);
          const dz = obs.group.position.z;

          // Collision Check (generous fair hitbox)
          if (
            !obs.cleared &&
            invulnTimer <= 0 &&
            dx < 1.05 &&
            dy < 1.05 &&
            dz > -1.25 &&
            dz < 0.85
          ) {
            collidingObstacle = obs;
            obs.cleared = true;
            // Place obstacle clearly facing fairy for dramatic side-profile standoff
            obs.group.position.set(fairyX, fairyY, -4.4);
            // Push away any other close obstacles behind so scene stays clean
            activeObstacles.forEach((other) => {
              if (other !== obs && other.group.position.z > -16) {
                other.group.position.z -= 18;
              }
            });

            fairy.bodyGroup.rotation.z = 0;
            fairy.bodyGroup.rotation.x = -0.14;
            targetOrbitAngle = Math.PI * 0.42; // Dramatic side-profile framing fairy face + obstacle!
            roundIdxRef.current += 1;
            const challenge = generateSkyRunChallenge(
              categoryRef.current,
              levelRef.current,
              roundIdxRef.current
            );
            setFeedbackBanner(null);
            setActiveChallenge(challenge);
            phaseRef.current = 'ORBIT_IN';
            setUiPhase('ORBIT_IN');
            soundEngine.playCollapseThud();
            break;
          }

          if (obs.group.position.z > 10) {
            scene.remove(obs.group);
            activeObstacles.splice(i, 1);
          }
        }
      }

      // 7. Side-Profile 45° Orbit + Wand Blast + Wrong Answer Transitions
      if (currentPhase === 'ORBIT_IN') {
        orbitAngle = THREE.MathUtils.damp(orbitAngle, targetOrbitAngle, 6.2, dt);
        if (Math.abs(orbitAngle - targetOrbitAngle) < 0.04) {
          orbitAngle = targetOrbitAngle;
          phaseRef.current = 'QUESTION';
          setUiPhase('QUESTION');
        }
      } else if (currentPhase === 'QUESTION') {
        orbitAngle = THREE.MathUtils.damp(orbitAngle, targetOrbitAngle, 6.2, dt);
        // Gentle idle hover facing each other
        fairy.root.position.y = fairyY + Math.sin(elapsed * 3.4) * 0.08;
        if (collidingObstacle) {
          collidingObstacle.group.position.y =
            fairyY + Math.cos(elapsed * 3.0) * 0.08;
          if (collidingObstacle.kind === 'crystal') {
            collidingObstacle.group.rotation.y += dt * 1.4;
          }
        }
      } else if (currentPhase === 'BLASTING') {
        blastTimer += dt;
        // Fairy waves wand arm dramatically!
        const waveProgress = Math.min(1, blastTimer / 0.34);
        fairy.wandArmPivot.rotation.x =
          -Math.sin(waveProgress * Math.PI) * 1.25;
        fairy.wandArmPivot.rotation.z =
          Math.sin(waveProgress * Math.PI * 2) * 0.45;
        fairy.root.rotation.y = Math.sin(waveProgress * Math.PI) * 0.32;

        if (!boltHitFired) {
          fairy.wandTipAnchor.getWorldPosition(_vec3A);
          const obsPos = collidingObstacle
            ? collidingObstacle.group.position
            : _vec3B.set(fairyX, fairyY, -4.4);
          boltGroup.visible = true;
          boltGroup.position.lerpVectors(_vec3A, obsPos, waveProgress);
          boltGroup.scale.setScalar(1 + Math.sin(waveProgress * Math.PI) * 0.45);

          if (blastTimer >= 0.34) {
            boltHitFired = true;
            boltGroup.visible = false;
            soundEngine.playCorrectChime();
            if (collidingObstacle) {
              triggerShatterBurst(
                collidingObstacle.group.position,
                collidingObstacle.kind
              );
              scene.remove(collidingObstacle.group);
              const idx = activeObstacles.indexOf(collidingObstacle);
              if (idx >= 0) activeObstacles.splice(idx, 1);
              collidingObstacle = null;
            }
            starsRef.current += 1;
            setStarsEarned(starsRef.current);
            setObstaclesCleared((c) => c + 1);
          }
        }

        if (blastTimer >= 1.05) {
          fairy.root.rotation.y = 0;
          fairy.wandArmPivot.rotation.set(0, 0, 0);
          targetOrbitAngle = 0;
          invulnTimer = 2.0;
          phaseRef.current = 'ORBIT_OUT';
          setUiPhase('ORBIT_OUT');
        }
      } else if (currentPhase === 'WRONG_SHAKE') {
        wrongShakeTimer += dt;
        fairy.root.position.x =
          fairyX + Math.sin(wrongShakeTimer * 34) * 0.18;
        fairy.bodyGroup.rotation.z =
          Math.sin(wrongShakeTimer * 26) * 0.25;
        if (collidingObstacle) {
          const shrink = Math.max(0.01, 1 - wrongShakeTimer / 0.55);
          collidingObstacle.group.scale.setScalar(shrink);
        }

        if (wrongShakeTimer >= 0.58) {
          fairy.root.position.x = fairyX;
          fairy.bodyGroup.rotation.z = 0;
          if (collidingObstacle) {
            scene.remove(collidingObstacle.group);
            const idx = activeObstacles.indexOf(collidingObstacle);
            if (idx >= 0) activeObstacles.splice(idx, 1);
            collidingObstacle = null;
          }
          targetOrbitAngle = 0;
          invulnTimer = 2.0;
          phaseRef.current = 'ORBIT_OUT';
          setUiPhase('ORBIT_OUT');
        }
      } else if (currentPhase === 'ORBIT_OUT') {
        orbitAngle = THREE.MathUtils.damp(orbitAngle, 0, 6.8, dt);
        if (Math.abs(orbitAngle) < 0.03) {
          orbitAngle = 0;
          setActiveChallenge(null);
          setFeedbackBanner(null);
          phaseRef.current = 'FLYING';
          setUiPhase('FLYING');
        }
      }

      // 8. Smooth Camera Position & Target Interpolation
      // Blend cleanly between normal chase cam (orbitAngle=0) and side-profile view
      const orbitT = THREE.MathUtils.clamp(orbitAngle / (Math.PI * 0.42), 0, 1);
      const midZ = -2.2;
      const orbitRadius = 8.4;

      const chaseX = fairyX * 0.35;
      const chaseY = fairyY * 0.45 + 1.85;
      const chaseZ = 7.6;

      const sideX = fairyX + Math.sin(orbitAngle) * orbitRadius;
      const sideY = fairyY + 1.15;
      const sideZ = midZ + Math.cos(orbitAngle) * orbitRadius;

      const desiredCamX = THREE.MathUtils.lerp(chaseX, sideX, orbitT);
      const desiredCamY = THREE.MathUtils.lerp(chaseY, sideY, orbitT);
      const desiredCamZ = THREE.MathUtils.lerp(chaseZ, sideZ, orbitT);

      const desiredLookX = THREE.MathUtils.lerp(fairyX * 0.25, fairyX, orbitT);
      const desiredLookY = THREE.MathUtils.lerp(
        fairyY * 0.25,
        fairyY - 0.85,
        orbitT
      );
      const desiredLookZ = THREE.MathUtils.lerp(-7.0, midZ, orbitT);

      camPos.x = THREE.MathUtils.damp(camPos.x, desiredCamX, 8, dt);
      camPos.y = THREE.MathUtils.damp(camPos.y, desiredCamY, 8, dt);
      camPos.z = THREE.MathUtils.damp(camPos.z, desiredCamZ, 8, dt);
      camLook.x = THREE.MathUtils.damp(camLook.x, desiredLookX, 8, dt);
      camLook.y = THREE.MathUtils.damp(camLook.y, desiredLookY, 8, dt);
      camLook.z = THREE.MathUtils.damp(camLook.z, desiredLookZ, 8, dt);

      camera.position.copy(camPos);
      camera.lookAt(camLook);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', handleResize);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mat.dispose());
          } else {
            m.material?.dispose();
          }
        }
      });
      skyTex.dispose();
      glowTex.dispose();
      envTarget.dispose();
      renderer.dispose();
    };
  }, [profile.equippedWardrobe, resetSeed]);

  const handleAnswerChallenge = (selected: string | number) => {
    if (!activeChallenge || uiPhase !== 'QUESTION') return;

    let isCorrect = false;
    if (activeChallenge.kind === 'math') {
      isCorrect = Number(selected) === activeChallenge.answer;
    } else if (activeChallenge.kind === 'english') {
      isCorrect = String(selected).toLowerCase() === activeChallenge.correctSpelling;
    } else if (activeChallenge.kind === 'music_note') {
      isCorrect = String(selected) === activeChallenge.noteId;
    } else if (activeChallenge.kind === 'music_chord') {
      isCorrect = String(selected) === activeChallenge.qualityId;
    }

    if (isCorrect) {
      setFeedbackBanner(st.magicBlastMsg);
      onTriggerConfetti('small');
      gameActionsRef.current?.triggerBlast();
    } else {
      const nextHearts = heartsRef.current - 1;
      heartsRef.current = nextHearts;
      setHearts(nextHearts);
      setFeedbackBanner(st.wrongOopsMsg);

      if (nextHearts <= 0) {
        soundEngine.playGentleOops();
        soundEngine.playCollapseThud();
        phaseRef.current = 'GAME_OVER';
        setUiPhase('GAME_OVER');
        setActiveChallenge(null);

        const earned = starsRef.current;
        if (earned > 0) {
          const unlocked = onRecordProgress({
            starsEarned: earned,
            completedCategory: category,
            level,
            skipFlightProgress: true,
          });
          setRunRewards({
            wardrobe: unlocked.newWardrobe,
            rewards: unlocked.newRewards,
          });
          onTriggerConfetti('big');
          soundEngine.playVictoryFanfare();
        }
      } else {
        gameActionsRef.current?.triggerWrong();
      }
    }
  };

  const handlePauseToggle = () => {
    soundEngine.playTapPop();
    if (phaseRef.current === 'FLYING') {
      phaseRef.current = 'PAUSED';
      setUiPhase('PAUSED');
    } else if (phaseRef.current === 'PAUSED') {
      phaseRef.current = 'FLYING';
      setUiPhase('FLYING');
    }
  };

  const handleReplay = () => {
    soundEngine.playTapPop();
    soundEngine.clearScheduled();
    stopSpeaking();
    setResetSeed((s) => s + 1);
    gameActionsRef.current?.resetFlight();
  };

  const handleRequestExit = () => {
    soundEngine.playTapPop();
    if (phaseRef.current === 'FLYING') {
      phaseRef.current = 'PAUSED';
      setUiPhase('PAUSED');
    }
    setConfirmExit(true);
  };

  const handleConfirmExit = () => {
    soundEngine.clearScheduled();
    stopSpeaking();
    // Save any stars collected mid-flight before exiting if not already saved on Game Over
    if (uiPhase !== 'GAME_OVER' && starsRef.current > 0) {
      onRecordProgress({
        starsEarned: starsRef.current,
        completedCategory: category,
        level,
        skipFlightProgress: true,
      });
    }
    setConfirmExit(false);
    onExit();
  };

  const categoryLabel = t.home.categories[category].title;
  const levelLabel = t.levels[level].label;

  return (
    <div className="fixed inset-0 z-30 w-full h-dvh overflow-hidden bg-gradient-to-b from-sky-400 via-sky-200 to-pink-100 select-none">
      {/* Isolated 3D WebGL Mount Container */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full touch-none"
        aria-label={st.cardTitle}
      />

      {/* WebGL Graceful Fallback */}
      {webglUnavailable && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-gradient-to-b from-sky-200 to-indigo-100">
          <div className="clay-surface rounded-[28px] p-6 max-w-md text-center border-2 border-white">
            <Sparkles className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
            <p className="font-display text-lg font-bold text-slate-800">
              {st.webglFallback}
            </p>
            <button
              type="button"
              onClick={handleRequestExit}
              className="toy-btn mt-4 min-h-[44px] px-5 py-2 rounded-2xl bg-indigo-600 text-white font-display font-bold cursor-pointer"
            >
              {st.backToCategoryBtn}
            </button>
          </div>
        </div>
      )}

      {/* Clean Top HUD Bar (no backdrop-filter over WebGL) */}
      <header className="relative z-20 flex items-center justify-between gap-2 px-3 py-3 sm:px-6 sm:py-4 pointer-events-none">
        {/* Left: Exit / Pause + Mode Info */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={handleRequestExit}
            aria-label={st.exitFlight}
            style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
            className="toy-btn w-11 h-11 rounded-2xl bg-white/95 text-slate-700 flex items-center justify-center border-2 border-white cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {uiPhase !== 'GAME_OVER' && (
            <button
              type="button"
              onClick={handlePauseToggle}
              aria-label={uiPhase === 'PAUSED' ? st.resumeFlight : st.pauseTitle}
              style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
              className="toy-btn w-11 h-11 rounded-2xl bg-white/95 text-indigo-600 flex items-center justify-center border-2 border-white cursor-pointer shrink-0"
            >
              {uiPhase === 'PAUSED' ? (
                <Play className="w-5 h-5 fill-current" />
              ) : (
                <Pause className="w-5 h-5" />
              )}
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-white/90 px-3.5 py-2 border-2 border-white shadow-sm">
            <Wand2 className="w-4 h-4 text-pink-500 shrink-0" />
            <span className="font-display text-sm font-bold text-slate-800 whitespace-nowrap">
              {categoryLabel} · {levelLabel}
            </span>
          </div>
        </div>

        {/* Center: 2 Glowing Hearts */}
        <div
          className="flex items-center gap-2 rounded-2xl bg-slate-900/75 px-4 py-2 border-2 border-white/40 shadow-md pointer-events-auto"
          aria-label={`Hearts: ${hearts} of 2`}
        >
          {[0, 1].map((idx) => {
            const active = idx < hearts;
            return (
              <Heart
                key={idx}
                className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300 ${
                  active
                    ? 'text-rose-400 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.85)] scale-105'
                    : 'text-slate-500/70 fill-slate-700/40 scale-90'
                }`}
              />
            );
          })}
        </div>

        {/* Right: Live Star Counter & Mute */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 rounded-2xl bg-white/95 px-3.5 py-2 border-2 border-white shadow-sm">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400 shrink-0" />
            <span className="font-display text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
              {starsEarned}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? t.header.unmute : t.header.mute}
            style={{
              boxShadow: muted ? '0 4px 0 0 #CBD5E1' : '0 4px 0 0 #0284C7',
            }}
            className={`toy-btn w-11 h-11 rounded-2xl flex items-center justify-center border-2 border-white cursor-pointer shrink-0 ${
              muted ? 'bg-slate-200 text-slate-600' : 'bg-sky-400 text-white'
            }`}
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Subtle Bottom Swipe Control Hint during active flight */}
      {uiPhase === 'FLYING' && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4 w-full max-w-md flex justify-center">
          <div className="rounded-2xl bg-slate-900/70 text-white px-4 py-2 text-xs sm:text-sm font-semibold text-center border border-white/25 shadow-md">
            {st.swipeHint}
          </div>
        </div>
      )}

      {/* Blast / Oops Feedback Banner */}
      {feedbackBanner && (uiPhase === 'BLASTING' || uiPhase === 'WRONG_SHAKE' || uiPhase === 'ORBIT_OUT') && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div
            className={`rounded-2xl px-5 py-2.5 font-display text-base sm:text-lg font-bold border-2 border-white shadow-lg ${
              blastResultRef.current === 'correct'
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 text-white'
            }`}
          >
            {feedbackBanner}
          </div>
        </div>
      )}

      {/* Upright Pop-Up Question Modal during 45° Side-Profile View */}
      {uiPhase === 'QUESTION' && activeChallenge && (
        <div
          className="fixed inset-x-0 bottom-3 sm:bottom-6 z-30 flex justify-center px-3 sm:px-5 pointer-events-none"
          role="dialog"
          aria-modal="true"
          aria-label={st.obstacleBlocked}
        >
          <div className="clay-surface pointer-events-auto w-full max-w-xl rounded-[28px] p-4 sm:p-6 border-2 border-white shadow-2xl flex flex-col gap-3.5 bg-white/95">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    {activeChallenge.kind === 'math'
                      ? st.mathTitle
                      : activeChallenge.kind === 'english'
                      ? st.englishTitle
                      : activeChallenge.kind === 'music_note'
                      ? st.musicNoteTitle
                      : st.musicChordTitle}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    {st.obstacleBlocked}
                  </p>
                </div>
              </div>

              {(activeChallenge.kind === 'english' ||
                activeChallenge.kind === 'music_note' ||
                activeChallenge.kind === 'music_chord') && (
                <button
                  type="button"
                  onClick={() => playChallengeAudio(activeChallenge)}
                  style={{
                    background: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)',
                    boxShadow: '0 4px 0 0 #075985',
                  }}
                  className="toy-btn min-h-[40px] px-3.5 py-1.5 rounded-xl text-white font-display text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-white/40 cursor-pointer shrink-0"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>
                    {activeChallenge.kind === 'english'
                      ? st.hearWord
                      : st.listenAgain}
                  </span>
                </button>
              )}
            </div>

            {/* Category-Specific Prompt Body */}
            {activeChallenge.kind === 'math' && (
              <>
                <div className="rounded-2xl bg-sky-50 border-2 border-sky-100 px-4 py-3 text-center">
                  <div className="text-xs font-bold text-sky-700 mb-1">
                    {st.mathPrompt}
                  </div>
                  <div className="font-display text-2xl sm:text-4xl font-bold text-slate-900 tabular-nums">
                    {activeChallenge.expression} = ?
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {activeChallenge.choices.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAnswerChallenge(val)}
                      style={{
                        background: 'linear-gradient(180deg, #A78BFA 0%, #7C3AED 100%)',
                        boxShadow: '0 5px 0 0 #5B21B6',
                      }}
                      className="toy-btn min-h-[50px] rounded-2xl text-white font-display text-xl sm:text-2xl font-bold border-2 border-white/40 cursor-pointer tabular-nums"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </>
            )}

            {activeChallenge.kind === 'english' && (
              <>
                <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-100 px-4 py-3 flex items-center gap-3.5">
                  <span className="text-4xl sm:text-5xl select-none shrink-0">
                    {activeChallenge.target.emoji}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-emerald-700">
                      {st.englishPrompt}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mt-0.5">
                      {activeChallenge.target.hint}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {activeChallenge.choices.map((wordOption) => (
                    <button
                      key={wordOption}
                      type="button"
                      onClick={() => handleAnswerChallenge(wordOption)}
                      style={{
                        background: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
                        boxShadow: '0 5px 0 0 #065F46',
                      }}
                      className="toy-btn min-h-[48px] px-3 rounded-2xl text-white font-display text-lg sm:text-xl font-bold border-2 border-white/40 cursor-pointer capitalize"
                    >
                      {wordOption}
                    </button>
                  ))}
                </div>
              </>
            )}

            {(activeChallenge.kind === 'music_note' ||
              activeChallenge.kind === 'music_chord') && (
              <>
                <div className="rounded-2xl bg-pink-50 border-2 border-pink-100 px-4 py-2.5 text-center">
                  <div className="text-sm font-bold text-pink-700">
                    {st.musicPrompt}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {activeChallenge.choices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleAnswerChallenge(choice.id)}
                      style={{
                        background: 'linear-gradient(180deg, #F472B6 0%, #DB2777 100%)',
                        boxShadow: '0 5px 0 0 #9D174D',
                      }}
                      className="toy-btn min-h-[48px] px-3 rounded-2xl text-white font-display text-base sm:text-lg font-bold border-2 border-white/40 cursor-pointer"
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {uiPhase === 'PAUSED' && !confirmExit && !externalLocked && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/55 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={st.pauseTitle}
        >
          <div className="clay-surface rounded-[32px] p-6 sm:p-7 w-full max-w-sm border-2 border-white flex flex-col items-center gap-4 text-center shadow-2xl bg-white">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Pause className="w-7 h-7" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              {st.pauseTitle}
            </h2>

            <div className="w-full flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                onClick={handlePauseToggle}
                style={{
                  background: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
                  boxShadow: '0 6px 0 0 #065F46',
                }}
                className="toy-btn min-h-[48px] px-5 py-2.5 rounded-2xl text-white font-display text-lg font-bold flex items-center justify-center gap-2 border-2 border-white/40 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{st.resumeFlight}</span>
              </button>

              <button
                type="button"
                onClick={handleRequestExit}
                style={{ boxShadow: '0 4px 0 0 #FECDD3' }}
                className="toy-btn min-h-[46px] px-5 py-2 rounded-2xl bg-rose-50 text-rose-700 font-display text-base font-bold flex items-center justify-center gap-2 border-2 border-rose-200 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{st.exitFlight}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {uiPhase === 'GAME_OVER' && !externalLocked && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={st.gameOverTitle}
        >
          <div className="clay-surface rounded-[34px] p-6 sm:p-8 w-full max-w-md border-2 border-white flex flex-col items-center gap-4 text-center shadow-2xl bg-white">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-500 flex items-center justify-center border-2 border-amber-200 shadow-inner">
              <Star className="w-9 h-9 fill-amber-400 text-amber-500" />
            </div>

            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                {st.gameOverTitle}
              </h2>
              <p className="text-sm font-semibold text-slate-500 mt-1">
                {st.gameOverSubtitle}
              </p>
            </div>

            <div className="w-full grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-3.5 bg-amber-50 border-2 border-amber-200">
                <div className="text-xs font-bold text-amber-700">
                  {st.starsCollectedLabel}
                </div>
                <div className="font-display text-3xl font-bold text-amber-600 tabular-nums mt-0.5">
                  {starsEarned}
                </div>
              </div>
              <div className="rounded-2xl p-3.5 bg-indigo-50 border-2 border-indigo-200">
                <div className="text-xs font-bold text-indigo-700">
                  {st.obstaclesClearedLabel}
                </div>
                <div className="font-display text-3xl font-bold text-indigo-600 tabular-nums mt-0.5">
                  {obstaclesCleared}
                </div>
              </div>
            </div>

            {(runRewards.wardrobe.length > 0 || runRewards.rewards.length > 0) && (
              <div className="w-full rounded-2xl p-3 bg-pink-50 border-2 border-pink-200 text-xs font-bold text-pink-700">
                {t.common.unlockedPrefix}{' '}
                {[
                  ...runRewards.rewards.map((r) => t.rewards.items[r.id]?.name ?? r.name),
                  ...runRewards.wardrobe.map((w) => t.wardrobe.items[w.id] ?? w.name),
                ].join(' · ')}
              </div>
            )}

            {profile.flightTurns <= 0 && (
              <p className="text-xs sm:text-sm font-semibold text-slate-500 leading-relaxed">
                {st.noTurnsLeftMsg}
              </p>
            )}

            <div className={`w-full grid grid-cols-1 ${profile.flightTurns > 0 ? 'sm:grid-cols-2' : ''} gap-2.5 pt-1`}>
              {profile.flightTurns > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onConsumeFlightTurn();
                    handleReplay();
                  }}
                  style={{
                    background: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
                    boxShadow: '0 6px 0 0 #065F46',
                  }}
                  className="toy-btn min-h-[48px] px-5 py-2.5 rounded-2xl text-white font-display text-base sm:text-lg font-bold flex items-center justify-center gap-2 border-2 border-white/40 cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>{st.flyAgainWithTurnBtn(profile.flightTurns)}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleRequestExit}
                style={{ boxShadow: '0 5px 0 0 #CBD5E1' }}
                className="toy-btn min-h-[48px] px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-display text-base font-bold flex items-center justify-center gap-2 border-2 border-slate-200 cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{st.backToCategoryBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "Are you sure?" Yes / No Exit Confirmation */}
      <ConfirmCloseDialog
        open={confirmExit}
        language={language}
        message={t.common.confirmExitGameMessage}
        onConfirm={handleConfirmExit}
        onCancel={() => setConfirmExit(false)}
      />
    </div>
  );
}
