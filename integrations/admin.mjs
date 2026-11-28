// Dev-only admin for the site: gallery, projects and posts.
//
// `npm run dev` -> http://localhost:4321/admin
// In `npm run build` this integration adds nothing: the /admin pages and the /__admin/*
// API exist only inside the dev server, so the published site never has them.
//
// The API edits files in the repo (never anything outside it), one module per section:
//   integrations/admin/galeria.mjs    src/assets/galeria/**, src/content/albuns/**, galeria*.json
//   integrations/admin/entrada.mjs    galeria-entrada/** (originals: "apagar" = system trash) + uploads
//   integrations/admin/projetos.mjs   src/data/projects.json
//   integrations/admin/escritos.mjs   src/content/escritos/*.md
// Nothing is committed: review with `git status` / `git diff` and commit yourself.
import { fileURLToPath } from "node:url";
import * as galeria from "./admin/galeria.mjs";
import * as entrada from "./admin/entrada.mjs";
import * as projetos from "./admin/projetos.mjs";
import * as escritos from "./admin/escritos.mjs";

const GET = { ...galeria.get, ...entrada.get, ...projetos.get, ...escritos.get };
const POST = { ...galeria.post, ...entrada.post, ...projetos.post, ...escritos.post };
const RAW_POST = { ...entrada.raw };   // body is a file, not JSON
const PAGES = {
  "/admin": "index", "/admin/galeria": "galeria", "/admin/galeria/entrada": "entrada",
  "/admin/galeria/imagens": "imagens",
  "/admin/projetos": "projetos", "/admin/escritos": "escritos",
};

export default function admin() {
  return {
    name: "site-admin",
    hooks: {
      "astro:config:setup": ({ command, injectRoute }) => {
        if (command !== "dev") return;
        for (const [pattern, page] of Object.entries(PAGES))
          injectRoute({ pattern, entrypoint: fileURLToPath(new URL(`../src/admin/${page}.astro`, import.meta.url)) });
      },
      "astro:server:setup": ({ server }) => {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith("/__admin/")) return next();
          try {
            if (!isLocal(req)) return send(res, 403, { error: "só a partir deste computador" });
            const url = new URL(req.url, "http://localhost");
            const name = url.pathname.replace("/__admin/", "");
            if (req.method === "GET" && GET[name]) {
              const out = await GET[name](url, res);
              if (!res.writableEnded) send(res, 200, out);
              return;
            }
            if (req.method === "POST") {
              // a custom header forces a CORS preflight, so other websites open in the
              // browser can't post to this API behind your back
              if (req.headers["x-admin"] !== "1") return send(res, 403, { error: "cabeçalho ausente" });
              if (RAW_POST[name]) return send(res, 200, await RAW_POST[name](url, req));
              if (!POST[name]) return send(res, 404, { error: "ação desconhecida" });
              return send(res, 200, (await POST[name](await json(req))) ?? { ok: true });
            }
            send(res, 404, { error: "não encontrado" });
          } catch (e) {
            send(res, 400, { error: e.message });
          }
        });
      },
    },
  };
}

function isLocal(req) {
  const ip = req.socket.remoteAddress ?? "";
  const host = (req.headers.host ?? "").replace(/:\d+$/, "");
  return ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(ip) && ["localhost", "127.0.0.1", "[::1]"].includes(host);
}
function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}
async function json(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}
