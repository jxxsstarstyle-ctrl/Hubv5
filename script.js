const sceneHost = document.getElementById("scene3d");
const playButton = document.getElementById("playBtn");
const customizeButton = document.getElementById("customizeBtn");
const settingsButton = document.getElementById("settingsBtn");
const playerStatus = document.getElementById("playerStatus");
const onlineCount = document.getElementById("onlineCount");
const roomStatus = document.getElementById("roomStatus");
const interactionFeedback = document.getElementById("interactionFeedback");
const floatingPanel = document.getElementById("floatingPanel");
const panelTitle = document.getElementById("panelTitle");
const panelText = document.getElementById("panelText");
const closePanelButton = document.getElementById("closePanel");
const sceneMode = document.getElementById("sceneMode");

const uiState = {
  onlinePlayers: 12480,
  panelTimer: null,
};

const sceneState = {
  boost: 0,
  focus: 0,
  modeLabel: "Modo contemplativo",
};

function setFeedback(message) {
  if (interactionFeedback) {
    interactionFeedback.textContent = message;
  }
}

function setSceneMode(label) {
  sceneState.modeLabel = label;

  if (sceneMode) {
    sceneMode.textContent = label;
  }
}

function openPanel(title, message, bodyClassName) {
  if (panelTitle) {
    panelTitle.textContent = title;
  }

  if (panelText) {
    panelText.textContent = message;
  }

  if (floatingPanel) {
    floatingPanel.classList.add("is-visible");
  }

  document.body.classList.remove("is-settings-open", "is-customize-open");

  if (bodyClassName) {
    document.body.classList.add(bodyClassName);
  }

  window.clearTimeout(uiState.panelTimer);
  uiState.panelTimer = window.setTimeout(() => {
    closePanel();
  }, 5000);
}

function closePanel() {
  if (floatingPanel) {
    floatingPanel.classList.remove("is-visible");
  }

  document.body.classList.remove("is-settings-open", "is-customize-open");
}

function attachUi() {
  if (playButton) {
    playButton.addEventListener("click", () => {
      document.body.classList.add("is-playing");
      sceneState.boost = 1;
      sceneState.focus = 1;
      setSceneMode("Sequência de entrada");

      if (playerStatus) {
        playerStatus.textContent = "Fila de entrada simulada";
      }

      if (roomStatus) {
        roomStatus.textContent = "Preparando esquadrão • acesso liberado";
      }

      setFeedback("Sequência de entrada iniciada. O palco 3D respondeu com foco no centro do lobby.");
      openPanel(
        "Conexão simulada",
        "O protótipo ativou um fluxo visual de entrada sem backend. A cena realça a plataforma central para sugerir matchmaking e transição de sala.",
        ""
      );
    });
  }

  if (customizeButton) {
    customizeButton.addEventListener("click", () => {
      sceneState.focus = 0.45;
      setSceneMode("Preview de avatar");
      setFeedback("Painel de personalização simulado. O enquadramento do palco favorece o avatar placeholder.");
      openPanel(
        "Personalização",
        "Avatar placeholder selecionado. A base do lobby já está pronta para receber editor de personagem, cosméticos e animações extras.",
        "is-customize-open"
      );
    });
  }

  if (settingsButton) {
    settingsButton.addEventListener("click", () => {
      sceneState.focus = 0.2;
      setSceneMode("Leitura técnica");
      setFeedback("Configurações rápidas abertas. A cena continua visível e central enquanto a interface simula opções técnicas.");
      openPanel(
        "Configurações",
        "Opções simuladas: brilho adaptativo, qualidade do cenário em automático e câmera orbital suave ativada.",
        "is-settings-open"
      );
    });
  }

  if (closePanelButton) {
    closePanelButton.addEventListener("click", closePanel);
  }

  window.setInterval(() => {
    uiState.onlinePlayers += Math.random() > 0.5 ? 3 : -2;
    uiState.onlinePlayers = Math.max(12000, uiState.onlinePlayers);

    if (onlineCount) {
      onlineCount.textContent = uiState.onlinePlayers.toLocaleString("pt-BR");
    }
  }, 2400);
}

