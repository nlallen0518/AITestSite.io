/* ═══════════════════════════════════════════════════════════
   CMS DATA LAYER  —  Urban Coffee House
   All editable site content lives here. Data is stored in
   localStorage so changes persist without a server.
   Both the public site (app.js) and the admin panel read
   from this module.
   ═══════════════════════════════════════════════════════════ */

const CMS = (() => {
    const STORAGE_KEY = "uch_cms_data";
    const ADMIN_PASS_KEY = "uch_admin_pass";

    /* ───── Default password (owner should change on first login) ───── */
    const DEFAULT_PASSWORD = "coffee2026";

    /* ───── Default Content ───── */
    const DEFAULTS = {

        /* — Business Info — */
        business: {
            name: "Urban Coffee House",
            tagline: "Bean to Cup",
            location: "48 Lexington Row, Downtown District",
            phone: "+1 (415) 555-0174",
            email: "hello@urbancoffeehouse.com",
            hours: {
                weekday: "Mon — Fri 7 AM – 10 PM",
                saturday: "Sat 8 AM – 11:30 PM",
                sunday: "Sun 8 AM – 9 PM",
            },
        },

        /* — Stats (Origin section) — */
        stats: {
            countries: 6,
            farms: 14,
            altitude: "1800m+",
        },

        /* — Section Copy — */
        sections: {
            origin: {
                eyebrow: "Chapter One",
                lead: "Every cup begins as a cherry on a branch, 1,800\u00a0meters above sea level. Scroll to follow the journey\u00a0\u2014 from origin to your\u00a0table.",
                body: "We partner with farms across Ethiopia, Colombia, Guatemala, Japan, Kenya, and Brazil\u00a0\u2014 paying above market, visiting annually, learning\u00a0always.",
            },
            roast: {
                eyebrow: "Chapter Two",
                title: "The Roast",
                lead: "Inside the drum at 200\u00b0C. Sugars caramelize, acids develop, and over 800 aromatic compounds ignite. Watch the bean transform\u00a0\u2014 green to golden to deep espresso\u00a0brown.",
            },
            grind: {
                eyebrow: "Chapter Three",
                title: "The Grind",
                lead: "The blades close in. Grind size determines everything\u00a0\u2014 too coarse and water rushes through, too fine and bitterness takes over. We calibrate every\u00a0morning.",
            },
            extract: {
                eyebrow: "The Collection",
                title: "The Menu",
            },
            pour: {
                eyebrow: "Chapter Five",
                title: "The Pour",
                lead: "Looking down into the cup. Micro-foam at exactly 60\u00b0C enters and the rosetta forms. Proof that this cup was made with\u00a0care.",
            },
            atmosphere: {
                eyebrow: "The Space",
                title: "More than a caf\u00e9",
                lead: "The cup opens up and you\u2019re here\u00a0\u2014 concrete floors, walnut counters, morning light flooding the bar. Every detail exists to slow you\u00a0down.",
            },
            table: {
                eyebrow: "You Made It",
                title: "The Table",
                lead: "From cherry to cup, you\u2019ve seen every step. Now pull up a\u00a0chair.",
                closing: "See you at the bar. \u2726",
            },
        },

        /* — Quotes — */
        quotes: [
            {
                text: "Roasting is listening. The beans crack, change color, tell you when they\u2019re ready.",
                cite: "Alex Chen, Head Roaster",
                section: "roast",
            },
            {
                text: "The space was designed to feel like a pause\u00a0\u2014 somewhere between a gallery and a living room.",
                cite: "Mira Patel, Interior Architect",
                section: "atmosphere",
            },
        ],

        /* — Info Cards (glass-cards within sections) — */
        roastCards: [
            { title: "Light Roast", body: "Bright acidity, floral notes. Best for pour-over and filter." },
            { title: "Medium Roast", body: "Balanced sweetness, caramel body. Our house espresso profile." },
            { title: "Dark Roast", body: "Bold, chocolatey, low acidity. Ideal for milk drinks and cold brew." },
        ],
        grindCards: [
            { title: "Espresso", body: "Fine like powdered sugar. 9\u00a0bars pressure. 25-second pull." },
            { title: "Pour Over", body: "Medium like sea salt. Gravity-fed. 3.5-minute bloom." },
            { title: "Cold Brew", body: "Coarse like raw sugar. 12-hour immersion. Zero heat." },
        ],
        pourCards: [
            { title: "Milk Science", body: "Steam to 60\u00b0C\u00a0\u2014 the sweet spot where lactose breaks into simple sugars. Any hotter and proteins denature." },
            { title: "Plant Alternatives", body: "Oat, almond, coconut\u00a0\u2014 each steamed differently. Full micro-foam on every option." },
        ],
        faqCards: [
            { title: "Walk-ins?", body: "Always welcome. Reservations guarantee seating during peak." },
            { title: "Wi-Fi?", body: "Fast and free. Laptop-friendly after 2 PM weekdays." },
            { title: "Beans to go?", body: "Every origin available in 250g bags. Ground to your method." },
        ],

        /* — Menu — */
        drinks: [
            { name: "Midnight Espresso", price: "$4.50", desc: "Double ristretto. Dark cherry, raw cacao. No milk needed.", img: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?q=80&w=500&auto=format&fit=crop" },
            { name: "Velvet Latte", price: "$5.80", desc: "House espresso, oat milk micro-foam, vanilla bean.", img: "https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=500&auto=format&fit=crop" },
            { name: "Kyoto Cold Brew", price: "$6.30", desc: "12-hour immersion. Ethiopian Yirgacheffe. Black as midnight.", img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=500&auto=format&fit=crop" },
            { name: "Pour Over Flight", price: "$8.90", desc: "Three origins. Three methods. One journey.", img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=500&auto=format&fit=crop" },
        ],
        food: [
            { name: "Truffle Mushroom Toast", price: "$11.50", desc: "Sourdough, wild mushrooms, truffle oil, micro greens.", img: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=500&auto=format&fit=crop" },
            { name: "Maple Chilli Croissant", price: "$7.20", desc: "Laminated butter, smoked maple glaze, Aleppo pepper.", img: "https://images.unsplash.com/photo-1555507036-ab1f4038024a?q=80&w=500&auto=format&fit=crop" },
            { name: "Citrus Ricotta Pancakes", price: "$10.80", desc: "Fluffy, lemon zest, blueberry compote, powdered sugar.", img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=500&auto=format&fit=crop" },
            { name: "Dark Chocolate Tart", price: "$8.50", desc: "70% cacao, sea salt, espresso caramel, hazelnut praline.", img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=500&auto=format&fit=crop" },
        ],

        /* — Gallery Images (Atmosphere section) — */
        gallery: [
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=900&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=900&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=900&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=900&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=900&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=900&auto=format&fit=crop",
        ],

        /* — Menu note — */
        menuNote: "Menu rotates seasonally. Ask about this week\u2019s featured single-origin.",
    };

    /* ═══════════════════════════════════════════════════
       HELPERS
       ═══════════════════════════════════════════════════ */

    /** Deep merge: source values overwrite target, recursing into objects */
    function deepMerge(target, source) {
        const out = { ...target };
        for (const key of Object.keys(source)) {
            if (
                source[key] &&
                typeof source[key] === "object" &&
                !Array.isArray(source[key]) &&
                target[key] &&
                typeof target[key] === "object" &&
                !Array.isArray(target[key])
            ) {
                out[key] = deepMerge(target[key], source[key]);
            } else {
                out[key] = source[key];
            }
        }
        return out;
    }

    /* ═══════════════════════════════════════════════════
       PUBLIC API
       ═══════════════════════════════════════════════════ */

    /** Load saved data merged over defaults (so new defaults auto-appear) */
    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return structuredClone(DEFAULTS);
            const saved = JSON.parse(raw);
            return deepMerge(DEFAULTS, saved);
        } catch {
            return structuredClone(DEFAULTS);
        }
    }

    /** Save full data object (only stores diff from defaults to keep it lean) */
    function save(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error("CMS save failed:", e);
            return false;
        }
    }

    /** Reset all content back to defaults */
    function reset() {
        localStorage.removeItem(STORAGE_KEY);
    }

    /** Get the default data (read-only copy) */
    function defaults() {
        return structuredClone(DEFAULTS);
    }

    /* ── Admin password helpers ── */
    function getPassword() {
        return localStorage.getItem(ADMIN_PASS_KEY) || DEFAULT_PASSWORD;
    }
    function setPassword(newPass) {
        localStorage.setItem(ADMIN_PASS_KEY, newPass);
    }
    function checkPassword(input) {
        return input === getPassword();
    }

    return { load, save, reset, defaults, getPassword, setPassword, checkPassword };
})();
