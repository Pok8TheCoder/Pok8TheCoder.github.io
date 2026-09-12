(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  if (isTouch) document.body.classList.add("touch");

  /* clock */
  const clockEl = document.getElementById("clock");
  function tickClock() {
    const now = new Date();
    const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    clockEl.textContent = ist.toTimeString().slice(0, 5);
  }
  tickClock();
  setInterval(tickClock, 10000);

  /* custom cursor */
  const ring = document.querySelector(".cursor");
  const dot = document.querySelector(".cursor-dot");
  let mx = 0, my = 0, rx = 0, ry = 0;
  if (!isTouch) {
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      const hot = e.target.closest("a, button, .catalog li, .domain");
      ring.classList.toggle("is-hot", Boolean(hot));
    });
    function follow() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(follow);
    }
    follow();
  }

  /* scroll progress */
  const bar = document.getElementById("scroll-progress");
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight);
    bar.style.width = `${Math.max(0, Math.min(1, p)) * 100}%`;
  }, { passive: true });

  /* mobile menu */
  const menuBtn = document.querySelector(".menu-btn");
  const drawer = document.querySelector(".drawer");
  menuBtn.addEventListener("click", () => {
    const open = drawer.hasAttribute("hidden") === false;
    if (open) drawer.setAttribute("hidden", "");
    else drawer.removeAttribute("hidden");
    menuBtn.setAttribute("aria-expanded", String(!open));
  });
  drawer.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => drawer.setAttribute("hidden", ""));
  });

  /* rotating line */
  const words = [
    "forecasting packets",
    "fitting OTA on 4MB flash",
    "streaming a desktop avatar",
    "zooming a PTZ onto bench 3",
    "teaching a model to wait",
  ];
  const wordEl = document.getElementById("rotator-word");
  let wi = 0;
  if (!reduce) {
    setInterval(() => {
      wi = (wi + 1) % words.length;
      wordEl.style.opacity = "0";
      setTimeout(() => {
        wordEl.textContent = words[wi];
        wordEl.style.opacity = "1";
      }, 180);
    }, 2600);
  }

  /* telemetry log */
  const lines = [
    "PRISM  window 5s  p(scan)=0.81",
    "OTA    check slot  ready",
    "PIXIE  xtts chunk  412ms",
    "ACAMS  face lock  bench-C",
    "ESP    sleep  idle=deep",
    "RAM    surprise snapshot k=3",
  ];
  const log = document.getElementById("tele-log");
  let li = 0;
  function pushLine() {
    const item = document.createElement("li");
    item.textContent = lines[li % lines.length];
    log.prepend(item);
    while (log.children.length > 5) log.lastChild.remove();
    li++;
  }
  pushLine();
  if (!reduce) setInterval(pushLine, 2200);

  /* count up */
  const counters = document.querySelectorAll("[data-count]");
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      countObs.unobserve(el);
      if (reduce) { el.textContent = String(target); return; }
      const start = performance.now();
      const dur = 1100;
      function step(t) {
        const k = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - k, 3);
        el.textContent = String(Math.round(target * eased));
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  counters.forEach((el) => countObs.observe(el));

  /* jobs accordion */
  document.querySelectorAll(".job-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const job = tab.closest(".job");
      const open = job.classList.contains("is-open");
      document.querySelectorAll(".job").forEach((j) => j.classList.remove("is-open"));
      if (!open) job.classList.add("is-open");
    });
  });

  /* domain board */
  const domains = {
    agents: drawAgents,
    security: drawSecurity,
    firmware: drawFirmware,
    vision: drawVision,
  };
  const svg = document.getElementById("domain-svg");
  function setDomain(name) {
    document.querySelectorAll(".domain").forEach((b) => {
      b.classList.toggle("is-on", b.dataset.domain === name);
    });
    svg.replaceChildren();
    domains[name]();
  }
  document.querySelectorAll(".domain").forEach((btn) => {
    btn.addEventListener("mouseenter", () => setDomain(btn.dataset.domain));
    btn.addEventListener("focus", () => setDomain(btn.dataset.domain));
    btn.addEventListener("click", () => setDomain(btn.dataset.domain));
  });
  setDomain("agents");

  function el(name, attrs) {
    const n = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    svg.appendChild(n);
    return n;
  }
  function drawAgents() {
    el("text", { x: 18, y: 36, fill: "#e24a1c", "font-size": "12", "font-family": "IBM Plex Mono" }).textContent = "agent loop";
    [[40, 80], [160, 70], [280, 90], [160, 180], [70, 210]].forEach(([x, y], i) => {
      el("circle", { cx: x, cy: y, r: 8, fill: i === 2 ? "#e24a1c" : "#efe8dc" });
    });
    [["40,80", "160,70"], ["160,70", "280,90"], ["280,90", "160,180"], ["160,180", "70,210"], ["70,210", "40,80"]].forEach(([a, b]) => {
      el("line", { x1: a.split(",")[0], y1: a.split(",")[1], x2: b.split(",")[0], y2: b.split(",")[1], stroke: "#6f675c", "stroke-width": "1" });
    });
    el("text", { x: 148, y: 250, fill: "#b7ad9e", "font-size": "11", "font-family": "IBM Plex Mono" }).textContent = "perceive → plan → tool";
  }
  function drawSecurity() {
    for (let i = 0; i < 8; i++) {
      el("rect", { x: 30 + i * 34, y: 200 - (40 + i * 12) % 140, width: 18, height: (40 + i * 12) % 140, fill: i > 4 ? "#e24a1c" : "#3f4f32" });
    }
    el("text", { x: 18, y: 36, fill: "#e24a1c", "font-size": "12", "font-family": "IBM Plex Mono" }).textContent = "k-step forecast";
    el("text", { x: 18, y: 250, fill: "#b7ad9e", "font-size": "11", "font-family": "IBM Plex Mono" }).textContent = "F1 85%  ·  FPR 16.7%";
  }
  function drawFirmware() {
    el("rect", { x: 90, y: 70, width: 140, height: 150, rx: 28, fill: "none", stroke: "#efe8dc", "stroke-width": "2" });
    el("circle", { cx: 160, cy: 145, r: 36, fill: "none", stroke: "#e24a1c", "stroke-width": "3", "stroke-dasharray": "40 80" });
    el("text", { x: 18, y: 36, fill: "#e24a1c", "font-size": "12", "font-family": "IBM Plex Mono" }).textContent = "OTA  ·  flash";
    el("text", { x: 118, y: 250, fill: "#b7ad9e", "font-size": "11", "font-family": "IBM Plex Mono" }).textContent = "OTA merged";
  }
  function drawVision() {
    el("rect", { x: 40, y: 60, width: 240, height: 150, fill: "none", stroke: "#6f675c" });
    el("rect", { x: 70, y: 90, width: 70, height: 88, fill: "none", stroke: "#e24a1c" });
    el("rect", { x: 175, y: 110, width: 58, height: 70, fill: "none", stroke: "#ff7a45" });
    el("line", { x1: 160, y1: 40, x2: 160, y2: 60, stroke: "#efe8dc" });
    el("text", { x: 18, y: 36, fill: "#e24a1c", "font-size": "12", "font-family": "IBM Plex Mono" }).textContent = "rail + PTZ";
    el("text", { x: 70, y: 250, fill: "#b7ad9e", "font-size": "11", "font-family": "IBM Plex Mono" }).textContent = "120–200px faces";
  }

  /* project explorer */
  const projects = {
    prism: {
      art: "prism",
      kicker: "security · flagship",
      title: "PRISM",
      body: "Temporal transformer world models that forecast network attacks K-steps ahead. Dual telemetry (NetFlow + Scapy), 85% F1 vs 54% logistic baseline, false positives cut from ~41% to 16.7%. 222 MITRE techniques. Docker attacker/target loop that retrains on evasions.",
      stack: "PyTorch · Scapy · Docker · React · FastAPI",
      links: [["PRISM", "https://github.com/Pok8TheCoder/PRISM"], ["R.A.M", "https://github.com/Pok8TheCoder/R.A.M"], ["Automode", "https://github.com/Pok8TheCoder/Automode"]],
    },
    pixie: {
      art: "pixie",
      kicker: "agents · open source",
      title: "Pixie",
      body: "A desktop overlay that actually talks. PySide6 avatar, Gemini chat, Coqui XTTS streaming at pause boundaries so it doesn't wait for the whole paragraph. Later: Moondream vision, and a Minecraft Fabric 'eyes' mod so the agent can walk the world with Baritone.",
      stack: "Python · PySide6 · Gemini · XTTS · Fabric",
      links: [["GitHub", "https://github.com/Pok8TheCoder/Pixie"]],
    },
    insight: {
      art: "insight",
      kicker: "campus · datathon 2026",
      title: "InsightForge",
      body: "Infinite canvas for a spreadsheet you just met. Next.js + React Flow up front, FastAPI + Polars in the back. Workspace CRUD, canvas commands, dataset profile preview — built for a datathon, not a tutorial.",
      stack: "Next.js · React Flow · FastAPI · Polars",
      links: [["ChatForce", "https://github.com/Pok8TheCoder/ChatForce"]],
    },
    acams: {
      art: "acams",
      kicker: "vision · college",
      title: "ACAMS",
      body: "Attendance for ~60 people is not a webcam on a tripod. Ceiling rail for parallax plus PTZ zoom presets so faces land at 120–200px, not 50. InsightFace + MediaPipe, FastAPI, a Termux dashboard for faculty.",
      stack: "InsightFace · MediaPipe · FastAPI · ONNX",
      links: [["GitHub", "https://github.com/Pok8TheCoder/ACAMS"]],
    },
    aiscanner: {
      art: "aiscanner",
      kicker: "vision · local-first",
      title: "AIScanner",
      body: "Webcam burst, warp the page, DeepSeek-OCR via llama.cpp, rebuild a PDF/DOCX, summarize with Qwen, then RAG over an India statute corpus in FAISS. Stays on the machine. Not legal advice — a triage bench.",
      stack: "OpenCV · llama.cpp · FAISS · Qwen",
      links: [],
    },
    captcha: {
      art: "captcha",
      kicker: "security · biometrics",
      title: "Behavioral CAPTCHA",
      body: "Bots don't fidget like people. 1000Hz+ Win32 recorder, velocity/jerk/curvature, privacy-filtered keystroke timing, Random Forest, FastAPI check. Includes a live bot simulator so you can watch it fail.",
      stack: "Win32 · scikit-learn · FastAPI",
      links: [["GitHub", "https://github.com/Pok8TheCoder/Behavioral-Capcha"]],
    },
    gptfn: {
      art: "gptfn",
      kicker: "agents · 2023-energy",
      title: "gpt_functions_before_it_existed",
      body: "Before native tool calling, GPT-4o wrote a Python executor, dumped it to disk, and ran it in a loop. Later variant added OpenRouter, Bing search, and GPT-4o-mini vision. Ugly on purpose. It worked.",
      stack: "OpenAI · Python · OpenRouter",
      links: [["GitHub", "https://github.com/Pok8TheCoder/gpt_functions_before_it_existed"]],
    },
    labshare: {
      art: "labshare",
      kicker: "campus · capstone",
      title: "Labshare2",
      body: "Dark PySide6 app for lending campus lab gear. User / admin / lender roles. The sem 4 capstone that taught me auth is more annoying than inference.",
      stack: "PySide6 · FastAPI",
      links: [["GitHub", "https://github.com/Pok8TheCoder/Labshare2"]],
    },
    saathi: {
      art: "saathi",
      kicker: "embedded · mozek",
      title: "OTA server",
      body: "The other half of the wearable. Node OTA check/download, WebSocket ACK protocol, telemetry ingest. HTTP fallback for when the radio is being a child.",
      stack: "Node · Express · WebSockets · SQLite",
      links: [],
    },
    glasses: {
      art: "glasses",
      kicker: "embedded · vision",
      title: "Spectacular Spectacles",
      body: "Raspberry Pi Zero 2W, transparent HUD, multimodal vision-to-TTS so a scene becomes speech in your ear. Object recognition while you walk. Power budget still a villain.",
      stack: "Pi Zero 2W · VLM · TTS",
      links: [],
    },
  };

  const art = document.getElementById("stage-art");
  const kicker = document.getElementById("stage-kicker");
  const title = document.getElementById("stage-title");
  const body = document.getElementById("stage-body");
  const stack = document.getElementById("stage-stack");
  const links = document.getElementById("stage-links");

  function showProject(id) {
    const p = projects[id];
    if (!p) return;
    document.querySelectorAll(".catalog li").forEach((liEl) => {
      liEl.classList.toggle("is-on", liEl.dataset.id === id);
    });
    art.dataset.art = p.art;
    kicker.textContent = p.kicker;
    title.textContent = p.title;
    body.textContent = p.body;
    stack.textContent = p.stack;
    links.replaceChildren();
    p.links.forEach(([label, href]) => {
      const a = document.createElement("a");
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = label;
      links.appendChild(a);
    });
  }

  document.querySelectorAll(".catalog li").forEach((item) => {
    const activate = () => showProject(item.dataset.id);
    item.addEventListener("mouseenter", activate);
    item.addEventListener("click", activate);
    item.addEventListener("focus", activate);
    item.setAttribute("tabindex", "0");
  });

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-on"));
      chip.classList.add("is-on");
      const f = chip.dataset.filter;
      const items = [...document.querySelectorAll(".catalog li")];
      items.forEach((item) => {
        const ok = f === "all" || item.dataset.tags.split(" ").includes(f);
        item.classList.toggle("is-hidden", !ok);
      });
      const first = items.find((item) => !item.classList.contains("is-hidden"));
      if (first) showProject(first.dataset.id);
    });
  });

  /* network canvas */
  const canvas = document.getElementById("net");
  const ctx = canvas.getContext("2d");
  const nodes = [];
  const mouse = { x: -9999, y: -9999 };
  let packets = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  window.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    if (e.clientY < r.bottom && e.clientY > r.top) {
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    } else {
      mouse.x = -9999;
      mouse.y = -9999;
    }
  });

  function seed() {
    nodes.length = 0;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const n = Math.max(28, Math.floor((w * h) / 18000));
    for (let i = 0; i < n; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 1,
      });
    }
  }
  seed();
  window.addEventListener("resize", seed);

  function spawnPacket(a, b) {
    packets.push({ a, b, t: 0, speed: 0.008 + Math.random() * 0.01 });
  }

  function frame() {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    ctx.clearRect(0, 0, w, h);
    if (!reduce) {
      nodes.forEach((n) => {
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 18000) {
          n.vx -= dx * 0.00002;
          n.vy -= dy * 0.00002;
        }
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });
    }

    const links = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          const alpha = (1 - d / 130) * 0.22;
          ctx.strokeStyle = `rgba(226, 74, 28, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          links.push([i, j]);
        }
      }
    }

    if (!reduce && packets.length < 12 && links.length && Math.random() < 0.08) {
      const [i, j] = links[(Math.random() * links.length) | 0];
      spawnPacket(nodes[i], nodes[j]);
    }

    packets = packets.filter((p) => p.t < 1);
    packets.forEach((p) => {
      p.t += p.speed;
      const x = p.a.x + (p.b.x - p.a.x) * p.t;
      const y = p.a.y + (p.b.y - p.a.y) * p.t;
      ctx.fillStyle = "#ff7a45";
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });

    nodes.forEach((n) => {
      ctx.fillStyle = "#efe8dc";
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    requestAnimationFrame(frame);
  }
  frame();
})();
