const ambientSounds = [
  {
    id: "rain",
    name: "城市細雨",
    description: "柔和白噪音加上稀疏水滴，適合閱讀或工作。",
    volume: 46,
    start: createRain
  },
  {
    id: "ocean",
    name: "低潮海岸",
    description: "緩慢起伏的濾波噪音，像遠方浪潮推進。",
    volume: 42,
    start: createOcean
  },
  {
    id: "night",
    name: "夜間蟲鳴",
    description: "高頻脈衝和安靜底噪，營造戶外夜色。",
    volume: 36,
    start: createNight
  },
  {
    id: "drone",
    name: "科幻環境",
    description: "兩層低頻振盪器形成穩定的空間底色。",
    volume: 38,
    start: createDrone
  }
];

const shortSounds = [
  { id: "tap", name: "UI 點擊", description: "清楚乾淨的按鈕回饋。", play: playTap },
  { id: "coin", name: "收集金幣", description: "明亮上揚的遊戲獎勵聲。", play: playCoin },
  { id: "laser", name: "雷射發射", description: "快速下滑的合成器音效。", play: playLaser },
  { id: "whoosh", name: "轉場刷過", description: "短促噪音掃頻，適合畫面切換。", play: playWhoosh },
  { id: "impact", name: "低頻撞擊", description: "厚實的鼓點和尾音。", play: playImpact },
  { id: "power", name: "能量啟動", description: "逐步升高的未來感提示音。", play: playPowerUp }
];

const audioState = {
  context: null,
  master: null,
  analyser: null,
  activeAmbients: new Map(),
  muted: false,
  masterValue: 0.72
};

const ambientGrid = document.querySelector("#ambientGrid");
const shortGrid = document.querySelector("#shortGrid");
const ambientTemplate = document.querySelector("#ambientTemplate");
const shortTemplate = document.querySelector("#shortTemplate");
const masterVolume = document.querySelector("#masterVolume");
const soundSwitch = document.querySelector("#soundSwitch");
const audioStatus = document.querySelector("#audioStatus");
const activeCount = document.querySelector("#activeCount");
const canvas = document.querySelector("#visualizer");
const canvasContext = canvas.getContext("2d");

renderAmbientCards();
renderShortCards();
drawIdleVisualizer();

masterVolume.addEventListener("input", () => {
  audioState.masterValue = Number(masterVolume.value) / 100;
  syncMasterGain();
});

soundSwitch.addEventListener("change", async () => {
  await ensureAudio();
  audioState.muted = !soundSwitch.checked;
  syncMasterGain();
});

function renderAmbientCards() {
  ambientSounds.forEach((sound) => {
    const node = ambientTemplate.content.cloneNode(true);
    const card = node.querySelector(".sound-card");
    const heading = node.querySelector("h3");
    const description = node.querySelector("p");
    const button = node.querySelector("button");
    const volume = node.querySelector("input");

    card.dataset.sound = sound.id;
    heading.textContent = sound.name;
    description.textContent = sound.description;
    button.textContent = "播放";
    button.setAttribute("aria-label", `播放${sound.name}`);
    volume.value = sound.volume;

    button.addEventListener("click", async () => toggleAmbient(sound, button, volume));
    volume.addEventListener("input", () => {
      const active = audioState.activeAmbients.get(sound.id);
      if (active) {
        active.gain.gain.setTargetAtTime(Number(volume.value) / 100, audioState.context.currentTime, 0.025);
      }
    });

    ambientGrid.appendChild(node);
  });
}

function renderShortCards() {
  shortSounds.forEach((sound) => {
    const node = shortTemplate.content.cloneNode(true);
    const card = node.querySelector(".sound-card");
    const heading = node.querySelector("h3");
    const description = node.querySelector("p");
    const button = node.querySelector("button");

    card.dataset.sound = sound.id;
    heading.textContent = sound.name;
    description.textContent = sound.description;
    button.setAttribute("aria-label", `播放${sound.name}`);
    button.addEventListener("click", async () => {
      await ensureAudio();
      sound.play();
      flashCard(card);
    });

    shortGrid.appendChild(node);
  });
}

async function ensureAudio() {
  if (!audioState.context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioState.context = new AudioContextClass();
    audioState.master = audioState.context.createGain();
    audioState.analyser = audioState.context.createAnalyser();
    audioState.analyser.fftSize = 2048;
    audioState.master.connect(audioState.analyser);
    audioState.analyser.connect(audioState.context.destination);
    syncMasterGain();
    drawLiveVisualizer();
  }

  if (audioState.context.state === "suspended") {
    await audioState.context.resume();
  }

  audioStatus.textContent = "音訊已啟動";
}

