import * as THREE from 'three';

export interface SceneState {
  step: number;
  status: 'idle' | 'running' | 'won';
  insecure: boolean;
  certSeen: boolean;
  checks: number;
  keyReady: boolean;
  secretSent: boolean;
}

export interface TlsSceneApi {
  update(next: SceneState): void;
  dispose(): void;
}

export interface SceneAnchor {
  id: 'packet0' | 'packet1' | 'cert' | 'eye';
  x: number;
  y: number;
  visible: boolean;
}

const PAL = {
  plain: 0xff9585,
  cert: 0xf6c57c,
  encrypted: 0x74e6d2,
  danger: 0xff5a4a,
  browser: 0x4b93e8,
  server: 0x18c2a3,
  idle: 0x8fa6bf,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function glowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.42)');
    gradient.addColorStop(0.65, 'rgba(255,255,255,0.09)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function roundedShape(width: number, height: number, radius: number): THREE.Shape {
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, Math.min(width, height) / 2);
  const shape = new THREE.Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

function slabGeometry(width: number, height: number, depth: number, radius: number): THREE.ExtrudeGeometry {
  const geometry = new THREE.ExtrudeGeometry(roundedShape(width, height, radius), {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 14,
  });
  geometry.center();
  return geometry;
}

export function createTlsScene(
  canvas: HTMLCanvasElement,
  options: {
    onCertClick: () => void;
    onAnchors?: (anchors: SceneAnchor[]) => void;
    reducedMotion: boolean;
  },
): TlsSceneApi {
  const reduced = options.reducedMotion;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x061020, 9.5, 21);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
  const lookAt = new THREE.Vector3(0, 0.86, 0);
  let distance = 10;

  const glow = glowTexture();

  /* ---------------- lighting ---------------- */
  scene.add(new THREE.HemisphereLight(0x9dc0f0, 0x050a12, 0.75));

  const keyLight = new THREE.DirectionalLight(0xe6efff, 2.1);
  keyLight.position.set(5.5, 8, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -7;
  keyLight.shadow.camera.right = 7;
  keyLight.shadow.camera.top = 7;
  keyLight.shadow.camera.bottom = -5;
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 26;
  keyLight.shadow.bias = -0.0012;
  keyLight.shadow.radius = 3;
  scene.add(keyLight);

  const browserLight = new THREE.PointLight(PAL.browser, 26, 10, 2);
  browserLight.position.set(3.2, 2.1, 1.8);
  scene.add(browserLight);

  const serverLight = new THREE.PointLight(PAL.server, 22, 10, 2);
  serverLight.position.set(-3.2, 2.3, 1.8);
  scene.add(serverLight);

  const packetLight = new THREE.PointLight(PAL.encrypted, 0, 5, 2);
  scene.add(packetLight);

  /* ---------------- floor ---------------- */
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x081422,
    metalness: 0.35,
    roughness: 0.85,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(44, 44), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(34, 56, 0x2f5c8f, 0x16283f);
  grid.position.y = 0.004;
  const gridMaterial = grid.material as THREE.LineBasicMaterial;
  gridMaterial.transparent = true;
  gridMaterial.opacity = 0.5;
  gridMaterial.depthWrite = false;
  scene.add(grid);

  const haloBlueprint: [number, number, number, number][] = [
    [2.55, 0.02, 0.1, PAL.browser],
    [-2.55, 0.02, 0.1, PAL.server],
  ];
  for (const [x, y, z, color] of haloBlueprint) {
    const halo = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 4.4),
      new THREE.MeshBasicMaterial({
        map: glow,
        color,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.set(x, y, z);
    scene.add(halo);
  }

  /* ---------------- dust ---------------- */
  const dustCount = 260;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i += 1) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 14;
    dustPositions[i * 3 + 1] = Math.random() * 4.2 + 0.2;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({
      color: 0x7fb0e0,
      size: 0.022,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(dust);

  /* ---------------- browser device ---------------- */
  const deviceMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a2c46,
    metalness: 0.62,
    roughness: 0.3,
    emissive: 0x102a44,
    emissiveIntensity: 0.6,
  });

  const browser = new THREE.Group();
  browser.position.set(2.55, 0.92, 0);
  browser.rotation.y = -0.24;

  const browserBody = new THREE.Mesh(slabGeometry(2.06, 1.32, 0.16, 0.16), deviceMaterial);
  browserBody.castShadow = true;
  browserBody.receiveShadow = true;
  browser.add(browserBody);

  const screenMaterial = new THREE.MeshStandardMaterial({
    color: 0x061020,
    metalness: 0.25,
    roughness: 0.16,
    emissive: 0x0a2136,
    emissiveIntensity: 0.95,
  });
  const screen = new THREE.Mesh(slabGeometry(1.8, 1.06, 0.02, 0.1), screenMaterial);
  screen.position.z = 0.095;
  browser.add(screen);

  const urlMaterial = new THREE.MeshStandardMaterial({
    color: 0x101f33,
    metalness: 0.25,
    roughness: 0.35,
    emissive: PAL.encrypted,
    emissiveIntensity: 0.5,
  });
  const urlBar = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.058, 0.02), urlMaterial);
  urlBar.position.set(0, 0.41, 0.11);
  browser.add(urlBar);

  const lineMaterial = new THREE.MeshStandardMaterial({
    color: 0x14304c,
    emissive: 0x1d5a86,
    emissiveIntensity: 0.5,
    roughness: 0.6,
  });
  [0.12, -0.02, -0.16].forEach((y, index) => {
    const line = new THREE.Mesh(new THREE.BoxGeometry(1.16 - index * 0.24, 0.045, 0.015), lineMaterial);
    line.position.set(0, y, 0.11);
    browser.add(line);
  });

  const padlock = new THREE.Group();
  const lockBodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xd9e6f5,
    emissive: PAL.danger,
    emissiveIntensity: 0.9,
    metalness: 0.5,
    roughness: 0.35,
  });
  const lockShackleMaterial = new THREE.MeshStandardMaterial({
    color: 0xd9e6f5,
    emissive: PAL.danger,
    emissiveIntensity: 0.75,
    metalness: 0.6,
    roughness: 0.3,
  });
  const lockBody = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.1, 0.05), lockBodyMaterial);
  const shackle = new THREE.Mesh(
    new THREE.TorusGeometry(0.048, 0.014, 8, 18, Math.PI),
    lockShackleMaterial,
  );
  shackle.position.y = 0.05;
  padlock.add(lockBody, shackle);
  padlock.position.set(0.66, 0.4, 0.13);
  padlock.scale.setScalar(0.85);
  browser.add(padlock);

  const browserEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(browserBody.geometry, 30),
    new THREE.LineBasicMaterial({ color: 0x3f7fb8, transparent: true, opacity: 0.55 }),
  );
  browser.add(browserEdges);

  scene.add(browser);

  /* ---------------- server rack ---------------- */
  const server = new THREE.Group();
  server.position.set(-2.55, 0, 0);
  server.rotation.y = 0.24;

  const bladeGeometry = slabGeometry(1.76, 0.42, 0.34, 0.07);
  const ledMaterial = new THREE.MeshStandardMaterial({
    color: 0x0c2b26,
    emissive: PAL.server,
    emissiveIntensity: 2.4,
    roughness: 0.3,
  });
  const leds: THREE.Mesh[] = [];

  [0.44, 0.94, 1.44].forEach((y, index) => {
    const blade = new THREE.Mesh(bladeGeometry, deviceMaterial);
    blade.position.set(0, y, 0);
    blade.castShadow = true;
    blade.receiveShadow = true;
    server.add(blade);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(blade.geometry, 30),
      new THREE.LineBasicMaterial({ color: 0x2b6f7f, transparent: true, opacity: 0.45 }),
    );
    edges.position.copy(blade.position);
    server.add(edges);

    for (let i = 0; i < 2; i += 1) {
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 10), ledMaterial.clone());
      led.position.set(0.66 - i * 0.14, y, 0.18);
      server.add(led);
      leds.push(led);
    }

    const ventMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a1826,
      emissive: 0x123c52,
      emissiveIntensity: 0.6,
      roughness: 0.8,
    });
    for (let i = 0; i < 3; i += 1) {
      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.018, 0.02), ventMaterial);
      vent.position.set(-0.28, y - 0.1 + i * 0.1, 0.18);
      server.add(vent);
    }
  });

  scene.add(server);

  /* ---------------- wire ---------------- */
  const wireCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(1.62, 0.98, 0.18),
    new THREE.Vector3(0.95, 0.5, 1.35),
    new THREE.Vector3(-0.95, 0.5, 1.35),
    new THREE.Vector3(-1.66, 0.98, 0.18),
  );

  const wireMaterial = new THREE.MeshStandardMaterial({
    color: 0x27496f,
    metalness: 0.7,
    roughness: 0.32,
    emissive: 0x123a5c,
    emissiveIntensity: 0.9,
  });
  const wire = new THREE.Mesh(new THREE.TubeGeometry(wireCurve, 120, 0.018, 10, false), wireMaterial);
  scene.add(wire);

  const wireGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0x2f7ac0,
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const wireGlow = new THREE.Mesh(new THREE.TubeGeometry(wireCurve, 120, 0.07, 8, false), wireGlowMaterial);
  scene.add(wireGlow);

  const arrowMaterial = new THREE.MeshStandardMaterial({
    color: 0xa8d4fb,
    emissive: 0x2f7ac0,
    emissiveIntensity: 1.3,
    metalness: 0.3,
    roughness: 0.4,
  });
  const arrowGeometry = new THREE.ConeGeometry(0.05, 0.13, 12);
  const upAxis = new THREE.Vector3(0, 1, 0);
  const arrows: THREE.Mesh[] = [];
  for (const t of [0.2, 0.5, 0.8]) {
    const point = wireCurve.getPointAt(t);
    const tangent = wireCurve.getTangentAt(t).normalize();
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.copy(point);
    arrow.quaternion.setFromUnitVectors(upAxis, tangent);
    scene.add(arrow);
    arrows.push(arrow);
  }

  for (const end of [0, 1]) {
    const point = wireCurve.getPointAt(end);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.055, 0.012, 8, 20),
      new THREE.MeshStandardMaterial({
        color: 0x8fc4f5,
        emissive: 0x2f7ac0,
        emissiveIntensity: 1.6,
        metalness: 0.4,
        roughness: 0.3,
      }),
    );
    ring.position.copy(point);
    ring.lookAt(end === 0 ? 4 : -4, point.y, 3);
    scene.add(ring);
  }

  const energyDots: THREE.Mesh[] = [];
  const dotGeometry = new THREE.SphereGeometry(0.019, 8, 8);
  const dotMaterial = new THREE.MeshBasicMaterial({
    color: 0x9fd0ff,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  for (let i = 0; i < 12; i += 1) {
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    scene.add(dot);
    energyDots.push(dot);
  }

  /* ---------------- certificate card ---------------- */
  const certGroup = new THREE.Group();
  certGroup.position.set(-1.55, 1.52, 1.05);
  certGroup.scale.setScalar(0.88);
  certGroup.visible = false;

  const certMaterial = new THREE.MeshStandardMaterial({
    color: 0xf3f8ff,
    emissive: 0x9dc4f0,
    emissiveIntensity: 0.55,
    metalness: 0.25,
    roughness: 0.4,
  });
  const certBody = new THREE.Mesh(slabGeometry(0.82, 0.54, 0.035, 0.08), certMaterial);
  certBody.castShadow = true;
  certGroup.add(certBody);

  const certStripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.54, 0.055, 0.04),
    new THREE.MeshStandardMaterial({
      color: 0xf6c57c,
      emissive: PAL.cert,
      emissiveIntensity: 1.7,
      roughness: 0.35,
    }),
  );
  certStripe.position.set(0, 0.15, 0.02);
  certGroup.add(certStripe);

  const certLockBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.08, 0.04),
    new THREE.MeshStandardMaterial({
      color: 0x4a6f96,
      emissive: 0x1d4b7a,
      emissiveIntensity: 1.1,
      roughness: 0.4,
    }),
  );
  certLockBody.position.set(0, -0.05, 0.025);
  certGroup.add(certLockBody);

  const certLockShackle = new THREE.Mesh(
    new THREE.TorusGeometry(0.036, 0.011, 8, 16, Math.PI),
    new THREE.MeshStandardMaterial({
      color: 0x4a6f96,
      emissive: 0x1d4b7a,
      emissiveIntensity: 1,
      roughness: 0.4,
    }),
  );
  certLockShackle.position.set(0, -0.005, 0.025);
  certGroup.add(certLockShackle);

  const certHalo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glow,
      color: PAL.cert,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  certHalo.scale.setScalar(1.5);
  certGroup.add(certHalo);

  const checkOrbs: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i += 1) {
    const orbMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1414,
      emissive: PAL.danger,
      emissiveIntensity: 0.7,
      roughness: 0.4,
    });
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), orbMaterial);
    orb.position.set(-0.18 + i * 0.18, -0.21, 0.03);
    certGroup.add(orb);
    checkOrbs.push(orb);
  }

  scene.add(certGroup);

  /* ---------------- session key ---------------- */
  const keyMaterial = new THREE.MeshStandardMaterial({
    color: 0x147a6f,
    emissive: PAL.encrypted,
    emissiveIntensity: 1.15,
    metalness: 0.5,
    roughness: 0.25,
  });
  const keyGeometry = new THREE.OctahedronGeometry(0.15, 0);

  const keyCenter = new THREE.Mesh(keyGeometry, keyMaterial);
  keyCenter.position.set(0, 1.45, 0.55);
  keyCenter.visible = false;
  scene.add(keyCenter);

  const keyCenterGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glow,
      color: PAL.encrypted,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  keyCenterGlow.scale.setScalar(1.2);
  keyCenter.add(keyCenterGlow);

  const keyEnds: THREE.Group[] = [];
  for (const x of [2.0, -2.0]) {
    const holder = new THREE.Group();
    const key = new THREE.Mesh(new THREE.OctahedronGeometry(0.095, 0), keyMaterial);
    const keyGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glow,
        color: PAL.encrypted,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    keyGlow.scale.setScalar(0.8);
    key.add(keyGlow);
    holder.add(key);
    holder.position.set(x, 1.5, 0.35);
    holder.visible = false;
    scene.add(holder);
    keyEnds.push(holder);
  }

  /* ---------------- eavesdropper ---------------- */
  const eye = new THREE.Group();
  eye.position.set(0.05, 0.62, 1.62);
  eye.visible = false;

  const eyeWhite = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 20, 16),
    new THREE.MeshStandardMaterial({ color: 0xdfe8f3, roughness: 0.2, metalness: 0.5 }),
  );
  const eyeIris = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0x3a1210,
      emissive: PAL.danger,
      emissiveIntensity: 2,
      roughness: 0.3,
    }),
  );
  eyeIris.position.z = 0.085;
  const eyeRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.1, 0.012, 8, 24),
    new THREE.MeshStandardMaterial({
      color: 0xff9b8f,
      emissive: PAL.danger,
      emissiveIntensity: 1.4,
      metalness: 0.4,
      roughness: 0.3,
    }),
  );
  eye.add(eyeWhite, eyeIris, eyeRim);
  scene.add(eye);

  /* ---------------- packets ---------------- */
  interface PacketNode {
    group: THREE.Group;
    core: THREE.Mesh;
    material: THREE.MeshStandardMaterial;
    sprite: THREE.Sprite;
    t: number;
    active: boolean;
  }

  const packets: PacketNode[] = [];
  for (let i = 0; i < 4; i += 1) {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color: 0x0c1826,
      emissive: PAL.encrypted,
      emissiveIntensity: 0.8,
      metalness: 0.3,
      roughness: 0.3,
    });
    const core = new THREE.Mesh(slabGeometry(0.34, 0.22, 0.04, 0.055), material);
    core.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(core.geometry, 30),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }),
      ),
    );
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glow,
        color: PAL.encrypted,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    sprite.scale.setScalar(0.7);
    group.add(core, sprite);
    group.visible = false;
    scene.add(group);
    packets.push({ group, core, material, sprite, t: i * 0.24, active: false });
  }

  /* ---------------- state + interaction ---------------- */
  let state: SceneState = {
    step: 0,
    status: 'idle',
    insecure: false,
    certSeen: false,
    checks: 0,
    keyReady: false,
    secretSent: false,
  };
  let safe = false;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const anchorVec = new THREE.Vector3();
  const anchors: SceneAnchor[] = [];
  let dragging = false;
  let moved = 0;
  let lastX = 0;
  let lastY = 0;
  let yaw = 0;
  let pitch = 0.1;
  let targetYaw = 0;
  let targetPitch = 0.1;

  function pickCert(clientX: number, clientY: number): boolean {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObject(certBody, false).length > 0;
  }

  function update(next: SceneState) {
    state = next;
    safe = next.step >= 5 && !next.insecure;

    certGroup.visible = next.step >= 2 && next.step <= 3;
    keyCenter.visible = next.step >= 4 && !next.keyReady;
    for (const holder of keyEnds) holder.visible = next.step >= 4 && next.keyReady;
    eye.visible = next.insecure || next.step === 6;

    urlMaterial.emissive.setHex(next.insecure ? PAL.danger : safe ? PAL.encrypted : PAL.idle);
    urlMaterial.emissiveIntensity = safe ? 0.95 : 0.5;

    lockBodyMaterial.emissive.setHex(safe ? PAL.encrypted : PAL.danger);
    lockShackleMaterial.emissive.setHex(safe ? PAL.encrypted : PAL.danger);
    shackle.position.y = safe ? 0.05 : 0.105;
    shackle.rotation.z = safe ? 0 : -0.42;

    wireMaterial.emissive.setHex(next.insecure ? 0x5c1a16 : 0x123a5c);
    wireMaterial.emissiveIntensity = next.insecure ? 1.6 : 0.9;
    wireGlowMaterial.color.setHex(next.insecure ? PAL.danger : 0x2f7ac0);
    for (const arrow of arrows) {
      (arrow.material as THREE.MeshStandardMaterial).emissive.setHex(
        next.insecure ? PAL.danger : 0x2f7ac0,
      );
    }

    checkOrbs.forEach((orb, index) => {
      const material = orb.material as THREE.MeshStandardMaterial;
      const done = index < next.checks;
      material.emissive.setHex(done ? PAL.encrypted : PAL.danger);
      material.emissiveIntensity = done ? 2.2 : 0.7;
    });

    certMaterial.emissive.setHex(next.checks >= 3 ? PAL.encrypted : 0x9dc4f0);
    certMaterial.emissiveIntensity = next.checks >= 3 ? 0.8 : 0.55;

    if (safe) {
      browserLight.color.setHex(PAL.encrypted);
      serverLight.color.setHex(PAL.encrypted);
    } else {
      browserLight.color.setHex(next.insecure ? PAL.danger : PAL.browser);
      serverLight.color.setHex(next.insecure ? PAL.danger : PAL.server);
    }

    for (const led of leds) {
      const material = led.material as THREE.MeshStandardMaterial;
      material.emissive.setHex(next.insecure ? PAL.danger : PAL.server);
    }

    if (reduced) {
      const wanted = desiredPackets();
      packets.forEach((packet, index) => {
        const spec = wanted[index];
        packet.active = Boolean(spec);
        packet.group.visible = Boolean(spec);
        if (!spec) return;
        packet.t = index === 0 ? 0.45 : 0.55;
        packet.group.position.copy(wireCurve.getPointAt(packet.t));
        packet.material.emissive.setHex(spec.tone);
        packet.sprite.material.color.setHex(spec.tone);
      });
      renderFrame(0, true);
    }
  }

  function desiredPackets(): { tone: number }[] {
    if (state.step === 1) return [{ tone: PAL.plain }];
    if (state.step === 4 && state.keyReady) return [{ tone: PAL.encrypted }];
    if (state.step === 5) return [{ tone: PAL.encrypted }, { tone: PAL.encrypted }];
    if (state.step === 6 && state.secretSent) {
      return [{ tone: state.insecure ? PAL.danger : PAL.encrypted }];
    }
    return [];
  }

  function layoutCamera(time: number) {
    const idle = reduced ? 0 : Math.sin(time * 0.14) * 0.07;
    const actualYaw = yaw + idle;
    const spring = Math.sin(pitch) * distance;
    camera.position.set(
      Math.sin(actualYaw) * Math.cos(pitch) * distance,
      lookAt.y + spring + (reduced ? 0 : Math.sin(time * 0.4) * 0.03) + 0.55,
      Math.cos(actualYaw) * Math.cos(pitch) * distance,
    );
    camera.lookAt(lookAt);
  }

  function renderFrame(delta: number, still = false) {
    const time = elapsed;

    if (!still) {
      yaw += (targetYaw - yaw) * 0.08;
      pitch += (targetPitch - pitch) * 0.08;
    }
    layoutCamera(time);

    if (!still) {
      energyDots.forEach((dot, index) => {
        const offset = (time * 0.11 + index / energyDots.length) % 1;
        const point = wireCurve.getPointAt(offset);
        dot.position.copy(point);
        const pulse = 0.45 + Math.abs(Math.sin((time * 1.1 + index) * 1.7)) * 0.55;
        (dot.material as THREE.MeshBasicMaterial).opacity = 0.25 + pulse * 0.5;
      });

      const wanted = desiredPackets();
      packets.forEach((packet, index) => {
        const spec = wanted[index];
        if (!spec) {
          packet.active = false;
          packet.group.visible = false;
          return;
        }
        if (!packet.active) {
          packet.active = true;
          packet.group.visible = true;
          packet.t = index === 0 ? 0.14 : 0.86;
        }
        packet.t += delta * 0.42 * (index === 0 ? 1 : -1);
        if (packet.t > 1) packet.t = 0;
        if (packet.t < 0) packet.t = 1;

        const point = wireCurve.getPointAt(clamp(packet.t, 0, 1));
        packet.group.position.copy(point);
        const fade = Math.sin(packet.t * Math.PI);
        packet.group.scale.setScalar(0.68 + fade * 0.32);
        packet.material.emissive.setHex(spec.tone);
        packet.sprite.material.color.setHex(spec.tone);
        packet.material.emissiveIntensity = 0.5 + fade * 0.5;
        packet.group.quaternion.copy(camera.quaternion);
      });

      const lead = packets.find((packet) => packet.active);
      if (lead) {
        packetLight.position.copy(lead.group.position);
        packetLight.color.setHex(lead.material.emissive.getHex());
        packetLight.intensity = 9;
      } else {
        packetLight.intensity = 0;
      }

      if (certGroup.visible) {
        certGroup.position.y = 1.48 + Math.sin(time * 1.25) * 0.075;
        certGroup.rotation.y = -0.34 + Math.sin(time * 0.85) * 0.14;
        certGroup.rotation.z = Math.sin(time * 0.7) * 0.05;
        certHalo.material.opacity = 0.4 + (Math.sin(time * 2.1) + 1) * 0.13;
      }

      if (keyCenter.visible) {
        keyCenter.rotation.y += delta * 1.3;
        keyCenter.rotation.x += delta * 0.7;
      }
      keyEnds.forEach((holder, index) => {
        holder.rotation.y += delta * (index === 0 ? 1.1 : -1.1);
        holder.position.y = 1.46 + Math.sin(time * 1.5 + index) * 0.06;
      });

      eye.rotation.y = Math.sin(time * 0.6) * 0.25;
      const eyePulse = 1.4 + (Math.sin(time * 3) + 1) * 0.9;
      (eyeIris.material as THREE.MeshStandardMaterial).emissiveIntensity = state.insecure
        ? eyePulse
        : 0.35;
      (eyeRim.material as THREE.MeshStandardMaterial).emissiveIntensity = state.insecure ? 1.6 : 0.3;

      leds.forEach((led, index) => {
        const material = led.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = 1.4 + Math.abs(Math.sin(time * 2.2 + index * 0.9)) * 1.6;
      });

      dust.rotation.y = time * 0.015;
    }

    if (options.onAnchors) {
      camera.updateMatrixWorld();
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const emit = (id: SceneAnchor['id'], object: THREE.Object3D, offsetY: number) => {
        if (!object.visible) {
          anchors.push({ id, x: 0, y: 0, visible: false });
          return;
        }
        anchorVec.copy(object.position).project(camera);
        anchors.push({
          id,
          x: (anchorVec.x * 0.5 + 0.5) * width,
          y: (-anchorVec.y * 0.5 + 0.5) * height + offsetY,
          visible: anchorVec.z < 1,
        });
      };

      anchors.length = 0;
      const firstPacket = packets[0];
      const secondPacket = packets[1];
      if (firstPacket) emit('packet0', firstPacket.group, -16);
      if (secondPacket) emit('packet1', secondPacket.group, -16);
      emit('cert', certGroup, -44);
      emit('eye', eye, 26);
      options.onAnchors(anchors);
    }

    renderer.render(scene, camera);
  }

  let elapsed = 0;
  let lastFrame = performance.now();
  let frameHandle = 0;

  function loop() {
    frameHandle = requestAnimationFrame(loop);
    const now = performance.now();
    const delta = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    elapsed += delta;
    renderFrame(delta);
  }

  /* ---------------- sizing ---------------- */
  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const horizontalSpan = 7.4;
    const verticalSpan = 2.9;
    const vFov = (camera.fov * Math.PI) / 180;
    const forWidth = horizontalSpan / (2 * Math.tan(vFov / 2) * camera.aspect);
    const forHeight = verticalSpan / (2 * Math.tan(vFov / 2));
    distance = clamp(Math.max(forWidth, forHeight) * 1.02, 4.8, 22);
    renderFrame(0, true);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  /* ---------------- pointer ---------------- */
  function onPointerDown(event: PointerEvent) {
    dragging = true;
    moved = 0;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = 'grabbing';
  }

  function onPointerMove(event: PointerEvent) {
    if (!dragging) {
      canvas.style.cursor = pickCert(event.clientX, event.clientY) ? 'pointer' : 'grab';
      return;
    }
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    targetYaw = clamp(targetYaw - dx * 0.0045, -0.62, 0.62);
    targetPitch = clamp(targetPitch + dy * 0.0035, -0.02, 0.36);
  }

  function onPointerUp(event: PointerEvent) {
    if (!dragging) return;
    dragging = false;
    canvas.style.cursor = 'grab';
    if (moved < 8 && pickCert(event.clientX, event.clientY)) {
      options.onCertClick();
    }
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', () => {
    dragging = false;
    canvas.style.cursor = 'grab';
  });

  resize();
  renderFrame(0, true);
  if (!reduced) loop();

  return {
    update,
    dispose() {
      cancelAnimationFrame(frameHandle);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
        else material?.dispose();
      });
      glow.dispose();
      renderer.dispose();
    },
  };
}