function buildScene() {
  if (!sceneHost || !window.THREE) {
    setFeedback("Modo seguro ativo: interface disponível, mas a biblioteca 3D não foi carregada.");
    return;
  }

  const THREE = window.THREE;

  function getSceneSize() {
    const rect = sceneHost.getBoundingClientRect();
    return {
      width: Math.max(rect.width || window.innerWidth || 1, 1),
      height: Math.max(rect.height || window.innerHeight || 1, 1),
    };
  }

  const size = getSceneSize();
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07101a, 0.042);

  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (error) {
    setFeedback("Modo seguro ativo: o navegador não disponibilizou WebGL, mas a interface do lobby continua funcional.");
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.setSize(size.width, size.height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x050b16, 1);
  sceneHost.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(40, size.width / size.height, 0.1, 120);
  const cameraTarget = new THREE.Vector3(0, 1.8, 0);

  const ambientLight = new THREE.AmbientLight(0x89a7ff, 0.95);
  scene.add(ambientLight);

  const keyLight = new THREE.SpotLight(0xb8cbff, 3.2, 40, 0.55, 0.45, 1.2);
  keyLight.position.set(5.6, 8.5, 5.2);
  keyLight.target.position.set(0, 1.35, 0);
  scene.add(keyLight);
  scene.add(keyLight.target);

  const fillLight = new THREE.PointLight(0x7cf0d4, 2.4, 24, 2);
  fillLight.position.set(-4.8, 3.5, -2.8);
  scene.add(fillLight);

  const backLight = new THREE.PointLight(0x5f7cff, 1.8, 20, 2);
  backLight.position.set(0, 4.2, -6.8);
  scene.add(backLight);

  const floorCanvas = document.createElement("canvas");
  floorCanvas.width = 1024;
  floorCanvas.height = 1024;
  const floorContext = floorCanvas.getContext("2d");

  if (floorContext) {
    floorContext.fillStyle = "#060c18";
    floorContext.fillRect(0, 0, 1024, 1024);
    floorContext.strokeStyle = "rgba(120, 246, 215, 0.12)";
    floorContext.lineWidth = 2;

    for (let index = 0; index <= 1024; index += 64) {
      floorContext.beginPath();
      floorContext.moveTo(index, 0);
      floorContext.lineTo(index, 1024);
      floorContext.stroke();
      floorContext.beginPath();
      floorContext.moveTo(0, index);
      floorContext.lineTo(1024, index);
      floorContext.stroke();
    }

    floorContext.strokeStyle = "rgba(121, 168, 255, 0.26)";
    floorContext.lineWidth = 8;
    floorContext.strokeRect(96, 96, 832, 832);

    floorContext.strokeStyle = "rgba(120, 246, 215, 0.3)";
    floorContext.lineWidth = 6;
    floorContext.beginPath();
    floorContext.arc(512, 512, 220, 0, Math.PI * 2);
    floorContext.stroke();
  }

  const floorTexture = new THREE.CanvasTexture(floorCanvas);
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(4, 4);

  const floorMaterial = new THREE.MeshStandardMaterial({
    map: floorTexture,
    color: 0x0a1730,
    emissive: 0x0b3040,
    emissiveIntensity: 0.72,
    roughness: 0.7,
    metalness: 0.42,
  });

  const floor = new THREE.Mesh(new THREE.CircleGeometry(13.5, 72), floorMaterial);
  floor.rotation.x = -Math.PI * 0.5;
  floor.position.y = -0.28;
  scene.add(floor);

  const platformMaterial = new THREE.MeshStandardMaterial({
    color: 0x18335f,
    emissive: 0x234f97,
    emissiveIntensity: 0.62,
    roughness: 0.36,
    metalness: 0.82,
  });

  const platformBase = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 4.2, 0.68, 8), platformMaterial);
  platformBase.position.y = 0.05;
  scene.add(platformBase);

  const platformTop = new THREE.Mesh(
    new THREE.CylinderGeometry(2.7, 3.1, 0.26, 8),
    new THREE.MeshStandardMaterial({
      color: 0x244b86,
      emissive: 0x3c73d0,
      emissiveIntensity: 0.44,
      roughness: 0.26,
      metalness: 0.7,
    })
  );
  platformTop.position.y = 0.4;
  scene.add(platformTop);

  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(4.45, 0.09, 18, 96),
    new THREE.MeshBasicMaterial({ color: 0x78f6d7, transparent: true, opacity: 0.92 })
  );
  outerRing.rotation.x = Math.PI * 0.5;
  outerRing.position.y = 0.16;
  scene.add(outerRing);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.55, 0.08, 18, 96),
    new THREE.MeshBasicMaterial({ color: 0x79a8ff, transparent: true, opacity: 0.88 })
  );
  innerRing.rotation.x = Math.PI * 0.5;
  innerRing.position.y = 0.5;
  scene.add(innerRing);

  const avatar = new THREE.Group();
  const avatarBodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xe6efff,
    emissive: 0x35579f,
    emissiveIntensity: 0.34,
    roughness: 0.34,
    metalness: 0.24,
  });
  const avatarAccentMaterial = new THREE.MeshStandardMaterial({
    color: 0x7cf0d4,
    emissive: 0x7cf0d4,
    emissiveIntensity: 0.82,
    roughness: 0.16,
    metalness: 0.48,
  });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.94, 1.16, 0.46), avatarBodyMaterial);
  torso.position.y = 1.8;
  avatar.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 28, 28), avatarBodyMaterial);
  head.position.y = 2.62;
  avatar.add(head);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 0.38), avatarAccentMaterial);
  visor.position.set(0, 2.58, 0.16);
  avatar.add(visor);

  const chestCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), avatarAccentMaterial);
  chestCore.position.set(0, 1.82, 0.29);
  avatar.add(chestCore);

  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.86, 0.18), avatarBodyMaterial);
  leftArm.position.set(-0.66, 1.82, 0);
  avatar.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 0.66;
  avatar.add(rightArm);

  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.96, 0.25), avatarBodyMaterial);
  leftLeg.position.set(-0.24, 0.86, 0);
  avatar.add(leftLeg);

  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.24;
  avatar.add(rightLeg);

  scene.add(avatar);

  const orbitNodes = [];
  const ringGeometry = new THREE.TorusGeometry(5.8, 0.06, 12, 80, Math.PI);

  for (let index = 0; index < 2; index += 1) {
    const arc = new THREE.Mesh(
      ringGeometry,
      new THREE.MeshBasicMaterial({
        color: index === 0 ? 0x7cf0d4 : 0x79a8ff,
        transparent: true,
        opacity: 0.38,
      })
    );
    arc.rotation.z = index === 0 ? 0.45 : -0.62;
    arc.rotation.x = Math.PI * 0.3;
    arc.position.y = 3.05;
    scene.add(arc);
    orbitNodes.push(arc);
  }

  const structureMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a2f58,
    emissive: 0x15305c,
    emissiveIntensity: 0.44,
    roughness: 0.42,
    metalness: 0.72,
  });

  const pillars = [];

  for (let index = 0; index < 6; index += 1) {
    const angle = (index / 6) * Math.PI * 2;
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.45, 3.6, 0.45), structureMaterial);
    pillar.position.set(Math.cos(angle) * 7.1, 1.7, Math.sin(angle) * 7.1);
    scene.add(pillar);
    pillars.push(pillar);

    const beacon = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.22, 0),
      new THREE.MeshBasicMaterial({ color: index % 2 === 0 ? 0x79a8ff : 0x7cf0d4, transparent: true, opacity: 0.95 })
    );
    beacon.position.copy(pillar.position).add(new THREE.Vector3(0, 2.25, 0));
    scene.add(beacon);
    pillars.push(beacon);
  }

  const sidePanels = [];

  for (let index = 0; index < 4; index += 1) {
    const z = index < 2 ? -4.8 : 4.8;
    const x = index % 2 === 0 ? -3.8 : 3.8;
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 2.4, 0.16),
      new THREE.MeshStandardMaterial({
        color: 0x101c34,
        emissive: 0x1d3d74,
        emissiveIntensity: 0.65,
        roughness: 0.3,
        metalness: 0.64,
      })
    );
    panel.position.set(x, 1.8, z);
    panel.rotation.y = x < 0 ? 0.42 : -0.42;
    scene.add(panel);
    sidePanels.push(panel);
  }

  const shards = [];

  for (let index = 0; index < 10; index += 1) {
    const angle = (index / 10) * Math.PI * 2;
    const shard = new THREE.Mesh(
      new THREE.TetrahedronGeometry(0.28),
      new THREE.MeshStandardMaterial({
        color: 0xc9dbff,
        emissive: 0x35558d,
        emissiveIntensity: 0.46,
        roughness: 0.24,
        metalness: 0.62,
      })
    );
    shard.position.set(Math.cos(angle) * 3.2, 1.4 + (index % 2) * 0.32, Math.sin(angle) * 3.2);
    scene.add(shard);
    shards.push(shard);
  }

  const starGeometry = new THREE.BufferGeometry();
  const starCount = 140;
  const starPositions = new Float32Array(starCount * 3);

  for (let index = 0; index < starCount; index += 1) {
    const stride = index * 3;
    starPositions[stride] = (Math.random() - 0.5) * 24;
    starPositions[stride + 1] = 1.6 + Math.random() * 8;
    starPositions[stride + 2] = (Math.random() - 0.5) * 24;
  }

  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));

  const starField = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({ color: 0xb6ccff, size: 0.05, transparent: true, opacity: 0.9 })
  );
  scene.add(starField);

  function updateCamera(elapsed) {
    const focusMix = THREE.MathUtils.lerp(0.22, 1, sceneState.focus);
    const orbitRadius = THREE.MathUtils.lerp(9.4, 7.3, focusMix);
    const angle = elapsed * (0.18 + sceneState.focus * 0.04);
    const y = THREE.MathUtils.lerp(4.1, 3.2, focusMix) + Math.sin(elapsed * 0.6) * 0.12;
    camera.position.set(Math.sin(angle) * orbitRadius, y, Math.cos(angle) * orbitRadius + 0.85);
    camera.lookAt(cameraTarget);
  }

  function resizeScene() {
    const nextSize = getSceneSize();
    camera.aspect = nextSize.width / nextSize.height;
    camera.updateProjectionMatrix();
    renderer.setSize(nextSize.width, nextSize.height);
  }

  window.addEventListener("resize", resizeScene);

  const clock = new THREE.Clock();

  function animate() {
    const elapsed = clock.getElapsedTime();
    sceneState.boost = THREE.MathUtils.lerp(sceneState.boost, 0, 0.015);
    sceneState.focus = THREE.MathUtils.lerp(sceneState.focus, 0, 0.012);

    avatar.position.y = Math.sin(elapsed * 1.4) * 0.09 + 0.02;
    avatar.rotation.y = Math.sin(elapsed * 0.52) * 0.24 + sceneState.boost * 0.16;
    chestCore.rotation.x = elapsed * 1.5;
    chestCore.rotation.y = elapsed * 2.1;

    outerRing.rotation.z = elapsed * 0.22;
    innerRing.rotation.z = -elapsed * 0.34;
    outerRing.material.opacity = 0.84 + sceneState.boost * 0.12 + Math.sin(elapsed * 2.2) * 0.04;
    innerRing.material.opacity = 0.78 + sceneState.boost * 0.16;

    keyLight.intensity = 3.2 + sceneState.boost * 0.65;
    fillLight.intensity = 2.2 + Math.sin(elapsed * 1.8) * 0.18 + sceneState.boost * 0.4;
    backLight.intensity = 1.6 + Math.sin(elapsed * 1.1) * 0.14;

    orbitNodes.forEach((node, index) => {
      node.rotation.y += index === 0 ? 0.0024 : -0.0021;
      node.position.y = 3 + Math.sin(elapsed * 0.9 + index) * 0.05;
    });

    shards.forEach((shard, index) => {
      shard.rotation.x += 0.012;
      shard.rotation.y += 0.016;
      shard.position.y += Math.sin(elapsed * 1.2 + index) * 0.0018;
    });

    pillars.forEach((item, index) => {
      item.rotation.y += index % 2 === 0 ? 0.0018 : -0.0014;
    });

    sidePanels.forEach((panel, index) => {
      panel.position.y = 1.8 + Math.sin(elapsed * 0.8 + index) * 0.08;
    });

    starField.rotation.y = elapsed * 0.01;
    updateCamera(elapsed);
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  }

  updateCamera(0);
  animate();
  setSceneMode("Modo contemplativo");
  setFeedback("Lobby 3D carregado. Plataforma central, avatar e ambientação visíveis no palco principal.");
}

attachUi();
buildScene();
