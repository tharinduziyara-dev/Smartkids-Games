import * as THREE from 'three';
import {
  DEFAULT_EQUIPPED_WARDROBE,
  EquippedWardrobe,
  WARDROBE_CATALOG,
} from '../types/game';

export interface FairyRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  hairFlowGroup: THREE.Group;
  leftUpperWing: THREE.Group;
  rightUpperWing: THREE.Group;
  leftLowerWing: THREE.Group;
  rightLowerWing: THREE.Group;
  wingSparkles: THREE.Mesh[];
  leftArmPivot: THREE.Group;
  wandArmPivot: THREE.Group;
  wandTipAnchor: THREE.Object3D;
  wandGemMat: THREE.MeshStandardMaterial;
  haloRing: THREE.Mesh;
  shieldBubble: THREE.Mesh;
}

export function createSkyDomeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.0, '#1E1B4B'); // deep twilight indigo zenith
  grad.addColorStop(0.24, '#3B82F6'); // vibrant royal sky blue
  grad.addColorStop(0.52, '#7DD3FC'); // luminous turquoise horizon sky
  grad.addColorStop(0.72, '#FDE68A'); // warm sunlit golden band
  grad.addColorStop(0.86, '#FBCFE8'); // soft rose horizon mist
  grad.addColorStop(1.0, '#DDD6FE'); // pastel lavender lower sky
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle painted stars in upper sky
  for (let i = 0; i < 85; i++) {
    const x = ((i * 197 + 43) % 512);
    const y = ((i * 89 + 19) % 210);
    const r = (i % 3 === 0 ? 1.8 : 1.0);
    ctx.fillStyle = `rgba(255, 255, 240, ${0.35 + (i % 5) * 0.12})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createGlowSpriteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.35, 'rgba(255, 245, 190, 0.78)');
  grad.addColorStop(0.7, 'rgba(251, 191, 36, 0.24)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createStarShape(outerR: number, innerR: number, points = 5): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function resolveWardrobeColors(equipped?: EquippedWardrobe) {
  const eq = equipped ?? DEFAULT_EQUIPPED_WARDROBE;
  const findItem = (id: string) =>
    WARDROBE_CATALOG.find((item) => item.id === id) ?? WARDROBE_CATALOG[0];

  return {
    dress: findItem(eq.dress),
    shoes: findItem(eq.shoes),
    crown: findItem(eq.crown),
    wings: findItem(eq.wings),
  };
}

export function createFairyPrincess(equipped?: EquippedWardrobe): FairyRig {
  const colors = resolveWardrobeColors(equipped);
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  // Slight forward flying tilt along -Z
  bodyGroup.rotation.x = -0.24;
  root.add(bodyGroup);

  const skinMat = new THREE.MeshStandardMaterial({
    color: '#FFE3CF',
    roughness: 0.44,
    metalness: 0.02,
  });
  const noseMat = new THREE.MeshStandardMaterial({
    color: '#FBC7AE',
    roughness: 0.46,
    metalness: 0.02,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: '#9A4616',
    roughness: 0.38,
    metalness: 0.14,
  });
  const hairHighlightMat = new THREE.MeshStandardMaterial({
    color: '#B45309',
    roughness: 0.34,
    metalness: 0.18,
  });
  const dressPrimaryMat = new THREE.MeshPhysicalMaterial({
    color: colors.dress.primaryColor,
    roughness: 0.32,
    metalness: 0.1,
    clearcoat: 0.45,
    clearcoatRoughness: 0.25,
  });
  const dressSecondaryMat = new THREE.MeshPhysicalMaterial({
    color: colors.dress.secondaryColor,
    roughness: 0.28,
    metalness: 0.18,
    clearcoat: 0.55,
    clearcoatRoughness: 0.2,
  });
  const petalSheerMat = new THREE.MeshPhysicalMaterial({
    color: colors.dress.accentColor,
    emissive: colors.dress.primaryColor,
    emissiveIntensity: 0.15,
    roughness: 0.22,
    metalness: 0.15,
    clearcoat: 0.7,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
  });
  const accentGoldMat = new THREE.MeshStandardMaterial({
    color: colors.dress.accentColor,
    roughness: 0.18,
    metalness: 0.82,
    emissive: colors.dress.accentColor,
    emissiveIntensity: 0.2,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color: colors.shoes.primaryColor,
    roughness: 0.24,
    metalness: 0.4,
  });
  const crownMat = new THREE.MeshStandardMaterial({
    color: colors.crown.primaryColor,
    roughness: 0.14,
    metalness: 0.9,
    emissive: colors.crown.accentColor,
    emissiveIntensity: 0.24,
  });
  const crownGemMat = new THREE.MeshPhysicalMaterial({
    color: colors.crown.accentColor,
    emissive: colors.crown.accentColor,
    emissiveIntensity: 0.72,
    roughness: 0.1,
    metalness: 0.2,
    clearcoat: 1.0,
  });
  const wingMat = new THREE.MeshPhysicalMaterial({
    color: colors.wings.primaryColor,
    emissive: colors.wings.secondaryColor,
    emissiveIntensity: 0.4,
    roughness: 0.12,
    metalness: 0.06,
    transparent: true,
    opacity: 0.78,
    clearcoat: 1.0,
    iridescence: 0.9,
    iridescenceIOR: 1.32,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const wingVeinMat = new THREE.MeshStandardMaterial({
    color: colors.wings.accentColor,
    emissive: colors.wings.accentColor,
    emissiveIntensity: 0.55,
    roughness: 0.2,
    metalness: 0.55,
  });
  const wingSparkleMat = new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    emissive: '#FEF08A',
    emissiveIntensity: 1.1,
    roughness: 0.1,
    metalness: 0.85,
  });

  // 1. Sculpted Bodice (LatheGeometry silhouette) + Sweetheart Collar & Sleeves
  const bodicePoints = [
    new THREE.Vector2(0.0, -0.02),
    new THREE.Vector2(0.18, 0.0),
    new THREE.Vector2(0.145, 0.14),
    new THREE.Vector2(0.205, 0.34),
    new THREE.Vector2(0.16, 0.46),
    new THREE.Vector2(0.08, 0.48),
    new THREE.Vector2(0.0, 0.48),
  ];
  const torso = new THREE.Mesh(
    new THREE.LatheGeometry(bodicePoints, 24),
    dressSecondaryMat
  );
  torso.position.y = 0.02;
  torso.castShadow = true;
  bodyGroup.add(torso);

  // Neck
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.064, 0.08, 0.14, 14),
    skinMat
  );
  neck.position.y = 0.5;
  bodyGroup.add(neck);

  // Puffed fairy shoulder sleeves + neck jewel brooch
  [-0.21, 0.21].forEach((sx) => {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.092, 14, 12),
      petalSheerMat
    );
    puff.scale.set(1.05, 0.92, 1.0);
    puff.position.set(sx, 0.4, -0.01);
    bodyGroup.add(puff);
  });

  const brooch = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.052, 0),
    crownGemMat
  );
  brooch.scale.set(1.0, 1.25, 0.55);
  brooch.position.set(0, 0.37, -0.195);
  bodyGroup.add(brooch);

  // Golden Waist Sash + Cute Bow
  const sash = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.036, 10, 28),
    accentGoldMat
  );
  sash.rotation.x = Math.PI / 2;
  sash.position.y = 0.09;
  bodyGroup.add(sash);

  const bowKnot = new THREE.Mesh(
    new THREE.SphereGeometry(0.042, 10, 10),
    accentGoldMat
  );
  bowKnot.position.set(0, 0.09, 0.175);
  bodyGroup.add(bowKnot);

  [-0.075, 0.075].forEach((bx) => {
    const loop = new THREE.Mesh(
      new THREE.TorusGeometry(0.055, 0.018, 8, 16),
      petalSheerMat
    );
    loop.position.set(bx, 0.095, 0.19);
    loop.rotation.y = bx > 0 ? -0.45 : 0.45;
    bodyGroup.add(loop);
  });

  // 2. Graceful Layered Petal Fairy Gown
  const innerSkirtPoints = [
    new THREE.Vector2(0.15, 0.1),
    new THREE.Vector2(0.32, -0.08),
    new THREE.Vector2(0.49, -0.34),
    new THREE.Vector2(0.55, -0.54),
    new THREE.Vector2(0.0, -0.54),
  ];
  const skirt = new THREE.Mesh(
    new THREE.LatheGeometry(innerSkirtPoints, 26),
    dressPrimaryMat
  );
  skirt.castShadow = true;
  bodyGroup.add(skirt);

  // 8 overlapping beveled flower-petal overskirt panels
  const petalShape = new THREE.Shape();
  petalShape.moveTo(0, 0);
  petalShape.bezierCurveTo(0.14, -0.08, 0.21, -0.28, 0.12, -0.45);
  petalShape.quadraticCurveTo(0, -0.54, -0.12, -0.45);
  petalShape.bezierCurveTo(-0.21, -0.28, -0.14, -0.08, 0, 0);

  const petalGeo = new THREE.ExtrudeGeometry(petalShape, {
    depth: 0.016,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 2,
  });

  const petalCount = 8;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const petalPivot = new THREE.Group();
    petalPivot.position.y = 0.09;
    petalPivot.rotation.y = angle;

    const petal = new THREE.Mesh(
      petalGeo,
      i % 2 === 0 ? dressSecondaryMat : petalSheerMat
    );
    petal.position.set(0, 0, 0.155);
    petal.rotation.x = -0.56 - (i % 2) * 0.08;
    petalPivot.add(petal);
    bodyGroup.add(petalPivot);
  }

  const hemRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.545, 0.024, 10, 32),
    accentGoldMat
  );
  hemRing.rotation.x = Math.PI / 2;
  hemRing.position.y = -0.535;
  bodyGroup.add(hemRing);

  // 3. Legs & Fairy Slippers trailing gracefully in flight
  [-0.11, 0.11].forEach((xOff, i) => {
    const legGroup = new THREE.Group();
    legGroup.position.set(xOff, -0.46, 0.04);
    legGroup.rotation.x = i === 0 ? 0.34 : 0.52;
    const leg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.05, 0.34, 8, 12),
      skinMat
    );
    leg.position.y = -0.19;
    legGroup.add(leg);

    const shoe = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.06, 0.12, 8, 12),
      shoeMat
    );
    shoe.rotation.x = Math.PI / 2;
    shoe.position.set(0, -0.4, -0.055);
    legGroup.add(shoe);

    const shoeStrap = new THREE.Mesh(
      new THREE.TorusGeometry(0.054, 0.01, 6, 16),
      accentGoldMat
    );
    shoeStrap.rotation.x = Math.PI / 2;
    shoeStrap.position.set(0, -0.34, 0);
    legGroup.add(shoeStrap);

    bodyGroup.add(legGroup);
  });

  // 4. Sculpted Princess Head, Cute Face, Flowing Hair & Jeweled Tiara
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.74, -0.02);
  headGroup.rotation.x = 0.2;
  bodyGroup.add(headGroup);

  // Softly oval princess face
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 28, 24), skinMat);
  head.scale.set(1.03, 0.99, 0.97);
  head.castShadow = true;
  headGroup.add(head);

  // Cute ears + tiny golden pearl studs
  [-0.245, 0.245].forEach((earX) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 10), skinMat);
    ear.scale.set(0.55, 0.95, 0.75);
    ear.position.set(earX, -0.02, -0.01);
    headGroup.add(ear);

    const earring = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 10, 10),
      accentGoldMat
    );
    earring.position.set(earX * 1.03, -0.06, -0.01);
    headGroup.add(earring);
  });

  // Large Expressive Sparkling Eyes + Eyelashes + Eyebrows
  const scleraMat = new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    roughness: 0.16,
    metalness: 0.02,
  });
  const irisMat = new THREE.MeshPhysicalMaterial({
    color: '#4338CA',
    emissive: '#3730A3',
    emissiveIntensity: 0.22,
    roughness: 0.08,
    metalness: 0.1,
    clearcoat: 1.0,
  });
  const pupilMat = new THREE.MeshStandardMaterial({
    color: '#0F172A',
    roughness: 0.06,
  });
  const sparkleEyeMat = new THREE.MeshBasicMaterial({
    color: '#FFFFFF',
  });
  const lashMat = new THREE.MeshStandardMaterial({
    color: '#1E1B4B',
    roughness: 0.35,
  });
  const cheekMat = new THREE.MeshStandardMaterial({
    color: '#FB7185',
    roughness: 0.55,
    transparent: true,
    opacity: 0.72,
  });
  const lipMat = new THREE.MeshStandardMaterial({
    color: '#F43F5E',
    roughness: 0.26,
    metalness: 0.05,
  });

  [-1, 1].forEach((side) => {
    const eyePivot = new THREE.Group();
    eyePivot.position.set(side * 0.088, 0.012, -0.214);
    eyePivot.rotation.y = -side * 0.24;
    headGroup.add(eyePivot);

    // White sclera oval
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 14), scleraMat);
    sclera.scale.set(0.92, 1.15, 0.45);
    eyePivot.add(sclera);

    // Rich sapphire-violet iris
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 14), irisMat);
    iris.scale.set(0.95, 1.12, 0.46);
    iris.position.set(-side * 0.004, -0.002, -0.008);
    eyePivot.add(iris);

    // Glossy dark pupil
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 12), pupilMat);
    pupil.scale.set(0.95, 1.08, 0.5);
    pupil.position.set(-side * 0.004, -0.002, -0.015);
    eyePivot.add(pupil);

    // Two crisp white eye-catchlights (sparkles)
    const bigGlint = new THREE.Mesh(
      new THREE.SphereGeometry(0.013, 8, 8),
      sparkleEyeMat
    );
    bigGlint.position.set(side * 0.014, 0.018, -0.025);
    eyePivot.add(bigGlint);

    const smallGlint = new THREE.Mesh(
      new THREE.SphereGeometry(0.007, 8, 8),
      sparkleEyeMat
    );
    smallGlint.position.set(-side * 0.014, -0.014, -0.024);
    eyePivot.add(smallGlint);

    // Curved upper lash line
    const lashArc = new THREE.Mesh(
      new THREE.TorusGeometry(0.052, 0.008, 8, 16, Math.PI * 0.78),
      lashMat
    );
    lashArc.position.set(0, 0.006, -0.012);
    lashArc.rotation.z = Math.PI * 0.11;
    eyePivot.add(lashArc);

    // 3 cute flared outer eyelashes
    [0, 1, 2].forEach((lashIdx) => {
      const lash = new THREE.Mesh(
        new THREE.ConeGeometry(0.0065, 0.032, 6),
        lashMat
      );
      lash.position.set(
        side * (0.042 + lashIdx * 0.006),
        0.022 + lashIdx * 0.012,
        -0.01
      );
      lash.rotation.z = -side * (0.72 + lashIdx * 0.24);
      lash.rotation.x = -0.2;
      eyePivot.add(lash);
    });

    // Delicate arched eyebrow
    const brow = new THREE.Mesh(
      new THREE.TorusGeometry(0.045, 0.0065, 6, 12, Math.PI * 0.52),
      hairMat
    );
    brow.position.set(side * 0.088, 0.095, -0.215);
    brow.rotation.y = -side * 0.24;
    brow.rotation.z = Math.PI * 0.24;
    headGroup.add(brow);

    // Soft rosy cheek
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 10), cheekMat);
    cheek.scale.set(1.25, 0.68, 0.45);
    cheek.position.set(side * 0.135, -0.052, -0.198);
    cheek.rotation.y = -side * 0.42;
    headGroup.add(cheek);
  });

  // Cute Tiny Sculpted Nose (clearly visible in 3/4 and side profile)
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), noseMat);
  nose.scale.set(0.95, 0.85, 1.28);
  nose.position.set(0, -0.038, -0.246);
  headGroup.add(nose);

  // Sweet Smiling Mouth (warm rosy upturned curve)
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.036, 0.0085, 8, 16, Math.PI * 0.72),
    lipMat
  );
  smile.position.set(0, -0.092, -0.228);
  smile.rotation.x = 0.24;
  smile.rotation.z = Math.PI + Math.PI * 0.14;
  headGroup.add(smile);

  // Styled Hair: Cap, Parted Side Bangs, Crown Bun & Flowing Wind Locks
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.268, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.64),
    hairMat
  );
  hairCap.rotation.x = 0.36;
  hairCap.position.set(0, 0.015, 0.02);
  headGroup.add(hairCap);

  // Side-swept parted bangs framing temples
  [-1, 1].forEach((side) => {
    const bangCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.21, -0.19),
      new THREE.Vector3(side * 0.11, 0.17, -0.22),
      new THREE.Vector3(side * 0.21, 0.04, -0.17),
      new THREE.Vector3(side * 0.23, -0.14, -0.05),
    ]);
    const bangGeo = new THREE.TubeGeometry(bangCurve, 16, 0.042, 10, false);
    const bang = new THREE.Mesh(bangGeo, hairHighlightMat);
    headGroup.add(bang);
  });

  // High crown bun + satin ribbon ring
  const hairBun = new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 14), hairMat);
  hairBun.position.set(0, 0.17, 0.22);
  headGroup.add(hairBun);

  const hairRibbon = new THREE.Mesh(
    new THREE.TorusGeometry(0.105, 0.02, 8, 20),
    dressPrimaryMat
  );
  hairRibbon.rotation.x = Math.PI * 0.36;
  hairRibbon.position.set(0, 0.15, 0.205);
  headGroup.add(hairRibbon);

  // Flowing styled hair locks streaming gracefully behind her in flight
  const hairFlowGroup = new THREE.Group();
  hairFlowGroup.position.set(0, 0.14, 0.21);
  headGroup.add(hairFlowGroup);

  const lockSpecs: Array<{ x: number; spreadX: number; dropY: number; lenZ: number; rad: number }> = [
    { x: 0, spreadX: 0, dropY: -0.44, lenZ: 0.44, rad: 0.062 },
    { x: -0.08, spreadX: -0.16, dropY: -0.38, lenZ: 0.4, rad: 0.052 },
    { x: 0.08, spreadX: 0.16, dropY: -0.38, lenZ: 0.4, rad: 0.052 },
    { x: -0.14, spreadX: -0.26, dropY: -0.28, lenZ: 0.32, rad: 0.042 },
    { x: 0.14, spreadX: 0.26, dropY: -0.28, lenZ: 0.32, rad: 0.042 },
  ];

  lockSpecs.forEach((spec, idx) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(spec.x * 0.4, 0.02, -0.02),
      new THREE.Vector3(spec.x, -0.08, spec.lenZ * 0.38),
      new THREE.Vector3(spec.spreadX, spec.dropY * 0.55, spec.lenZ * 0.76),
      new THREE.Vector3(spec.spreadX * 1.15, spec.dropY, spec.lenZ),
    ]);
    const lockGeo = new THREE.TubeGeometry(curve, 18, spec.rad, 10, false);
    const lock = new THREE.Mesh(
      lockGeo,
      idx % 2 === 0 ? hairMat : hairHighlightMat
    );
    hairFlowGroup.add(lock);
  });

  // Shiny Jeweled Princess Tiara Crown
  const crownGroup = new THREE.Group();
  crownGroup.position.set(0, 0.225, -0.045);
  crownGroup.rotation.x = -0.16;

  const crownBand = new THREE.Mesh(
    new THREE.TorusGeometry(0.155, 0.018, 10, 24, Math.PI * 1.25),
    crownMat
  );
  crownBand.rotation.x = Math.PI / 2;
  crownBand.rotation.z = -Math.PI * 1.125;
  crownGroup.add(crownBand);

  const spireSpecs: Array<{ x: number; z: number; h: number; r: number }> = [
    { x: -0.125, z: -0.055, h: 0.072, r: 0.02 },
    { x: -0.068, z: -0.115, h: 0.105, r: 0.026 },
    { x: 0, z: -0.142, h: 0.145, r: 0.032 },
    { x: 0.068, z: -0.115, h: 0.105, r: 0.026 },
    { x: 0.125, z: -0.055, h: 0.072, r: 0.02 },
  ];

  spireSpecs.forEach((sp, idx) => {
    const spire = new THREE.Mesh(
      new THREE.ConeGeometry(sp.r, sp.h, 8),
      crownMat
    );
    spire.position.set(sp.x, sp.h * 0.5, sp.z);
    crownGroup.add(spire);

    const tipPearl = new THREE.Mesh(
      new THREE.SphereGeometry(idx === 2 ? 0.022 : 0.015, 10, 10),
      idx === 2 ? crownGemMat : crownMat
    );
    tipPearl.position.set(sp.x, sp.h + 0.01, sp.z);
    crownGroup.add(tipPearl);
  });

  // Center tiara diamond gem
  const tiaraGem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.036, 0),
    crownGemMat
  );
  tiaraGem.scale.set(0.95, 1.3, 0.65);
  tiaraGem.position.set(0, 0.055, -0.155);
  crownGroup.add(tiaraGem);
  headGroup.add(crownGroup);

  // 5. Left Arm
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.22, 0.39, 0);
  const leftArm = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.044, 0.28, 6, 10),
    skinMat
  );
  leftArm.position.set(-0.08, -0.14, -0.06);
  leftArm.rotation.z = -0.55;
  leftArm.rotation.x = -0.35;
  leftArmPivot.add(leftArm);
  bodyGroup.add(leftArmPivot);

  // 6. Right Arm + Magic Wand
  const wandArmPivot = new THREE.Group();
  wandArmPivot.position.set(0.22, 0.39, -0.02);
  const rightArm = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.044, 0.28, 6, 10),
    skinMat
  );
  rightArm.position.set(0.1, -0.04, -0.16);
  rightArm.rotation.x = Math.PI * 0.36;
  rightArm.rotation.z = -0.32;
  wandArmPivot.add(rightArm);

  // Wand rod & glowing star crystal
  const wandGroup = new THREE.Group();
  wandGroup.position.set(0.18, 0.02, -0.32);
  wandGroup.rotation.x = -Math.PI * 0.25;
  const rodMat = new THREE.MeshStandardMaterial({
    color: '#F8FAFC',
    roughness: 0.2,
    metalness: 0.55,
  });
  const wandRod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.025, 0.62, 10),
    rodMat
  );
  wandRod.position.y = 0.24;
  wandGroup.add(wandRod);

  const wandStarShape = createStarShape(0.135, 0.058, 5);
  const wandStarGeo = new THREE.ExtrudeGeometry(wandStarShape, {
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.012,
    bevelSegments: 2,
  });
  wandStarGeo.center();
  const wandGemMat = new THREE.MeshStandardMaterial({
    color: '#FDE047',
    emissive: '#F59E0B',
    emissiveIntensity: 0.95,
    roughness: 0.14,
    metalness: 0.72,
  });
  const wandStar = new THREE.Mesh(wandStarGeo, wandGemMat);
  wandStar.position.y = 0.58;
  wandGroup.add(wandStar);

  const wandTipAnchor = new THREE.Object3D();
  wandTipAnchor.position.set(0, 0.58, 0);
  wandGroup.add(wandTipAnchor);

  wandArmPivot.add(wandGroup);
  bodyGroup.add(wandArmPivot);

  // 7. Glowing Translucent Butterfly-Style Wings with Veins & Sparkles
  const upperWingShape = new THREE.Shape();
  upperWingShape.moveTo(0, 0);
  upperWingShape.bezierCurveTo(0.28, 0.55, 0.98, 0.85, 1.15, 0.45);
  upperWingShape.bezierCurveTo(1.24, 0.22, 1.08, 0.02, 0.92, -0.06);
  upperWingShape.bezierCurveTo(0.62, -0.18, 0.26, -0.14, 0, -0.06);
  upperWingShape.closePath();

  const upperWingGeo = new THREE.ExtrudeGeometry(upperWingShape, {
    depth: 0.01,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 2,
  });

  const lowerWingShape = new THREE.Shape();
  lowerWingShape.moveTo(0, 0);
  lowerWingShape.bezierCurveTo(0.35, -0.04, 0.82, -0.22, 0.78, -0.58);
  lowerWingShape.bezierCurveTo(0.74, -0.82, 0.45, -0.85, 0.28, -0.62);
  lowerWingShape.bezierCurveTo(0.14, -0.44, 0.06, -0.25, 0, -0.08);
  lowerWingShape.closePath();

  const lowerWingGeo = new THREE.ExtrudeGeometry(lowerWingShape, {
    depth: 0.01,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
  });

  // Glowing wing filigree curves + embedded sparkle gems
  const upperVeinCurve1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.02, 0.01, 0.015),
    new THREE.Vector3(0.45, 0.34, 0.015),
    new THREE.Vector3(0.96, 0.42, 0.015),
  ]);
  const upperVeinCurve2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.02, -0.02, 0.015),
    new THREE.Vector3(0.48, 0.08, 0.015),
    new THREE.Vector3(0.86, 0.04, 0.015),
  ]);
  const lowerVeinCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.02, -0.03, 0.015),
    new THREE.Vector3(0.36, -0.24, 0.015),
    new THREE.Vector3(0.56, -0.56, 0.015),
  ]);

  const upperVeinGeo1 = new THREE.TubeGeometry(upperVeinCurve1, 14, 0.01, 6, false);
  const upperVeinGeo2 = new THREE.TubeGeometry(upperVeinCurve2, 12, 0.0085, 6, false);
  const lowerVeinGeo = new THREE.TubeGeometry(lowerVeinCurve, 12, 0.009, 6, false);
  const wingSparkleGeo = new THREE.OctahedronGeometry(0.028, 0);

  const wingSparkles: THREE.Mesh[] = [];

  const buildWingSide = (isUpper: boolean, sideSign: 1 | -1): THREE.Group => {
    const wingPivot = new THREE.Group();
    wingPivot.scale.x = sideSign;
    wingPivot.position.set(sideSign * 0.075, isUpper ? 0.34 : 0.21, 0.165);

    const membrane = new THREE.Mesh(isUpper ? upperWingGeo : lowerWingGeo, wingMat);
    membrane.renderOrder = 2;
    wingPivot.add(membrane);

    if (isUpper) {
      wingPivot.add(new THREE.Mesh(upperVeinGeo1, wingVeinMat));
      wingPivot.add(new THREE.Mesh(upperVeinGeo2, wingVeinMat));
      const sparkleCoords: Array<[number, number]> = [
        [0.42, 0.34],
        [0.74, 0.44],
        [0.98, 0.36],
        [0.64, 0.12],
      ];
      sparkleCoords.forEach(([sx, sy]) => {
        const sp = new THREE.Mesh(wingSparkleGeo, wingSparkleMat);
        sp.position.set(sx, sy, 0.02);
        wingPivot.add(sp);
        wingSparkles.push(sp);
      });
    } else {
      wingPivot.add(new THREE.Mesh(lowerVeinGeo, wingVeinMat));
      const sparkleCoords: Array<[number, number]> = [
        [0.36, -0.24],
        [0.58, -0.48],
        [0.44, -0.62],
      ];
      sparkleCoords.forEach(([sx, sy]) => {
        const sp = new THREE.Mesh(wingSparkleGeo, wingSparkleMat);
        sp.position.set(sx, sy, 0.02);
        wingPivot.add(sp);
        wingSparkles.push(sp);
      });
    }

    bodyGroup.add(wingPivot);
    return wingPivot;
  };

  const rightUpperWing = buildWingSide(true, 1);
  const leftUpperWing = buildWingSide(true, -1);
  const rightLowerWing = buildWingSide(false, 1);
  const leftLowerWing = buildWingSide(false, -1);

  // Subtle fairy aura ring + brief invulnerability shield
  const haloRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.78, 0.02, 8, 32),
    new THREE.MeshBasicMaterial({
      color: '#FDE68A',
      transparent: true,
      opacity: 0.35,
    })
  );
  haloRing.rotation.x = Math.PI / 2;
  haloRing.position.y = -0.1;
  root.add(haloRing);

  const shieldBubble = new THREE.Mesh(
    new THREE.SphereGeometry(0.98, 18, 16),
    new THREE.MeshBasicMaterial({
      color: '#7DD3FC',
      transparent: true,
      opacity: 0.0,
      wireframe: true,
    })
  );
  root.add(shieldBubble);

  return {
    root,
    bodyGroup,
    hairFlowGroup,
    leftUpperWing,
    rightUpperWing,
    leftLowerWing,
    rightLowerWing,
    wingSparkles,
    leftArmPivot,
    wandArmPivot,
    wandTipAnchor,
    wandGemMat,
    haloRing,
    shieldBubble,
  };
}

export function createStormCloudObstacle(): THREE.Group {
  const group = new THREE.Group();

  const stormMat = new THREE.MeshStandardMaterial({
    color: '#312E81',
    roughness: 0.85,
    metalness: 0.08,
    emissive: '#1E1B4B',
    emissiveIntensity: 0.45,
  });
  const darkPuffMat = new THREE.MeshStandardMaterial({
    color: '#4338CA',
    roughness: 0.78,
    metalness: 0.1,
  });

  const puffs: Array<[number, number, number, number]> = [
    [0, 0.12, 0, 0.68],
    [-0.56, -0.02, 0.12, 0.52],
    [0.56, -0.04, -0.1, 0.5],
    [-0.28, 0.34, -0.18, 0.46],
    [0.32, 0.3, 0.16, 0.44],
    [0, -0.18, 0.25, 0.42],
  ];

  puffs.forEach(([x, y, z, r], idx) => {
    const mesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r, 1),
      idx % 2 === 0 ? stormMat : darkPuffMat
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    group.add(mesh);
  });

  // Glowing lightning bolt beneath storm cloud
  const boltShape = new THREE.Shape();
  boltShape.moveTo(0.05, 0.3);
  boltShape.lineTo(-0.18, -0.05);
  boltShape.lineTo(0.02, -0.05);
  boltShape.lineTo(-0.12, -0.52);
  boltShape.lineTo(0.24, -0.02);
  boltShape.lineTo(0.04, -0.02);
  boltShape.closePath();

  const boltGeo = new THREE.ExtrudeGeometry(boltShape, {
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
  boltGeo.center();

  const boltMat = new THREE.MeshStandardMaterial({
    color: '#FDE047',
    emissive: '#F59E0B',
    emissiveIntensity: 1.15,
    roughness: 0.2,
    metalness: 0.5,
  });
  const bolt = new THREE.Mesh(boltGeo, boltMat);
  bolt.position.set(0, -0.55, 0.1);
  group.add(bolt);

  // Subtle warning ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.035, 8, 28),
    new THREE.MeshBasicMaterial({
      color: '#F43F5E',
      transparent: true,
      opacity: 0.55,
    })
  );
  group.add(ring);

  return group;
}

export function createStormCrystalObstacle(): THREE.Group {
  const group = new THREE.Group();

  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: '#E11D48',
    emissive: '#9F1239',
    emissiveIntensity: 0.55,
    roughness: 0.14,
    metalness: 0.25,
    clearcoat: 1.0,
    flatShading: true,
  });
  const shardMat = new THREE.MeshPhysicalMaterial({
    color: '#A855F7',
    emissive: '#7C3AED',
    emissiveIntensity: 0.6,
    roughness: 0.18,
    metalness: 0.35,
    clearcoat: 1.0,
    flatShading: true,
  });

  // Central spiky octahedron crystal
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.66, 0), crystalMat);
  core.scale.set(0.85, 1.45, 0.85);
  core.castShadow = true;
  group.add(core);

  // 4 angled side crystal spikes
  const angles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];
  angles.forEach((a, idx) => {
    const spike = new THREE.Mesh(
      new THREE.ConeGeometry(0.24, 0.92, 6),
      idx % 2 === 0 ? shardMat : crystalMat
    );
    spike.position.set(Math.cos(a) * 0.46, (idx % 2 === 0 ? 0.14 : -0.14), Math.sin(a) * 0.46);
    spike.rotation.z = -Math.cos(a) * 0.72;
    spike.rotation.x = Math.sin(a) * 0.72;
    group.add(spike);
  });

  // Orbiting diamond ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.88, 0.032, 8, 24),
    new THREE.MeshBasicMaterial({
      color: '#FDA4AF',
      transparent: true,
      opacity: 0.6,
    })
  );
  ring.rotation.x = Math.PI / 3;
  group.add(ring);

  return group;
}

export function createCollectibleStar(): THREE.Group {
  const group = new THREE.Group();
  const shape = createStarShape(0.46, 0.21, 5);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.035,
    bevelSegments: 2,
  });
  geo.center();

  const mat = new THREE.MeshStandardMaterial({
    color: '#FDE047',
    emissive: '#F59E0B',
    emissiveIntensity: 0.65,
    roughness: 0.18,
    metalness: 0.82,
  });
  const star = new THREE.Mesh(geo, mat);
  star.castShadow = true;
  group.add(star);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.56, 0.025, 8, 24),
    new THREE.MeshBasicMaterial({
      color: '#FEF08A',
      transparent: true,
      opacity: 0.55,
    })
  );
  group.add(halo);

  return group;
}

export function createParallaxCloud(): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    roughness: 0.92,
    metalness: 0.02,
    emissive: '#E0F2FE',
    emissiveIntensity: 0.18,
  });

  const parts: Array<[number, number, number, number]> = [
    [0, 0.2, 0, 1.3],
    [-1.1, 0, 0.2, 0.95],
    [1.15, -0.05, -0.15, 1.0],
    [-0.55, 0.45, -0.3, 0.88],
    [0.55, 0.38, 0.25, 0.9],
  ];

  parts.forEach(([x, y, z, r]) => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), mat);
    puff.position.set(x, y, z);
    puff.scale.y = 0.72;
    group.add(puff);
  });

  return group;
}

export function createSkyGateArch(): THREE.Group {
  const group = new THREE.Group();
  const archMat = new THREE.MeshStandardMaterial({
    color: '#FDE68A',
    roughness: 0.28,
    metalness: 0.65,
    emissive: '#F59E0B',
    emissiveIntensity: 0.18,
  });
  const crystalCapMat = new THREE.MeshStandardMaterial({
    color: '#67E8F9',
    emissive: '#06B6D4',
    emissiveIntensity: 0.45,
    roughness: 0.2,
    metalness: 0.3,
  });

  // Left & Right glowing sky-lane pillars along the edges (never blocking center lane)
  [-5.6, 5.6].forEach((xPos) => {
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.38, 4.2, 10),
      archMat
    );
    pillar.position.set(xPos, -1.8, 0);
    group.add(pillar);

    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.45, 0),
      crystalCapMat
    );
    gem.position.set(xPos, 0.55, 0);
    group.add(gem);
  });

  return group;
}
