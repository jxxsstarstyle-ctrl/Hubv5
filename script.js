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

const uiState = {
  onlinePlayers: 12480,
  panelTimer: null,
};

function setFeedback(message) {
  if (interactionFeedback) {
    interactionFeedback.textContent = message;
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

      if (playerStatus) {
        playerStatus.textContent = "Fila de entrada simulada";
      }

      if (roomStatus) {
        roomStatus.textContent = "Preparando esquadrão • acesso liberado";
      }

      setFeedback("Sequência de entrada iniciada. O portal do lobby respondeu ao comando Jogar.");
      openPanel(
        "Conexão simulada",
        "O protótipo ativou um fluxo visual de entrada sem backend. Esta área pode evoluir para matchmaking, login e seleção de sala.",
        ""
      );
    });
  }

  if (customizeButton) {
    customizeButton.addEventListener("click", () => {
      setFeedback("Painel de personalização simulado. Futuramente aqui entram skins, emotes e loadout.");
      openPanel(
        "Personalização",
        "Avatar placeholder selecionado. A base do lobby já está pronta para receber editor de personagem, cosméticos e animações extras.",
        "is-customize-open"
      );
    });
  }

  if (settingsButton) {
    settingsButton.addEventListener("click", () => {
      setFeedback("Configurações rápidas abertas. Interface preparada para áudio, gráficos e acessibilidade.");
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
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x040814, 0.06);

  function getSceneSize() {
    const rect = sceneHost.getBoundingClientRect();
    return {
      width: Math.max(rect.width || window.innerWidth || 1, 1),
      height: Math.max(rect.height || window.innerHeight || 1, 1),
    };
  }

  const initialSize = getSceneSize();
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (error) {
    setFeedback("Modo seguro ativo: o navegador não disponibilizou WebGL, mas a interface do lobby continua funcional.");
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.setSize(initialSize.width, initialSize.height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  sceneHost.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(42, initialSize.width / initialSize.height, 0.1, 80);
  const cameraTarget = new THREE.Vector3(0, 1.6, 0);

  const ambientLight = new THREE.AmbientLight(0x7aa2ff, 0.85);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xa8c4ff, 1.5);
  keyLight.position.set(4.5, 7, 3.5);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0x78f6d7, 1.6, 16, 2);
  rimLight.position.set(-4.5, 3.8, -2.2);
  scene.add(rimLight);

  const floorCanvas = document.createElement("canvas");
  floorCanvas.width = 512;
  floorCanvas.height = 512;
  const floorContext = floorCanvas.getContext("2d");

  if (floorContext) {
    floorContext.fillStyle = "#07101f";
    floorContext.fillRect(0, 0, 512, 512);
    floorContext.strokeStyle = "rgba(120, 246, 215, 0.18)";
    floorContext.lineWidth = 2;

    for (let index = 0; index <= 512; index += 32) {
      floorContext.beginPath();
      floorContext.moveTo(index, 0);
      floorContext.lineTo(index, 512);
      floorContext.stroke();
      floorContext.beginPath();
      floorContext.moveTo(0, index);
      floorContext.lineTo(512, index);
      floorContext.stroke();
    }

    floorContext.strokeStyle = "rgba(121, 168, 255, 0.3)";
    floorContext.lineWidth = 4;
    floorContext.strokeRect(64, 64, 384, 384);
  }

  const floorTexture = new THREE.CanvasTexture(floorCanvas);
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(6, 6);

  const floorMaterial = new THREE.MeshStandardMaterial({
    map: floorTexture,
    color: 0x0b1730,
    emissive: 0x0c2f3f,
    emissiveIntensity: 0.5,
    roughness: 0.68,
    metalness: 0.34,
  });

  const floor = new THREE.Mesh(new THREE.CircleGeometry(11, 64), floorMaterial);
  floor.rotation.x = -Math.PI * 0.5;
  floor.position.y = -0.24;
  scene.add(floor);

  const platformMaterial = new THREE.MeshStandardMaterial({
    color: 0x15284e,
    emissive: 0x163971,
    emissiveIntensity: 0.58,
    roughness: 0.42,
    metalness: 0.78,
  });

  const platform = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.2, 0.55, 6), platformMaterial);
  platform.position.y = 0.06;
  scene.add(platform);

  const platformRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.45, 0.08, 16, 64),
    new THREE.MeshBasicMaterial({ color: 0x78f6d7, transparent: true, opacity: 0.75 })
  );
  platformRing.rotation.x = Math.PI * 0.5;
  platformRing.position.y = 0.12;
  scene.add(platformRing);

  const haloRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.1, 0.05, 16, 64),
    new THREE.MeshBasicMaterial({ color: 0x79a8ff, transparent: true, opacity: 0.6 })
  );
  haloRing.rotation.x = Math.PI * 0.5;
  haloRing.position.y = 1.7;
  scene.add(haloRing);

  const avatar = new THREE.Group();
  const avatarBodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xdce8ff,
    emissive: 0x284d8e,
    emissiveIntensity: 0.28,
    roughness: 0.36,
    metalness: 0.2,
  });
  const avatarAccentMaterial = new THREE.MeshStandardMaterial({
    color: 0x78f6d7,
    emissive: 0x78f6d7,
    emissiveIntensity: 0.65,
    roughness: 0.18,
    metalness: 0.52,
  });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.42), avatarBodyMaterial);
  torso.position.y = 1.65;
  avatar.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 24), avatarBodyMaterial);
  head.position.y = 2.45;
  avatar.add(head);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.38), avatarAccentMaterial);
  visor.position.set(0, 2.45, 0.13);
  avatar.add(visor);

  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.82, 0.18), avatarBodyMaterial);
  leftArm.position.set(-0.62, 1.65, 0);
  avatar.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 0.62;
  avatar.add(rightArm);

  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.9, 0.24), avatarBodyMaterial);
  leftLeg.position.set(-0.22, 0.74, 0);
  avatar.add(leftLeg);

  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.22;
  avatar.add(rightLeg);

  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), avatarAccentMaterial);
  core.position.set(0, 1.65, 0.28);
  avatar.add(core);

  scene.add(avatar);

  const pillars = [];
  const pillarGeometry = new THREE.BoxGeometry(0.32, 2.8, 0.32);
  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: 0x18284b,
    emissive: 0x11264d,
    emissiveIntensity: 0.52,
    roughness: 0.5,
    metalness: 0.7,
  });

  for (let index = 0; index < 6; index += 1) {
    const angle = (index / 6) * Math.PI * 2;
    const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillar.position.set(Math.cos(angle) * 5.8, 1.2, Math.sin(angle) * 5.8);
    pillar.scale.y = 0.8 + (index % 2) * 0.25;
    pillar.lookAt(0, 1.2, 0);
    pillars.push(pillar);
    scene.add(pillar);

    const beacon = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.14, 0),
      new THREE.MeshBasicMaterial({ color: index % 2 === 0 ? 0x79a8ff : 0x78f6d7 })
    );
    beacon.position.copy(pillar.position).add(new THREE.Vector3(0, 1.55, 0));
    pillars.push(beacon);
    scene.add(beacon);
  }

  const shards = [];

  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2;
    const shard = new THREE.Mesh(
      new THREE.TetrahedronGeometry(0.22),
      new THREE.MeshStandardMaterial({
        color: 0xbdd5ff,
        emissive: 0x274071,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.58,
      })
    );
    shard.position.set(Math.cos(angle) * 2.1, 1.25 + (index % 2) * 0.2, Math.sin(angle) * 2.1);
    shards.push(shard);
    scene.add(shard);
  }

  const stars = new THREE.BufferGeometry();
  const starCount = 120;
  const starPositions = new Float32Array(starCount * 3);

  for (let index = 0; index < starCount; index += 1) {
    const stride = index * 3;
    starPositions[stride] = (Math.random() - 0.5) * 20;
    starPositions[stride + 1] = 1.8 + Math.random() * 7;
    starPositions[stride + 2] = (Math.random() - 0.5) * 20;
  }

  stars.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));

  const starField = new THREE.Points(
    stars,
    new THREE.PointsMaterial({ color: 0xa6c0ff, size: 0.045, transparent: true, opacity: 0.82 })
  );
  scene.add(starField);

  function setCamera(time) {
    const orbitRadius = 7.9;
    const angle = time * 0.16;
    camera.position.set(Math.sin(angle) * orbitRadius, 3.6 + Math.sin(time * 0.5) * 0.15, Math.cos(angle) * orbitRadius);
    camera.lookAt(cameraTarget);
  }

  setCamera(0);

  function resizeScene() {
    if (!sceneHost) {
      return;
    }

    const size = getSceneSize();
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    renderer.setSize(size.width, size.height);
  }

  window.addEventListener("resize", resizeScene);

  const clock = new THREE.Clock();

  function animate() {
    const elapsed = clock.getElapsedTime();

    avatar.position.y = Math.sin(elapsed * 1.4) * 0.08;
    avatar.rotation.y = Math.sin(elapsed * 0.5) * 0.22;
    core.rotation.x = elapsed * 1.2;
    core.rotation.y = elapsed * 1.8;
    platformRing.rotation.z = elapsed * 0.28;
    haloRing.rotation.z = -elapsed * 0.22;
    haloRing.position.y = 1.72 + Math.sin(elapsed * 1.8) * 0.05;
    rimLight.intensity = 1.45 + Math.sin(elapsed * 2) * 0.18;

    shards.forEach((shard, index) => {
      shard.rotation.x += 0.01;
      shard.rotation.y += 0.014;
      shard.position.y += Math.sin(elapsed * 1.2 + index) * 0.0015;
    });

    pillars.forEach((item, index) => {
      item.rotation.y += index % 2 === 0 ? 0.002 : -0.0015;
    });

    starField.rotation.y = elapsed * 0.015;
    setCamera(elapsed);
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  }

  animate();
  setFeedback("Lobby 3D carregado. Avatar em espera, câmera orbital ativa e interface pronta para expansão.");
}

attachUi();
buildScene();