function syncMasterGain() {
  if (!audioState.master || !audioState.context) return;
  const value = audioState.muted ? 0 : audioState.masterValue;
  audioState.master.gain.setTargetAtTime(value, audioState.context.currentTime, 0.03);
}

async function toggleAmbient(sound, button, volumeInput) {
  await ensureAudio();

  if (audioState.activeAmbients.has(sound.id)) {
    stopAmbient(sound.id);
    button.textContent = "播放";
    button.classList.remove("is-active");
    button.setAttribute("aria-label", `播放${sound.name}`);
    updateActiveCount();
    return;
  }

  const gain = audioState.context.createGain();
  gain.gain.value = Number(volumeInput.value) / 100;
  gain.connect(audioState.master);

  const nodes = sound.start(gain);
  audioState.activeAmbients.set(sound.id, { gain, nodes });
  button.textContent = "停止";
  button.classList.add("is-active");
  button.setAttribute("aria-label", `停止${sound.name}`);
  updateActiveCount();
}

function stopAmbient(id) {
  const active = audioState.activeAmbients.get(id);
  if (!active) return;

  const now = audioState.context.currentTime;
  active.gain.gain.setTargetAtTime(0, now, 0.035);
  window.setTimeout(() => {
    active.nodes.forEach((node) => {
      try {
        if (typeof node.stop === "function") node.stop();
        if (typeof node.disconnect === "function") node.disconnect();
      } catch (_) {
        // Nodes can already be stopped after fast repeated taps.
      }
    });
    active.gain.disconnect();
  }, 160);
  audioState.activeAmbients.delete(id);
}

function updateActiveCount() {
  const count = audioState.activeAmbients.size;
  activeCount.textContent = `${count} 個背景音播放中`;
}

function createNoiseBuffer(seconds = 2) {
  const context = audioState.context;
  const length = context.sampleRate * seconds;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function createRain(output) {
  const context = audioState.context;
  const noise = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  noise.buffer = createNoiseBuffer(3);
  noise.loop = true;
  filter.type = "highpass";
  filter.frequency.value = 1300;
  gain.gain.value = 0.23;
  noise.connect(filter).connect(gain).connect(output);
  noise.start();

  const drops = [];
  const interval = window.setInterval(() => {
    if (!audioState.context || audioState.context.state === "closed") return;
    const osc = context.createOscillator();
    const dropGain = context.createGain();
    osc.type = "triangle";
    osc.frequency.value = 750 + Math.random() * 1300;
    dropGain.gain.setValueAtTime(0.0001, context.currentTime);
    dropGain.gain.exponentialRampToValueAtTime(0.04, context.currentTime + 0.012);
    dropGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.09);
    osc.connect(dropGain).connect(output);
    osc.start();
    osc.stop(context.currentTime + 0.1);
  }, 140);

  drops.push({ stop: () => window.clearInterval(interval), disconnect: () => {} });
  return [noise, filter, gain, ...drops];
}

function createOcean(output) {
  const context = audioState.context;
  const noise = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const wave = context.createOscillator();
  const waveGain = context.createGain();

  noise.buffer = createNoiseBuffer(4);
  noise.loop = true;
  filter.type = "lowpass";
  filter.frequency.value = 520;
  wave.type = "sine";
  wave.frequency.value = 0.09;
  waveGain.gain.value = 330;
  wave.connect(waveGain).connect(filter.frequency);
  noise.connect(filter).connect(output);
  noise.start();
  wave.start();
  return [noise, filter, wave, waveGain];
}

function createNight(output) {
  const context = audioState.context;
  const bed = context.createBufferSource();
  const bedFilter = context.createBiquadFilter();
  const bedGain = context.createGain();
  const cricket = context.createOscillator();
  const tremolo = context.createOscillator();
  const tremoloGain = context.createGain();

  bed.buffer = createNoiseBuffer(2);
  bed.loop = true;
  bedFilter.type = "bandpass";
  bedFilter.frequency.value = 2800;
  bedGain.gain.value = 0.07;
  cricket.type = "square";
  cricket.frequency.value = 4200;
  tremolo.type = "square";
  tremolo.frequency.value = 8.8;
  tremoloGain.gain.value = 0.035;

  bed.connect(bedFilter).connect(bedGain).connect(output);
  tremolo.connect(tremoloGain.gain);
  cricket.connect(tremoloGain).connect(output);
  bed.start();
  cricket.start();
  tremolo.start();
  return [bed, bedFilter, bedGain, cricket, tremolo, tremoloGain];
}

