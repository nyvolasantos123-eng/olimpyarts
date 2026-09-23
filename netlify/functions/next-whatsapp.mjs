import { getStore } from "@netlify/blobs";

const CONTACTS = [
  { name: "Leandro", number: "5511954486713" },
  { name: "Santos", number: "5511951422087" },
];

const STORE_NAME = "olimpy-routing";
const KEY = "whatsapp-round-robin";

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}

export default async (req) => {
  if (req.method === "OPTIONS") return json({ ok: true });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const store = getStore({ name: STORE_NAME, consistency: "strong" });

  // Tenta algumas vezes para resolver chamadas simultâneas com escrita condicional por ETag.
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const current = await store.getWithMetadata(KEY, { type: "json", consistency: "strong" });

    if (!current) {
      // Primeiro atendimento sempre vai para o primeiro contato (Leandro).
      const selectedIndex = 0;
      const nextIndex = 1;
      const created = await store.setJSON(KEY, { nextIndex, updatedAt: Date.now() }, { onlyIfNew: true });
      if (created.modified) return json({ ok: true, ...CONTACTS[selectedIndex], mode: "global" });
      continue;
    }

    const selectedIndex = Number(current.data?.nextIndex ?? 0) % CONTACTS.length;
    const nextIndex = (selectedIndex + 1) % CONTACTS.length;
    const updated = await store.setJSON(
      KEY,
      { nextIndex, updatedAt: Date.now() },
      { onlyIfMatch: current.etag },
    );

    if (updated.modified) return json({ ok: true, ...CONTACTS[selectedIndex], mode: "global" });
  }

  return json({ error: "Could not reserve next contact" }, 503);
};

export const config = {
  path: "/api/next-whatsapp",
};
