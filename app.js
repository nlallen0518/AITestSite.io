/* ═══════════════════════════════════════════════════
   URBAN COFFEE HOUSE — IMMERSIVE GSAP ENGINE
   Bean-to-cup scroll journey with per-section ambience
   ═══════════════════════════════════════════════════ */

(() => {
    "use strict";

    gsap.registerPlugin(ScrollTrigger);

    /* ── Lenis smooth scroll ── */
    const lenis = new Lenis({
        duration: 1.4,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    /* ── Helpers ── */
    const $ = (s, p = document) => p.querySelector(s);
    const $$ = (s, p = document) => [...p.querySelectorAll(s)];

    /* ── DOM refs ── */
    const body = document.body;
    const loader = $("#loader");
    const loaderFill = $("#loaderFill");
    const bgCanvas = $("#bgCanvas");
    const bgCtx = bgCanvas.getContext("2d");
    const ambientCanvas = $("#ambientCanvas");
    const ambientCtx = ambientCanvas.getContext("2d");
    const ptCanvas = $("#particleCanvas");
    const ptCtx = ptCanvas.getContext("2d");
    const journeyFill = $("#journeyFill");
    const pips = $$(".stage-pip");
    const stages = $$(".stage");
    const stageFlash = $("#stageFlash");
    const stageFlashText = $("#stageFlashText");
    const lbTop = $(".letterbox-top");
    const lbBot = $(".letterbox-bot");
    const originCanvas = $("#originCanvas");
    const originCtx = originCanvas ? originCanvas.getContext("2d") : null;
    const stageNames = ["Origin", "Roast", "Grind", "Extract", "Pour", "Atmosphere", "The Table"];

    /* ── Global state ── */
    let W, H;
    let currentStage = 0;
    let stageProgress = 0;   // 0-1 within current stage
    let mountainLayers = [];
    let stars = [];
    let mountainParallax = 0;
    let starsOpacity = 1;
    let starTime = 0;
    let particles = [];

    /* ── Resize ── */
    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        bgCanvas.width = ambientCanvas.width = ptCanvas.width = W;
        bgCanvas.height = ambientCanvas.height = ptCanvas.height = H;
        if (originCanvas) {
            originCanvas.width = W;
            originCanvas.height = H;
        }
        buildMountains();
        buildStars();
    }
    window.addEventListener("resize", resize);
    resize();

    /* ═══════════════════════════════════════════════════
       BACKGROUND GRADIENT CANVAS
       Smooth radial gradient that shifts color per stage
       ═══════════════════════════════════════════════════ */

    const palettes = [
        { r: 8, g: 12, b: 24 },     // S0 Origin: deep midnight blue
        { r: 48, g: 18, b: 8 },     // S1 Roast: warm ember
        { r: 14, g: 18, b: 32 },    // S2 Grind: cool steel
        { r: 36, g: 20, b: 10 },    // S3 Extract: espresso warmth
        { r: 20, g: 16, b: 28 },    // S4 Pour: twilight
        { r: 12, g: 22, b: 16 },    // S5 Atmosphere: forest
        { r: 10, g: 8, b: 14 },     // S6 Table: midnight
    ];

    let bg = { ...palettes[0] };

    function renderBg() {
        const { r, g, b } = bg;
        const grad = bgCtx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.75);
        grad.addColorStop(0, `rgb(${Math.round(r + 14)},${Math.round(g + 12)},${Math.round(b + 18)})`);
        grad.addColorStop(1, `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`);
        bgCtx.fillStyle = grad;
        bgCtx.fillRect(0, 0, W, H);
    }

    /* ═══════════════════════════════════════════════════
       AMBIENT CANVAS — UNIQUE EFFECT PER SECTION
       Each stage gets its own gentle, organic visual:
       S0: Shooting stars / aurora wisps
       S1: Rising heat shimmer waves
       S2: Rotating coffee ground constellation
       S3: Falling espresso droplets
       S4: Expanding milk ripples
       S5: Floating light bokeh
       S6: Gentle candle flicker glow
       ═══════════════════════════════════════════════════ */

    let ambientTime = 0;

    function renderAmbient() {
        ambientCtx.clearRect(0, 0, W, H);
        ambientTime += 0.008;

        switch (currentStage) {
            case 0: renderAurora(); break;
            case 1: renderHeatShimmer(); break;
            case 2: renderGroundConstellation(); break;
            case 3: renderEspressoDroplets(); break;
            case 4: renderMilkRipples(); break;
            case 5: renderLightBokeh(); break;
            case 6: renderCandleGlow(); break;
        }
    }

    /* S0: Gentle aurora wisps — flowing colored bands */
    function renderAurora() {
        const cx = W / 2;
        for (let i = 0; i < 4; i++) {
            const yBase = H * 0.25 + i * H * 0.08;
            ambientCtx.beginPath();
            ambientCtx.moveTo(0, yBase);
            for (let x = 0; x <= W; x += 8) {
                const y = yBase +
                    Math.sin(x * 0.003 + ambientTime * 0.8 + i * 1.5) * 30 +
                    Math.sin(x * 0.007 + ambientTime * 0.5 + i) * 15;
                ambientCtx.lineTo(x, y);
            }
            const hue = 160 + i * 40 + Math.sin(ambientTime + i) * 20;
            ambientCtx.strokeStyle = `hsla(${hue}, 50%, 60%, 0.04)`;
            ambientCtx.lineWidth = 30 + i * 10;
            ambientCtx.stroke();
        }
    }

    /* S1: Rising heat shimmer — wavy horizontal distortion lines */
    function renderHeatShimmer() {
        const count = 12;
        for (let i = 0; i < count; i++) {
            const yBase = H * (0.15 + (i / count) * 0.7);
            const intensity = 0.6 + 0.4 * Math.sin(ambientTime + i * 0.7);
            ambientCtx.beginPath();
            for (let x = 0; x <= W; x += 6) {
                const wave = Math.sin(x * 0.008 + ambientTime * 2.5 + i * 0.9) * (15 + i * 3) * intensity;
                const y = yBase + wave;
                x === 0 ? ambientCtx.moveTo(x, y) : ambientCtx.lineTo(x, y);
            }
            const warmth = Math.floor(40 + i * 8);
            ambientCtx.strokeStyle = `rgba(212,${120 + warmth},${30 + i * 5},${(0.025 * intensity).toFixed(3)})`;
            ambientCtx.lineWidth = 1.5;
            ambientCtx.stroke();
        }
    }

    /* S2: Rotating constellation of coffee ground dots */
    function renderGroundConstellation() {
        const cx = W / 2;
        const cy = H / 2;
        const count = 60;
        const maxR = Math.min(W, H) * 0.35;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + ambientTime * 0.3 * (i % 2 === 0 ? 1 : -0.6);
            const r = (i / count) * maxR + Math.sin(ambientTime + i * 0.5) * 15;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            const size = 1.5 + Math.sin(ambientTime * 2 + i) * 0.8;
            const alpha = 0.08 + 0.05 * Math.sin(ambientTime + i * 0.3);

            ambientCtx.beginPath();
            ambientCtx.arc(x, y, Math.max(0.5, size), 0, Math.PI * 2);
            ambientCtx.fillStyle = `rgba(180,140,100,${alpha.toFixed(3)})`;
            ambientCtx.fill();

            // Connect nearby dots with faint lines
            if (i > 0 && i % 3 === 0) {
                const prevAngle = ((i - 3) / count) * Math.PI * 2 + ambientTime * 0.3 * ((i - 3) % 2 === 0 ? 1 : -0.6);
                const prevR = ((i - 3) / count) * maxR + Math.sin(ambientTime + (i - 3) * 0.5) * 15;
                const px = cx + Math.cos(prevAngle) * prevR;
                const py = cy + Math.sin(prevAngle) * prevR;
                ambientCtx.beginPath();
                ambientCtx.moveTo(px, py);
                ambientCtx.lineTo(x, y);
                ambientCtx.strokeStyle = `rgba(160,120,80,0.03)`;
                ambientCtx.lineWidth = 0.8;
                ambientCtx.stroke();
            }
        }
    }

    /* S3: Falling espresso droplets — thin vertical trails */
    function renderEspressoDroplets() {
        const count = 20;
        for (let i = 0; i < count; i++) {
            const x = (W / (count + 1)) * (i + 1) + Math.sin(ambientTime * 0.5 + i * 2) * 30;
            const speed = 0.4 + (i % 5) * 0.15;
            const yOff = ((ambientTime * speed * 100 + i * 200) % (H + 100)) - 50;
            const length = 30 + Math.sin(i * 1.7) * 20;
            const alpha = 0.04 + 0.02 * Math.sin(ambientTime + i);

            const grad = ambientCtx.createLinearGradient(x, yOff, x, yOff + length);
            grad.addColorStop(0, `rgba(90,55,25,0)`);
            grad.addColorStop(0.4, `rgba(90,55,25,${alpha.toFixed(3)})`);
            grad.addColorStop(1, `rgba(90,55,25,0)`);

            ambientCtx.beginPath();
            ambientCtx.moveTo(x, yOff);
            ambientCtx.lineTo(x, yOff + length);
            ambientCtx.strokeStyle = grad;
            ambientCtx.lineWidth = 1.5;
            ambientCtx.stroke();
        }
    }

    /* S4: Expanding milk ripples — concentric soft circles */
    function renderMilkRipples() {
        const cx = W / 2;
        const cy = H / 2;
        const rippleCount = 5;

        for (let i = 0; i < rippleCount; i++) {
            const phase = ((ambientTime * 0.3 + i * 0.2) % 1);
            const maxR = Math.min(W, H) * 0.5;
            const radius = phase * maxR;
            const alpha = (1 - phase) * 0.06;

            if (alpha < 0.003) continue;

            ambientCtx.beginPath();
            ambientCtx.arc(cx, cy, Math.max(1, radius), 0, Math.PI * 2);
            ambientCtx.strokeStyle = `rgba(255,248,235,${alpha.toFixed(3)})`;
            ambientCtx.lineWidth = 2 * (1 - phase);
            ambientCtx.stroke();
        }
    }

    /* S5: Floating light bokeh — soft glowing circles */
    function renderLightBokeh() {
        const count = 15;
        for (let i = 0; i < count; i++) {
            const x = W * (0.1 + (i / count) * 0.8) + Math.sin(ambientTime * 0.4 + i * 1.3) * 60;
            const y = H * (0.15 + (i / count) * 0.7) + Math.cos(ambientTime * 0.3 + i * 0.9) * 40;
            const size = 15 + Math.sin(ambientTime + i * 0.7) * 10;
            const alpha = 0.015 + 0.01 * Math.sin(ambientTime * 0.6 + i * 0.5);

            const grad = ambientCtx.createRadialGradient(x, y, 0, x, y, size);
            grad.addColorStop(0, `rgba(212,185,140,${(alpha * 2).toFixed(3)})`);
            grad.addColorStop(1, `rgba(212,185,140,0)`);

            ambientCtx.beginPath();
            ambientCtx.arc(x, y, size, 0, Math.PI * 2);
            ambientCtx.fillStyle = grad;
            ambientCtx.fill();
        }
    }

    /* S6: Gentle candle glow — warm pulsing center light */
    function renderCandleGlow() {
        const cx = W / 2;
        const cy = H * 0.4;
        const flicker = 0.8 + 0.2 * Math.sin(ambientTime * 4) * Math.sin(ambientTime * 7.3);
        const size = (80 + Math.sin(ambientTime * 3) * 15) * flicker;

        const grad = ambientCtx.createRadialGradient(cx, cy, 0, cx, cy, size);
        grad.addColorStop(0, `rgba(240,190,110,0.06)`);
        grad.addColorStop(0.5, `rgba(212,165,90,0.025)`);
        grad.addColorStop(1, `rgba(180,120,50,0)`);

        ambientCtx.beginPath();
        ambientCtx.arc(cx, cy, size, 0, Math.PI * 2);
        ambientCtx.fillStyle = grad;
        ambientCtx.fill();

        // Secondary flicker
        const size2 = (40 + Math.sin(ambientTime * 5.5 + 1) * 8) * flicker;
        const grad2 = ambientCtx.createRadialGradient(cx, cy, 0, cx, cy, size2);
        grad2.addColorStop(0, `rgba(255,220,160,0.04)`);
        grad2.addColorStop(1, `rgba(255,220,160,0)`);

        ambientCtx.beginPath();
        ambientCtx.arc(cx, cy, size2, 0, Math.PI * 2);
        ambientCtx.fillStyle = grad2;
        ambientCtx.fill();
    }

    /* ═══════════════════════════════════════════════════
       ORIGIN CANVAS — PROCEDURAL MOUNTAINS + STARS
       ═══════════════════════════════════════════════════ */

    function buildMountains() {
        mountainLayers = [];
        if (!originCtx) return;
        const count = 5;
        for (let i = 0; i < count; i++) {
            const pts = [];
            const segW = 24 + i * 8;
            const baseY = H * (0.42 + i * 0.12);
            const amp = 70 + (count - i) * 28;
            for (let x = 0; x <= W + segW; x += segW) {
                pts.push({ x, y: baseY + (Math.random() - 0.5) * amp });
            }
            const l = 3 + i * 3;
            mountainLayers.push({
                pts,
                color: `hsl(225, 20%, ${l}%)`,
                pFactor: 0.1 + i * 0.07
            });
        }
    }

    function buildStars() {
        stars = [];
        if (!originCtx) return;
        const n = Math.floor((W * H) / 3200);
        for (let i = 0; i < n; i++) {
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H * 0.5,
                r: Math.random() * 1.3 + 0.3,
                phase: Math.random() * Math.PI * 2,
                speed: 0.3 + Math.random() * 0.6,
            });
        }
    }

    function renderOrigin() {
        if (!originCtx) return;
        originCtx.clearRect(0, 0, W, H);

        // Stars
        starTime += 0.012;
        if (starsOpacity > 0.01) {
            stars.forEach(s => {
                const a = (0.3 + 0.7 * Math.sin(starTime * s.speed + s.phase)) * starsOpacity;
                if (a < 0.01) return;
                originCtx.beginPath();
                originCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                originCtx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
                originCtx.fill();
            });
        }

        // Mountains with parallax
        mountainLayers.forEach(layer => {
            const off = mountainParallax * layer.pFactor;
            originCtx.save();
            originCtx.translate(-off, 0);
            originCtx.beginPath();
            originCtx.moveTo(layer.pts[0].x, layer.pts[0].y);
            for (let j = 1; j < layer.pts.length; j++) {
                const prev = layer.pts[j - 1];
                const curr = layer.pts[j];
                const mx = (prev.x + curr.x) / 2;
                const my = (prev.y + curr.y) / 2;
                originCtx.quadraticCurveTo(prev.x, prev.y, mx, my);
            }
            originCtx.lineTo(W + 200, H + 10);
            originCtx.lineTo(-200, H + 10);
            originCtx.closePath();
            originCtx.fillStyle = layer.color;
            originCtx.fill();
            originCtx.restore();
        });
    }

    /* ═══════════════════════════════════════════════════
       PARTICLE SYSTEM
       Contextual particles per stage: fireflies, embers,
       coffee grounds, steam, milk swirls
       ═══════════════════════════════════════════════════ */

    function spawnParticle(opts) {
        particles.push({
            x: opts.x ?? W * Math.random(),
            y: opts.y ?? H,
            vx: opts.vx ?? (Math.random() - 0.5) * 0.5,
            vy: opts.vy ?? -0.5 - Math.random() * 1,
            life: 1,
            decay: opts.decay ?? 0.005 + Math.random() * 0.008,
            size: opts.size ?? 1.5 + Math.random() * 2,
            color: opts.color ?? "212,165,90",
            gravity: opts.gravity ?? -0.003,
        });
    }

    function spawnBurst(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            spawnParticle({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                decay: 0.008 + Math.random() * 0.015,
                size: 1 + Math.random() * 2.5,
                color: color || (Math.random() > 0.5 ? "212,165,90" : "180,140,100"),
                gravity: 0,
            });
        }
    }

    function spawnSteam(x, y) {
        for (let i = 0; i < 2; i++) {
            spawnParticle({
                x: x + (Math.random() - 0.5) * 24,
                y,
                vx: (Math.random() - 0.5) * 0.3,
                vy: -0.4 - Math.random() * 0.6,
                decay: 0.004 + Math.random() * 0.006,
                size: 1.5 + Math.random() * 2,
                color: "255,255,255",
                gravity: -0.002,
            });
        }
    }

    function spawnAmbient() {
        if (particles.length > 200) return;
        switch (currentStage) {
            case 0: // Fireflies in the mountains
                if (Math.random() > 0.93) {
                    spawnParticle({
                        x: Math.random() * W,
                        y: H * 0.4 + Math.random() * H * 0.5,
                        vx: (Math.random() - 0.5) * 0.3,
                        vy: -0.1 - Math.random() * 0.15,
                        decay: 0.002 + Math.random() * 0.003,
                        size: 1 + Math.random(),
                        color: "180,220,120",
                    });
                }
                break;
            case 1: // Rising embers
                if (Math.random() > 0.85) {
                    spawnParticle({
                        x: W / 2 + (Math.random() - 0.5) * W * 0.4,
                        y: H,
                        vx: (Math.random() - 0.5) * 0.8,
                        vy: -1 - Math.random() * 2,
                        decay: 0.005 + Math.random() * 0.005,
                        size: 1 + Math.random() * 1.5,
                        color: Math.random() > 0.3 ? "255,140,40" : "255,80,20",
                    });
                }
                break;
            case 2: // Coffee ground dust
                if (Math.random() > 0.92) {
                    spawnParticle({
                        x: W / 2 + (Math.random() - 0.5) * W * 0.3,
                        y: H / 2 + (Math.random() - 0.5) * H * 0.3,
                        vx: (Math.random() - 0.5) * 1.5,
                        vy: (Math.random() - 0.5) * 1.5,
                        decay: 0.006 + Math.random() * 0.008,
                        size: 0.8 + Math.random() * 1.2,
                        color: "140,100,60",
                        gravity: 0.005,
                    });
                }
                break;
            case 3: // Espresso steam
            case 4: // Steam
                if (Math.random() > 0.9) {
                    spawnSteam(W / 2, H * 0.38);
                }
                break;
            case 5: // Gentle warm motes
                if (Math.random() > 0.96) {
                    spawnParticle({
                        x: Math.random() * W,
                        y: Math.random() * H,
                        vx: (Math.random() - 0.5) * 0.2,
                        vy: -0.05 - Math.random() * 0.1,
                        decay: 0.002,
                        size: 0.8 + Math.random(),
                        color: "212,185,140",
                    });
                }
                break;
        }
    }

    function updateParticles() {
        ptCtx.clearRect(0, 0, W, H);
        particles = particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.life -= p.decay;
            if (p.life <= 0) return false;
            ptCtx.beginPath();
            ptCtx.arc(p.x, p.y, p.size * Math.max(0.3, p.life), 0, Math.PI * 2);
            ptCtx.fillStyle = `rgba(${p.color},${(p.life * 0.8).toFixed(2)})`;
            ptCtx.fill();
            return true;
        });
    }

    /* ═══════════════════════════════════════════════════
       CUSTOM CURSOR
       ═══════════════════════════════════════════════════ */

    const dot = $(".cursor-dot");
    const aura = $(".cursor-aura");
    if (dot && aura) {
        let mx = W / 2, my = H / 2, ax = mx, ay = my;
        window.addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; });
        const interactive = "a, button, input, .menu-card, .glass-card, .btn-reserve, .stage-pip";
        document.addEventListener("mouseover", e => {
            if (e.target.closest(interactive)) aura.classList.add("hover");
        });
        document.addEventListener("mouseout", e => {
            if (e.target.closest(interactive)) aura.classList.remove("hover");
        });
        gsap.ticker.add(() => {
            ax += (mx - ax) * 0.14;
            ay += (my - ay) * 0.14;
            dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
            aura.style.transform = `translate(${ax}px, ${ay}px) translate(-50%, -50%)`;
        });
    }

    /* ═══════════════════════════════════════════════════
       MENU DATA + RENDER
       ═══════════════════════════════════════════════════ */

    const drinks = [
        { name: "Midnight Espresso", price: "$4.50", desc: "Double ristretto. Dark cherry, raw cacao. No milk needed.", img: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?q=80&w=500&auto=format&fit=crop" },
        { name: "Velvet Latte", price: "$5.80", desc: "House espresso, oat milk micro-foam, vanilla bean.", img: "https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=500&auto=format&fit=crop" },
        { name: "Kyoto Cold Brew", price: "$6.30", desc: "12-hour immersion. Ethiopian Yirgacheffe. Black as midnight.", img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=500&auto=format&fit=crop" },
        { name: "Pour Over Flight", price: "$8.90", desc: "Three origins. Three methods. One journey.", img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=500&auto=format&fit=crop" },
    ];

    const food = [
        { name: "Truffle Mushroom Toast", price: "$11.50", desc: "Sourdough, wild mushrooms, truffle oil, micro greens.", img: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=500&auto=format&fit=crop" },
        { name: "Maple Chilli Croissant", price: "$7.20", desc: "Laminated butter, smoked maple glaze, Aleppo pepper.", img: "https://images.unsplash.com/photo-1555507036-ab1f4038024a?q=80&w=500&auto=format&fit=crop" },
        { name: "Citrus Ricotta Pancakes", price: "$10.80", desc: "Fluffy, lemon zest, blueberry compote, powdered sugar.", img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=500&auto=format&fit=crop" },
        { name: "Dark Chocolate Tart", price: "$8.50", desc: "70% cacao, sea salt, espresso caramel, hazelnut praline.", img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=500&auto=format&fit=crop" },
    ];

    function cardHTML(item) {
        return `<article class="menu-card gs-up"><img src="${item.img}" alt="${item.name}" loading="lazy"><div class="menu-card-body"><div class="menu-card-head"><h3>${item.name}</h3><strong>${item.price}</strong></div><p>${item.desc}</p></div></article>`;
    }

    function renderMenu() {
        const dg = $("#menuDrinks");
        const fg = $("#menuFood");
        if (dg) dg.innerHTML = drinks.map(cardHTML).join("");
        if (fg) fg.innerHTML = food.map(cardHTML).join("");
    }
    renderMenu();

    /* ═══════════════════════════════════════════════════
       GSAP SCROLL TRIGGERS
       ═══════════════════════════════════════════════════ */

    /* ── Global journey progress + active pip ── */

    function updatePips() {
        const scrollY = window.scrollY;
        let active = 0;
        stages.forEach((s, i) => {
            if (scrollY >= s.offsetTop - H * 0.4) active = i;
        });
        currentStage = active;
        pips.forEach((p, j) => p.classList.toggle("active", j === active));
    }

    ScrollTrigger.create({
        trigger: ".journey",
        start: "top top",
        end: "bottom bottom",
        onUpdate: self => {
            journeyFill.style.width = (self.progress * 100).toFixed(1) + "%";
            updatePips();
        },
    });

    /* ── Pip click → smooth scroll via Lenis ── */
    pips.forEach(p => {
        p.addEventListener("click", () => {
            const idx = parseInt(p.dataset.stage);
            const target = stages[idx];
            if (target) lenis.scrollTo(target, { duration: 2 });
        });
    });

    /* ── gs-up: scroll-triggered reveals with blur ── */
    function setupReveals() {
        $$(".gs-up").forEach(el => {
            gsap.fromTo(el,
                { y: 50, opacity: 0, filter: "blur(6px)" },
                {
                    y: 0, opacity: 1, filter: "blur(0px)",
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 92%",
                        toggleActions: "play none none reverse",
                    },
                }
            );
        });
    }

    /* ── gs-stagger: staggered children ── */
    function setupStaggers() {
        $$(".gs-stagger").forEach(parent => {
            gsap.fromTo(parent.children,
                { y: 30, opacity: 0, scale: 0.97 },
                {
                    y: 0, opacity: 1, scale: 1,
                    duration: 0.85,
                    stagger: 0.12,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: parent,
                        start: "top 92%",
                        toggleActions: "play none none reverse",
                    },
                }
            );
        });
    }

    /* ── Stat number counters ── */
    function setupCounters() {
        $$("[data-count]").forEach(el => {
            const end = parseInt(el.dataset.count);
            const obj = { val: 0 };
            gsap.to(obj, {
                val: end,
                duration: 2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 92%",
                    toggleActions: "play none none reset",
                },
                onUpdate: () => { el.textContent = Math.round(obj.val); },
            });
        });
    }

    /* ═══════════════════════════════════════════════════
       S0: ORIGIN — mountains fade, color shift
       ═══════════════════════════════════════════════════ */
    {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#stage0",
                start: "top top",
                end: "bottom top",
                scrub: 1.5,
                onUpdate: self => {
                    mountainParallax = self.progress * 400;
                    starsOpacity = Math.max(0, 1 - self.progress * 2.5);
                },
            },
        });

        // Background color to roast
        tl.to(bg, {
            r: palettes[1].r, g: palettes[1].g, b: palettes[1].b,
            duration: 0.3, ease: "none",
        }, 0.7);
    }

    /* ═══════════════════════════════════════════════════
       S1: ROAST — heat rings + bean color shift
       ═══════════════════════════════════════════════════ */
    {
        const roastBean = $("#roastBean");
        const heatRings = $$("#stage1 .heat-ring");

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#stage1",
                start: "top top",
                end: "bottom top",
                scrub: 1.5,
            },
        });

        // Heat rings rotate and intensify
        heatRings.forEach((ring, i) => {
            tl.to(ring, {
                rotation: 360 * (i % 2 === 0 ? 1 : -1) * (1 + i * 0.2),
                scale: 1.05 + i * 0.08,
                borderColor: `rgba(212,165,90,${(0.06 + i * 0.025).toFixed(3)})`,
                duration: 1,
                ease: "none",
            }, 0);
        });

        // Bean: green → golden → espresso brown
        if (roastBean) {
            tl.to(roastBean, {
                background: "radial-gradient(ellipse at 40% 35%, hsl(45,70%,55%), hsl(30,60%,35%))",
                boxShadow: "0 0 80px rgba(212,165,90,0.4)",
                duration: 0.35, ease: "none",
            }, 0.1);

            tl.to(roastBean, {
                background: "radial-gradient(ellipse at 40% 35%, hsl(25,80%,28%), hsl(15,70%,15%))",
                boxShadow: "0 0 120px rgba(212,165,90,0.6)",
                scale: 1.15,
                duration: 0.35, ease: "none",
            }, 0.5);
        }

        // Background transition
        tl.to(bg, {
            r: palettes[2].r, g: palettes[2].g, b: palettes[2].b,
            duration: 0.25, ease: "none",
        }, 0.75);
    }

    /* ═══════════════════════════════════════════════════
       S2: GRIND — blade spin + particle burst
       ═══════════════════════════════════════════════════ */
    {
        const blades = $("#grindBlades");
        const bladeGroup = $("#bladeGroup");
        let grindBurstFired = false;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#stage2",
                start: "top top",
                end: "bottom top",
                scrub: 1.5,
                onUpdate: self => {
                    if (self.progress > 0.65 && !grindBurstFired) {
                        grindBurstFired = true;
                        spawnBurst(W / 2, H / 2, 140, "170,130,90");
                    }
                    if (self.progress < 0.6) grindBurstFired = false;
                },
            },
        });

        if (blades) {
            tl.fromTo(blades,
                { opacity: 0, scale: 0.3 },
                { opacity: 0.85, scale: 1, duration: 0.25, ease: "back.out(1.5)" },
                0
            );
        }

        if (bladeGroup) {
            tl.to(bladeGroup, {
                rotation: 1440,
                transformOrigin: "200px 200px",
                duration: 0.8,
                ease: "power2.in",
            }, 0.1);
        }

        // Background
        tl.to(bg, {
            r: palettes[3].r, g: palettes[3].g, b: palettes[3].b,
            duration: 0.25, ease: "none",
        }, 0.75);
    }

    /* ═══════════════════════════════════════════════════
       S3: EXTRACT — portafilter + espresso stream
       ═══════════════════════════════════════════════════ */
    {
        const portafilter = $("#portafilter");
        const stream = $("#espressoStream");
        const pool = $("#dripPool");

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#stage3",
                start: "top top",
                end: "bottom top",
                scrub: 1.5,
            },
        });

        if (portafilter) {
            tl.fromTo(portafilter,
                { y: -80, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.2, ease: "power3.out" },
                0
            );
        }

        if (stream) {
            tl.to(stream, { height: 180, duration: 0.45, ease: "power2.out" }, 0.15);
        }

        if (pool) {
            tl.to(pool, { opacity: 1, width: 80, height: 30, duration: 0.25, ease: "power2.out" }, 0.4);
            tl.to(pool, { width: 140, height: 50, duration: 0.2 }, 0.6);
        }

        // Steam during extraction
        tl.to({}, {
            duration: 0.5,
            onUpdate() { if (Math.random() > 0.7) spawnSteam(W / 2, H * 0.35); },
        }, 0.3);

        // Background
        tl.to(bg, {
            r: palettes[4].r, g: palettes[4].g, b: palettes[4].b,
            duration: 0.25, ease: "none",
        }, 0.75);
    }

    /* ═══════════════════════════════════════════════════
       S4: POUR — cup entrance + latte art draw
       ═══════════════════════════════════════════════════ */
    {
        const cup = $("#cupTopdown");
        const rosetta = $("#rosettaPath");
        const milk = $("#milkStream");

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#stage4",
                start: "top top",
                end: "bottom top",
                scrub: 1.5,
            },
        });

        if (cup) {
            tl.fromTo(cup,
                { scale: 0.5, rotateX: -50, opacity: 0 },
                { scale: 1, rotateX: 0, opacity: 1, duration: 0.3, ease: "power3.out" },
                0
            );
        }

        if (milk) {
            tl.to(milk, { height: 130, opacity: 1, duration: 0.2 }, 0.15);
            tl.to(milk, { height: 0, opacity: 0, duration: 0.15 }, 0.6);
        }

        if (rosetta) {
            tl.to(rosetta, {
                attr: { "stroke-dashoffset": 0 },
                duration: 0.45,
                ease: "power1.inOut",
            }, 0.25);
        }

        // Background
        tl.to(bg, {
            r: palettes[5].r, g: palettes[5].g, b: palettes[5].b,
            duration: 0.25, ease: "none",
        }, 0.75);
    }

    /* ═══════════════════════════════════════════════════
       S5: ATMOSPHERE — gallery circle reveal
       ═══════════════════════════════════════════════════ */
    {
        const reveal = $("#galleryReveal");

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#stage5",
                start: "top top",
                end: "bottom top",
                scrub: 1.5,
            },
        });

        if (reveal) {
            tl.to(reveal, {
                clipPath: "circle(75% at 50% 50%)",
                duration: 0.8,
                ease: "power2.out",
            }, 0.1);
        }

        tl.to(bg, {
            r: palettes[6].r, g: palettes[6].g, b: palettes[6].b,
            duration: 0.25, ease: "none",
        }, 0.75);
    }

    /* ═══════════════════════════════════════════════════
       CINEMATIC STAGE TRANSITIONS
       Letterbox bars + title flash between sections
       ═══════════════════════════════════════════════════ */

    stages.forEach((stage, i) => {
        if (i === 0) return;

        ScrollTrigger.create({
            trigger: stage,
            start: "top 85%",
            end: "top 15%",
            scrub: 1,
            onUpdate: self => {
                const p = self.progress;
                const barH = Math.sin(p * Math.PI) * 5;
                if (lbTop) lbTop.style.height = barH + "vh";
                if (lbBot) lbBot.style.height = barH + "vh";
            },
            onEnter: () => showStageTitle(i),
        });
    });

    function showStageTitle(i) {
        if (!stageFlash || !stageFlashText) return;
        stageFlashText.textContent = stageNames[i] || "";
        gsap.timeline()
            .set(stageFlash, { opacity: 1 })
            .fromTo(stageFlashText,
                { opacity: 0, scale: 1.8, filter: "blur(20px)" },
                { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out" }
            )
            .to(stageFlashText, {
                opacity: 0, scale: 0.85, filter: "blur(8px)",
                duration: 0.35, ease: "power2.in",
            }, "+=0.25")
            .set(stageFlash, { opacity: 0 });
    }

    /* ═══════════════════════════════════════════════════
       INITIALIZE ALL REVEALS (after menu render)
       ═══════════════════════════════════════════════════ */

    setupReveals();
    setupStaggers();
    setupCounters();

    // Ensure ScrollTrigger measures layout correctly
    requestAnimationFrame(() => ScrollTrigger.refresh(true));

    /* ═══════════════════════════════════════════════════
       MASTER RENDER LOOP
       ═══════════════════════════════════════════════════ */

    gsap.ticker.add(() => {
        renderBg();
        renderAmbient();
        renderOrigin();
        spawnAmbient();
        updateParticles();
    });

    /* ═══════════════════════════════════════════════════
       RESERVATION FORM
       ═══════════════════════════════════════════════════ */

    const form = $("#reserveForm");
    const formMsg = $("#formMsg");

    if (form) {
        form.addEventListener("submit", e => {
            e.preventDefault();
            const fd = new FormData(form);
            const name = fd.get("name")?.trim();
            const email = fd.get("email")?.trim();
            const guests = parseInt(fd.get("guests"));
            const date = fd.get("date");

            if (!name || !email || !guests || !date) {
                showFormMsg("Please fill in all fields.", "#ff6b6b");
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showFormMsg("Please enter a valid email.", "#ff6b6b");
                return;
            }
            if (guests < 1 || guests > 12) {
                showFormMsg("Guests must be between 1 and 12.", "#ff6b6b");
                return;
            }
            const chosen = new Date(date);
            if (chosen <= new Date()) {
                showFormMsg("Please pick a future date.", "#ff6b6b");
                return;
            }
            showFormMsg(
                `Reserved for ${name} — ${guests} guest${guests > 1 ? "s" : ""} on ${chosen.toLocaleDateString("en-US", { month: "long", day: "numeric" })}. See you soon!`,
                "var(--gold-soft)"
            );
            form.reset();
        });
    }

    function showFormMsg(text, color) {
        if (!formMsg) return;
        formMsg.textContent = text;
        formMsg.style.color = color;
        gsap.fromTo(formMsg, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35 });
    }

    /* ═══════════════════════════════════════════════════
       LOADING SEQUENCE + CINEMATIC ENTRANCE
       ═══════════════════════════════════════════════════ */

    window.addEventListener("load", () => {
        // Animate loading bar
        gsap.to(loaderFill, {
            width: "100%",
            duration: 1.2,
            ease: "power2.inOut",
            onComplete: () => {
                // Fade out loader
                gsap.to(loader, {
                    opacity: 0,
                    duration: 0.6,
                    delay: 0.2,
                    ease: "power2.in",
                    onComplete: () => {
                        loader.style.display = "none";
                        entranceSequence();
                    },
                });
            },
        });
    });

    function entranceSequence() {
        // Body fade in
        gsap.from(body, { opacity: 0, duration: 0.8, ease: "power2.out" });

        // "Origin" title flash
        showStageTitle(0);

        // Hero title lines stagger in with blur
        gsap.fromTo(".title-line",
            { y: 80, opacity: 0, filter: "blur(12px)" },
            {
                y: 0, opacity: 1, filter: "blur(0px)",
                duration: 1,
                stagger: 0.15,
                ease: "power3.out",
                delay: 0.3,
            }
        );
    }

})();
