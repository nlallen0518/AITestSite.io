/* ═══════════════════════════════════════════════════
   URBAN COFFEE HOUSE — CINEMATIC GSAP ENGINE
   Sticky-scene architecture (no GSAP pin)
   ═══════════════════════════════════════════════════ */

(() => {
    "use strict";

    gsap.registerPlugin(ScrollTrigger);

    /* ── DOM refs ── */
    const $ = (s, p = document) => p.querySelector(s);
    const $$ = (s, p = document) => [...p.querySelectorAll(s)];

    const body = document.body;
    const bgCanvas = $("#bgCanvas");
    const bgCtx = bgCanvas.getContext("2d");
    const ptCanvas = $("#particleCanvas");
    const ptCtx = ptCanvas.getContext("2d");
    const journeyFill = $("#journeyBarFill");
    const pips = $$(".stage-pip");
    const stages = $$(".stage");
    const stageNames = ["Origin", "Roast", "Grind", "Extract", "Pour", "Atmosphere", "The Table"];

    /* ── Resize ── */
    let W, H;
    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        bgCanvas.width = ptCanvas.width = W;
        bgCanvas.height = ptCanvas.height = H;
        resizeMountains();
        resizeStars();
        resizeHeat();
    }
    window.addEventListener("resize", resize);
    resize();

    /* ═══════════════════════════════════════════════════
       BACKGROUND CANVAS
       ═══════════════════════════════════════════════════ */
    const stageColors = [
        { r: 6, g: 8, b: 14 },
        { r: 42, g: 16, b: 8 },
        { r: 12, g: 16, b: 30 },
        { r: 30, g: 18, b: 8 },
        { r: 16, g: 14, b: 24 },
        { r: 10, g: 18, b: 14 },
        { r: 6, g: 8, b: 14 },
    ];
    let currentBg = { ...stageColors[0] };

    function renderBg() {
        const { r, g, b } = currentBg;
        const grad = bgCtx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
        grad.addColorStop(0, `rgb(${Math.round(r + 12)},${Math.round(g + 10)},${Math.round(b + 15)})`);
        grad.addColorStop(1, `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`);
        bgCtx.fillStyle = grad;
        bgCtx.fillRect(0, 0, W, H);
    }
    renderBg();

    /* ═══════════════════════════════════════════════════
       PROCEDURAL MOUNTAINS
       ═══════════════════════════════════════════════════ */
    const mCanvas = $("#mountainCanvas");
    const mCtx = mCanvas ? mCanvas.getContext("2d") : null;
    let mountainLayers = [];
    let mountainScroll = 0;

    function resizeMountains() {
        if (!mCanvas) return;
        mCanvas.width = W;
        mCanvas.height = H;
        buildMountains();
    }

    function buildMountains() {
        const count = 5;
        mountainLayers = [];
        for (let i = 0; i < count; i++) {
            const pts = [];
            const segW = 20 + i * 8;
            const baseY = H * (0.45 + i * 0.11);
            const amp = 60 + (count - i) * 30;
            for (let x = 0; x <= W + segW; x += segW) {
                pts.push({ x, y: baseY + (Math.random() - 0.5) * amp });
            }
            const lightness = 4 + i * 3;
            mountainLayers.push({ pts, color: `hsl(225, 20%, ${lightness}%)`, parallax: 0.12 + i * 0.08 });
        }
    }

    function renderMountains() {
        if (!mCtx) return;
        mCtx.clearRect(0, 0, W, H);
        mountainLayers.forEach(layer => {
            const off = mountainScroll * layer.parallax;
            mCtx.save();
            mCtx.translate(-off, 0);
            mCtx.beginPath();
            mCtx.moveTo(layer.pts[0].x, layer.pts[0].y);
            for (let j = 1; j < layer.pts.length; j++) {
                const prev = layer.pts[j - 1];
                const curr = layer.pts[j];
                const cx = (prev.x + curr.x) / 2;
                const cy = (prev.y + curr.y) / 2;
                mCtx.quadraticCurveTo(prev.x, prev.y, cx, cy);
            }
            mCtx.lineTo(W + 200, H + 10);
            mCtx.lineTo(-200, H + 10);
            mCtx.closePath();
            mCtx.fillStyle = layer.color;
            mCtx.fill();
            mCtx.restore();
        });
    }
    buildMountains();
    renderMountains();

    /* ═══════════════════════════════════════════════════
       STARS
       ═══════════════════════════════════════════════════ */
    const sCanvas = $("#starsCanvas");
    const sCtx = sCanvas ? sCanvas.getContext("2d") : null;
    let stars = [];

    function resizeStars() {
        if (!sCanvas) return;
        sCanvas.width = W;
        sCanvas.height = H;
        buildStars();
    }

    function buildStars() {
        stars = [];
        const count = Math.floor((W * H) / 2800);
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H * 0.55,
                r: Math.random() * 1.4 + 0.3,
                phase: Math.random() * Math.PI * 2,
                speed: 0.3 + Math.random() * 0.7,
            });
        }
    }

    let starTime = 0;
    function renderStars() {
        if (!sCtx) return;
        sCtx.clearRect(0, 0, W, H);
        starTime += 0.015;
        stars.forEach(s => {
            const a = 0.35 + 0.65 * Math.sin(starTime * s.speed + s.phase);
            sCtx.beginPath();
            sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            sCtx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
            sCtx.fill();
        });
    }
    buildStars();

    /* ═══════════════════════════════════════════════════
       HEAT DISTORTION
       ═══════════════════════════════════════════════════ */
    const hCanvas = $("#heatCanvas");
    const hCtx = hCanvas ? hCanvas.getContext("2d") : null;
    let heatProgress = 0;

    function resizeHeat() {
        if (!hCanvas) return;
        hCanvas.width = W;
        hCanvas.height = H;
    }

    function renderHeat() {
        if (!hCtx) return;
        hCtx.clearRect(0, 0, W, H);
        const t = performance.now() * 0.001;
        const intensity = heatProgress;
        if (intensity < 0.01) return;
        for (let i = 0; i < 8; i++) {
            const y = H * 0.3 + i * (H * 0.06);
            const wave = Math.sin(t * 1.5 + i * 0.8) * 30 * intensity;
            hCtx.beginPath();
            hCtx.moveTo(0, y);
            for (let x = 0; x <= W; x += 20) {
                const dy = Math.sin(x * 0.005 + t * 2 + i) * wave;
                hCtx.lineTo(x, y + dy);
            }
            hCtx.strokeStyle = `rgba(212,165,90,${(0.04 * intensity).toFixed(3)})`;
            hCtx.lineWidth = 1.5;
            hCtx.stroke();
        }
    }

    /* ═══════════════════════════════════════════════════
       PARTICLE SYSTEM
       ═══════════════════════════════════════════════════ */
    let particles = [];

    function spawnGrindBurst() {
        for (let i = 0; i < 120; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.2 + Math.random() * 4;
            particles.push({
                x: W / 2, y: H / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.006 + Math.random() * 0.012,
                size: 1 + Math.random() * 2.5,
                color: Math.random() > 0.5 ? "212,165,90" : "200,215,255",
            });
        }
    }

    function spawnSteam(x, y) {
        for (let i = 0; i < 3; i++) {
            particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y,
                vx: (Math.random() - 0.5) * 0.4,
                vy: -0.6 - Math.random() * 0.8,
                life: 1,
                decay: 0.005 + Math.random() * 0.008,
                size: 1.5 + Math.random() * 2,
                color: "255,255,255",
            });
        }
    }

    function updateParticles() {
        ptCtx.clearRect(0, 0, W, H);
        particles = particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy -= 0.005;
            p.life -= p.decay;
            if (p.life <= 0) return false;
            ptCtx.beginPath();
            ptCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ptCtx.fillStyle = `rgba(${p.color},${p.life.toFixed(2)})`;
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
        const interactiveEls = "a, button, input, .menu-card, .glass-card, .btn-reserve, .stage-pip";
        document.addEventListener("mouseover", e => {
            if (e.target.closest(interactiveEls)) aura.classList.add("hover");
        });
        document.addEventListener("mouseout", e => {
            if (e.target.closest(interactiveEls)) aura.classList.remove("hover");
        });
        gsap.ticker.add(() => {
            ax += (mx - ax) * 0.15;
            ay += (my - ay) * 0.15;
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

    function renderMenu() {
        const dg = $("#menuDrinks");
        const fg = $("#menuFood");
        if (dg) dg.innerHTML = drinks.map(cardHTML).join("");
        if (fg) fg.innerHTML = food.map(cardHTML).join("");
    }
    function cardHTML(item) {
        return `<article class="menu-card gs-reveal"><img src="${item.img}" alt="${item.name}" loading="lazy"><div class="menu-card-body"><div class="menu-card-head"><h3>${item.name}</h3><strong>${item.price}</strong></div><p>${item.desc}</p></div></article>`;
    }
    renderMenu();

    /* ═══════════════════════════════════════════════════
       FLOATING BEANS
       ═══════════════════════════════════════════════════ */
    function createFloatBeans() {
        const container = $("#floatBeans");
        if (!container) return;
        for (let i = 0; i < 12; i++) {
            const bean = document.createElement("div");
            bean.style.cssText = `
                position: absolute;
                width: ${8 + Math.random() * 14}px;
                height: ${12 + Math.random() * 18}px;
                border-radius: 50%;
                background: radial-gradient(ellipse, #6a4a30, #3b220f);
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: 0;
            `;
            container.appendChild(bean);
            gsap.to(bean, {
                opacity: 0.25 + Math.random() * 0.2,
                y: `-=${40 + Math.random() * 80}`,
                x: `+=${(Math.random() - 0.5) * 60}`,
                rotation: Math.random() * 360,
                duration: 6 + Math.random() * 8,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: Math.random() * 4,
            });
        }
    }
    createFloatBeans();

    /* ═══════════════════════════════════════════════════
       GSAP SCROLL TRIGGERS — CINEMATIC ENGINE
       No pin — scenes use CSS position:sticky instead
       ═══════════════════════════════════════════════════ */

    /* ── Active stage pip tracker + progress bar ── */
    function updatePips() {
        const scrollY = window.scrollY;
        let active = 0;
        stages.forEach((stage, i) => {
            if (scrollY >= stage.offsetTop - H * 0.4) active = i;
        });
        setActivePip(active);
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
    // Also run on initial load
    updatePips();

    function setActivePip(idx) {
        pips.forEach((p, j) => p.classList.toggle("active", j === idx));
    }

    /* ── Pip click → scroll ── */
    pips.forEach(p => {
        p.addEventListener("click", () => {
            const idx = parseInt(p.dataset.stage);
            const target = stages[idx];
            if (target) {
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

    /* ── gs-reveal (scroll-triggered reveals) ── */
    function setupReveals() {
        $$(".gs-reveal").forEach(el => {
            gsap.fromTo(el,
                { y: 60, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 95%",
                        toggleActions: "play none none reverse",
                        invalidateOnRefresh: true,
                    },
                }
            );
        });
    }

    /* ── gs-stagger (staggered children reveals) ── */
    function setupStaggers() {
        $$(".gs-stagger").forEach(parent => {
            gsap.fromTo(parent.children,
                { y: 40, opacity: 0, rotation: -2 },
                {
                    y: 0, opacity: 1, rotation: 0,
                    duration: 0.9,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: parent,
                        start: "top 95%",
                        toggleActions: "play none none reverse",
                        invalidateOnRefresh: true,
                    },
                }
            );
        });
    }

    /* ── Stat number counting ── */
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
                    start: "top 95%",
                    toggleActions: "play none none reset",
                    invalidateOnRefresh: true,
                },
                onUpdate: () => { el.textContent = Math.round(obj.val); },
            });
        });
    }

    /* ═══════════════════════════════════════════════════
       S0: ORIGIN — mountains + cherry portal
       ═══════════════════════════════════════════════════ */
    {
        const originTL = gsap.timeline({
            scrollTrigger: {
                trigger: "#stage0",
                start: "top top",
                end: "bottom top",
                scrub: 1.5,
                onUpdate: self => {
                    mountainScroll = self.progress * 500;
                },
            },
        });

        // Stars fade out
        const starsC = $("#starsCanvas");
        if (starsC) {
            originTL.to(starsC, { opacity: 0, duration: 0.3 }, 0.4);
        }

        // Cherry portal appears, splits, reveals bean
        const cherry = $("#cherryPortal");
        const bean = $("#cherryBean");
        if (cherry) {
            originTL
                .to(cherry, { opacity: 1, scale: 1, duration: 0.15, ease: "back.out(1.8)" }, 0.3)
                .to("#stage0 .cherry-l", { x: -80, opacity: 0, duration: 0.2, ease: "power3.in" }, 0.55)
                .to("#stage0 .cherry-r", { x: 80, opacity: 0, duration: 0.2, ease: "power3.in" }, 0.55);
            if (bean) {
                originTL.to(bean, { opacity: 1, scale: 1.2, duration: 0.15 }, 0.6);
            }
        }

        // Background color shift toward roast
        originTL.to(currentBg, {
            r: stageColors[1].r, g: stageColors[1].g, b: stageColors[1].b,
            duration: 0.25, ease: "none",
        }, 0.75);
    }

    /* ═══════════════════════════════════════════════════
       S1: ROAST — drum rings + bean hue shift
       ═══════════════════════════════════════════════════ */
    {
        const roastTL = gsap.timeline({
            scrollTrigger: {
                trigger: "#stage1",
                start: "top top",
                end: "bottom top",
                scrub: 1.5,
                onUpdate: self => {
                    heatProgress = self.progress;
                },
            },
        });

        // Drum rings rotate
        const rings = $$("#stage1 .drum-ring");
        rings.forEach((ring, i) => {
            roastTL.to(ring, {
                rotation: 360 * (i % 2 === 0 ? 1 : -1) * (1 + i * 0.3),
                duration: 1, ease: "none",
            }, 0);
        });

        // Bean hue: green → golden → espresso brown
        const rb = $("#roastBean");
        if (rb) {
            roastTL
                .to(rb, {
                    background: "radial-gradient(ellipse at 40% 35%, hsl(45,70%,55%), hsl(30,60%,35%))",
                    boxShadow: "0 0 80px rgba(212,165,90,0.4)",
                    duration: 0.4, ease: "none",
                }, 0.1)
                .to(rb, {
                    background: "radial-gradient(ellipse at 40% 35%, hsl(25,80%,28%), hsl(15,70%,15%))",
                    boxShadow: "0 0 120px rgba(212,165,90,0.6)",
                    duration: 0.4, ease: "none",
                }, 0.5)
                .to(rb, { scale: 1.15, duration: 0.3 }, 0.6);
        }

        // Heat glow
        const hg = $("#heatGlow");
        if (hg) {
            roastTL.to(hg, { opacity: 1, duration: 0.5 }, 0.2);
        }

        // Bg color
        roastTL.to(currentBg, {
            r: stageColors[2].r, g: stageColors[2].g, b: stageColors[2].b,
            duration: 0.25, ease: "none",
        }, 0.75);
    }

    /* ═══════════════════════════════════════════════════
       S2: GRIND — blade spin + burst
       ═══════════════════════════════════════════════════ */
    {
        const grindTL = gsap.timeline({
            scrollTrigger: {
                trigger: "#stage2",
                start: "top top",
                end: "bottom top",
                scrub: 1.5,
            },
        });

        const bladeRing = $("#bladeRing");
        const bladeSet = $("#bladeSet");
        const grindFlash = $("#grindFlash");

        if (bladeRing) {
            grindTL
                .fromTo(bladeRing, { opacity: 0, scale: 0.3 }, { opacity: 0.85, scale: 1, duration: 0.25, ease: "back.out(1.6)" }, 0)
                .to(bladeSet, { rotation: 1080, transformOrigin: "200px 200px", duration: 0.8, ease: "power2.in" }, 0.1);
        }

        if (grindFlash) {
            grindTL.to(grindFlash, {
                opacity: 1, duration: 0.03,
                onComplete: () => {
                    spawnGrindBurst();
                    gsap.to(grindFlash, { opacity: 0, duration: 0.4 });
                },
            }, 0.7);
        }

        // Bg color
        grindTL.to(currentBg, {
            r: stageColors[3].r, g: stageColors[3].g, b: stageColors[3].b,
            duration: 0.25, ease: "none",
        }, 0.75);
    }

    /* ═══════════════════════════════════════════════════
       S3: EXTRACT — espresso stream + drip pool
       ═══════════════════════════════════════════════════ */
    {
        const extractTL = gsap.timeline({
            scrollTrigger: {
                trigger: "#stage3",
                start: "top top",
                end: "bottom top",
                scrub: 1.5,
            },
        });

        const pfGroup = $("#pfGroup");
        const stream = $("#espressoStream");
        const pool = $("#dripPool");

        if (pfGroup) {
            extractTL.fromTo(pfGroup, { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.2, ease: "power3.out" }, 0);
        }

        if (stream) {
            extractTL.to(stream, { height: 180, duration: 0.5, ease: "power2.out" }, 0.15);
        }

        if (pool) {
            extractTL
                .to(pool, { opacity: 1, width: 80, height: 30, duration: 0.3, ease: "power2.out" }, 0.45)
                .to(pool, { width: 140, height: 50, duration: 0.2 }, 0.65);
        }

        // Steam particles
        extractTL.to({}, {
            duration: 0.5,
            onUpdate: function () {
                if (Math.random() > 0.7) spawnSteam(W / 2, H * 0.35);
            },
        }, 0.3);

        // Bg color
        extractTL.to(currentBg, {
            r: stageColors[4].r, g: stageColors[4].g, b: stageColors[4].b,
            duration: 0.25, ease: "none",
        }, 0.75);
    }

    /* ═══════════════════════════════════════════════════
       S4: POUR — cup tilt + latte art draw
       ═══════════════════════════════════════════════════ */
    {
        const pourTL = gsap.timeline({
            scrollTrigger: {
                trigger: "#stage4",
                start: "top top",
                end: "bottom top",
                scrub: 1.5,
            },
        });

        const cup = $("#cup3d");
        const rosetta = $("#rosettaPath");
        const milkPour = $("#milkPour");

        if (cup) {
            pourTL.fromTo(cup,
                { scale: 0.6, rotateX: -60, opacity: 0 },
                { scale: 1, rotateX: 0, opacity: 1, duration: 0.3, ease: "power3.out" },
                0
            );
        }

        if (milkPour) {
            pourTL
                .to(milkPour, { height: 120, opacity: 1, duration: 0.2 }, 0.15)
                .to(milkPour, { height: 0, opacity: 0, duration: 0.15 }, 0.6);
        }

        if (rosetta) {
            pourTL.to(rosetta, { strokeDashoffset: 0, duration: 0.5, ease: "power1.inOut" }, 0.25);
        }

        // Bg color
        pourTL.to(currentBg, {
            r: stageColors[5].r, g: stageColors[5].g, b: stageColors[5].b,
            duration: 0.25, ease: "none",
        }, 0.75);
    }

    /* ═══════════════════════════════════════════════════
       S5: ATMOSPHERE — gallery reveal circle
       ═══════════════════════════════════════════════════ */
    {
        const atmoTL = gsap.timeline({
            scrollTrigger: {
                trigger: "#stage5",
                start: "top top",
                end: "bottom top",
                scrub: 1.5,
            },
        });

        const revealFrame = $("#revealFrame");
        if (revealFrame) {
            atmoTL.to(revealFrame, {
                clipPath: "circle(75% at 50% 50%)",
                duration: 0.8,
                ease: "power2.out",
            }, 0.1);
        }

        // Bg color
        atmoTL.to(currentBg, {
            r: stageColors[6].r, g: stageColors[6].g, b: stageColors[6].b,
            duration: 0.25, ease: "none",
        }, 0.75);
    }

    /* ═══════════════════════════════════════════════════
       CINEMATIC TRANSITIONS — letterbox, warp, flash
       ═══════════════════════════════════════════════════ */
    const lbTop = $(".letterbox-top");
    const lbBot = $(".letterbox-bot");
    const warpTunnel = $("#warpTunnel");
    const warpRings = $$(".warp-ring");
    const lightRays = $("#lightRays");
    const titleFlash = $("#stageTitleFlash");
    const stfLabel = $("#stfLabel");

    stages.forEach((stage, i) => {
        if (i === 0) return;

        ScrollTrigger.create({
            trigger: stage,
            start: "top 90%",
            end: "top 10%",
            scrub: 1,
            onUpdate: self => {
                const p = self.progress;
                const barH = Math.sin(p * Math.PI) * 6;
                if (lbTop) lbTop.style.height = barH + "vh";
                if (lbBot) lbBot.style.height = barH + "vh";
            },
            onEnter: () => {
                // Stage title flash
                if (stfLabel && titleFlash) {
                    stfLabel.textContent = stageNames[i] || "";
                    gsap.timeline()
                        .set(titleFlash, { opacity: 1 })
                        .fromTo(stfLabel,
                            { opacity: 0, scale: 1.8, filter: "blur(20px)" },
                            { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "power3.out" }
                        )
                        .to(stfLabel, { opacity: 0, scale: 0.8, filter: "blur(10px)", duration: 0.4, ease: "power2.in" }, "+=0.3")
                        .set(titleFlash, { opacity: 0 });
                }

                // Warp tunnel pulse
                if (warpTunnel) {
                    gsap.timeline()
                        .set(warpTunnel, { opacity: 1 })
                        .fromTo(warpRings, { scale: 0 }, {
                            scale: 1, duration: 0.7, stagger: 0.08,
                            ease: "power3.out",
                        })
                        .to(warpRings, { scale: 2.5, opacity: 0, duration: 0.5, stagger: 0.05, ease: "power2.in" }, "+=0.1")
                        .set(warpTunnel, { opacity: 0 });
                }

                // Light rays flash
                if (lightRays) {
                    gsap.timeline()
                        .to(lightRays, { opacity: 1, duration: 0.3 })
                        .to(lightRays, { opacity: 0, duration: 0.8 }, "+=0.4");
                }
            },
        });
    });

    /* ═══════════════════════════════════════════════════
       INITIALIZE REVEALS (after menu render)
       ═══════════════════════════════════════════════════ */
    setupReveals();
    setupStaggers();
    setupCounters();

    // Force recalculation after layout settles
    requestAnimationFrame(() => {
        ScrollTrigger.refresh(true);
    });

    /* ═══════════════════════════════════════════════════
       MASTER RENDER LOOP
       ═══════════════════════════════════════════════════ */
    gsap.ticker.add(() => {
        renderBg();
        renderMountains();
        renderStars();
        renderHeat();
        updateParticles();
    });

    /* ═══════════════════════════════════════════════════
       RESERVATION FORM
       ═══════════════════════════════════════════════════ */
    const form = $("#reservationForm");
    const formMsg = $("#formMessage");
    if (form) {
        form.addEventListener("submit", e => {
            e.preventDefault();
            const fd = new FormData(form);
            const name = fd.get("name")?.trim();
            const email = fd.get("email")?.trim();
            const guests = parseInt(fd.get("guests"));
            const date = fd.get("date");
            if (!name || !email || !guests || !date) {
                showMsg("Please fill in all fields.", "#ff6b6b");
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showMsg("Please enter a valid email.", "#ff6b6b");
                return;
            }
            if (guests < 1 || guests > 12) {
                showMsg("Guests must be between 1 and 12.", "#ff6b6b");
                return;
            }
            const chosen = new Date(date);
            if (chosen <= new Date()) {
                showMsg("Please pick a future date.", "#ff6b6b");
                return;
            }
            showMsg(`Reserved for ${name} — ${guests} guest${guests > 1 ? "s" : ""} on ${chosen.toLocaleDateString("en-US", { month: "long", day: "numeric" })}. See you soon!`, "var(--gold-soft)");
            form.reset();
        });
    }

    function showMsg(text, color) {
        if (!formMsg) return;
        formMsg.textContent = text;
        formMsg.style.color = color;
        gsap.fromTo(formMsg, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 });
    }

    /* ═══════════════════════════════════════════════════
       INITIAL CINEMATIC ENTRANCE
       ═══════════════════════════════════════════════════ */
    window.addEventListener("load", () => {
        gsap.from(body, { opacity: 0, duration: 1.2, ease: "power2.out" });

        if (stfLabel && titleFlash) {
            stfLabel.textContent = "Origin";
            gsap.timeline({ delay: 0.6 })
                .set(titleFlash, { opacity: 1 })
                .fromTo(stfLabel,
                    { opacity: 0, scale: 2, filter: "blur(30px)" },
                    { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.8, ease: "power3.out" }
                )
                .to(stfLabel, { opacity: 0, scale: 0.7, filter: "blur(12px)", duration: 0.6, ease: "power2.in" }, "+=0.5")
                .set(titleFlash, { opacity: 0 });
        }

        if (lightRays) {
            gsap.timeline({ delay: 0.3 })
                .to(lightRays, { opacity: 0.8, duration: 0.5 })
                .to(lightRays, { opacity: 0, duration: 1.5 }, "+=0.6");
        }

        if (warpTunnel) {
            gsap.timeline({ delay: 0.2 })
                .set(warpTunnel, { opacity: 1 })
                .fromTo(warpRings, { scale: 0 }, { scale: 1, duration: 1, stagger: 0.12, ease: "power3.out" })
                .to(warpRings, { scale: 3, opacity: 0, duration: 0.8, stagger: 0.06, ease: "power2.in" }, "+=0.3")
                .set(warpTunnel, { opacity: 0 });
        }
    });

})();
