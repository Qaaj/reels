const Koa = require("koa");
const Router = require("@koa/router");
const serve = require("koa-static");
const views = require("koa-views");
const path = require("path");
const fs = require("fs");

const app = new Koa();
const router = new Router();

const DATA_DIR = path.resolve(__dirname, "data");

// 1 — static files FIRST
app.use(serve(path.resolve(__dirname, "public"), { index: false }));
app.use(serve(path.resolve(__dirname, "data"), { index: false }));

// 2 — views
app.use(views(path.resolve(__dirname, "views"), { extension: "pug" }));

// 3 — router
app.use(router.routes());
app.use(router.allowedMethods());

function loadReels() {
    const files = fs.readdirSync(DATA_DIR);
    const groups = new Map();

    for (const file of files) {
        const m = file.match(/^(.*?)(?:_(\d+))?\.(jpg|jpeg|png|webp|mp4|json|txt)$/i);
        if (!m) continue;

        const base = m[1];
        const idx = m[2] ? parseInt(m[2]) : null;
        const ext = m[3].toLowerCase();

        if (!groups.has(base)) {
            groups.set(base, {
                id: base,
                thumb: null,
                caption: "",
                metadata: {},
                media: []   // each item = { id, jpg, mp4 }
            });
        }

        const entry = groups.get(base);

        // ----- Assign homepage thumbnail -----
        if (!idx && ["jpg", "jpeg", "png", "webp"].includes(ext)) {
            entry.thumb = `/${file}`;
        }

        // ----- Load caption -----
        if (ext === "txt" && !idx) {
            entry.caption = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
        }

        // ----- Load metadata -----
        if (ext === "json" && !idx) {
            try {
                entry.metadata = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
            } catch { }
        }

        // ----- Build media list -----
        if (["jpg", "jpeg", "png", "webp", "mp4"].includes(ext)) {
            const id = idx ? `${base}_${idx}` : base;
            let item = entry.media.find(m => m.id === id);
            if (!item) {
                item = { id, jpg: null, mp4: null };
                entry.media.push(item);
            }
            if (ext === "mp4") item.mp4 = `/${file}`;
            else item.jpg = `/${file}`;
        }
    }

    // Ensure homepage thumbnail exists
    for (const entry of groups.values()) {
        if (!entry.thumb) {
            const first = entry.media.find(m => m.jpg);
            entry.thumb = first ? first.jpg : null;
        }
        entry.media.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    }

    return Array.from(groups.values());
}
router.get("/", async (ctx) => {
    console.log("Rendering page + loading reels");
    const reels = loadReels();
    await ctx.render("index", { reels });
});

// MUST be after router definition
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
    console.log("Running at http://localhost:3000");
    console.log("DATA_DIR =", DATA_DIR);
    console.log("Example JPG =", fs.readdirSync(DATA_DIR).find(f => f.endsWith(".jpg")));
});