function createDrone(output) {
  const context = audioState.context;
  const root = context.createOscillator();
  const fifth = context.createOscillator();
  const lfo = context.createOscillator();
  const lfoGain = context.createGain();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  root.type = "sine";
  fifth.type = "triangle";
  root.frequency.value = 86;
  fifth.frequency.value = 129;
  filter.type = "lowpass";
  filter.frequency.value = 720;
  gain.gain.value = 0.28;
  lfo.frequency.value = 0.04;
  lfoGain.gain.value = 220;
  lfo.connect(lfoGain).connect(filter.frequency);
  root.connect(filter);
  fifth.connect(filter);
  filter.connect(gain).connect(output);
  root.start();
  fifth.start();
  lfo.start();
  return [root, fifth, lfo, lfoGain, filter, gain];
}

function playTap() {
  const context = audioState.context;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(720, context.currentTime);
  osc.frequency.exponentialRampToValueAtTime(240, context.currentTime + 0.055);
  gain.gain.setValueAtTime(0.26, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.08);
  osc.connect(gain).connect(audioState.master);
  osc.start();
  osc.stop(context.currentTime + 0.09);
}

function playCoin() {
  const context = audioState.context;
  [880, 1320].forEach((freq, index) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + index * 0.07;
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
    osc.connect(gain).connect(audioState.master);
    osc.start(start);
    osc.stop(start + 0.13);
  });
}

function playLaser() {
  const context = audioState.context;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(1440, context.currentTime);
  osc.frequency.exponentialRampToValueAtTime(90, context.currentTime + 0.28);
  gain.gain.setValueAtTime(0.22, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.3);
  osc.connect(gain).connect(audioState.master);
  osc.start();
  osc.stop(context.currentTime + 0.32);
}

function playWhoosh() {
  const context = audioState.context;
  const noise = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  noise.buffer = createNoiseBuffer(1);
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(260, context.currentTime);
  filter.frequency.exponentialRampToValueAtTime(3600, context.currentTime + 0.42);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.24, context.currentTime + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.48);
  noise.connect(filter).connect(gain).connect(audioState.master);
  noise.start();
  noise.stop(context.currentTime + 0.5);
}

function playImpact() {
  const context = audioState.context;
  const osc = context.createOscillator();
  const gain = context.createGain();
  const noise = context.createBufferSource();
  const noiseGain = context.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(130, context.currentTime);
  osc.frequency.exponentialRampToValueAtTime(38, context.currentTime + 0.24);
  gain.gain.setValueAtTime(0.34, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.42);

  noise.buffer = createNoiseBuffer(0.35);
  noiseGain.gain.setValueAtTime(0.16, context.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.12);

  osc.connect(gain).connect(audioState.master);
  noise.connect(noiseGain).connect(audioState.master);
  osc.start();
  noise.start();
  osc.stop(context.currentTime + 0.45);
  noise.stop(context.currentTime + 0.14);
}

function playPowerUp() {
  const context = audioState.context;
  [260, 390, 520, 780].forEach((freq, index) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + index * 0.075;
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.14, start + 0.016);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.11);
    osc.connect(gain).connect(audioState.master);
    osc.start(start);
    osc.stop(start + 0.12);
  });
}

function flashCard(card) {
  card.animate(
    [
      { borderColor: "rgba(255, 184, 77, 0.95)", transform: "translateY(-2px)" },
      { borderColor: "#343840", transform: "translateY(0)" }
    ],
    { duration: 260, easing: "ease-out" }
  );
}

function drawIdleVisualizer() {
  const width = canvas.width;
  const height = canvas.height;
  canvasContext.clearRect(0, 0, width, height);
  canvasContext.fillStyle = "#121416";
  canvasContext.fillRect(0, 0, width, height);
  canvasContext.strokeStyle = "rgba(72, 214, 194, 0.34)";
  canvasContext.lineWidth = 3;
  canvasContext.beginPath();
  for (let x = 0; x < width; x += 12) {
    const y = height / 2 + Math.sin(x * 0.025) * 24 + Math.sin(x * 0.007) * 18;
    if (x === 0) canvasContext.moveTo(x, y);
    else canvasContext.lineTo(x, y);
  }
  canvasContext.stroke();
}

function drawLiveVisualizer() {
  const analyser = audioState.analyser;
  const data = new Uint8Array(analyser.frequencyBinCount);

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(data);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.fillStyle = "#121416";
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = canvasContext.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "#48d6c2");
    gradient.addColorStop(0.52, "#ffb84d");
    gradient.addColorStop(1, "#ff6b7a");

    canvasContext.lineWidth = 4;
    canvasContext.strokeStyle = gradient;
    canvasContext.beginPath();

    const sliceWidth = canvas.width / data.length;
    let x = 0;
    for (let i = 0; i < data.length; i += 1) {
      const value = data[i] / 128;
      const y = (value * canvas.height) / 2;
      if (i === 0) canvasContext.moveTo(x, y);
      else canvasContext.lineTo(x, y);
      x += sliceWidth;
    }

    canvasContext.stroke();
  }

  draw();
}
