const FPT_API_KEY = "PASTE_API_KEY_HERE";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body = "";
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    return res.status(400).json({ error: "Body không hợp lệ" });
  }

  const { text, voice } = body;
  if (!text) return res.status(400).json({ error: "Thiếu nội dung" });

  try {
    const fptRes = await fetch("https://api.fpt.ai/hmi/tts/v5", {
      method: "POST",
      headers: {
        "api-key": FPT_API_KEY,
        "voice": voice || "lannhi",
        "speed": "",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: text,
    });

    const data = await fptRes.json();
    if (!data.async) return res.status(500).json({ error: data.message || "FPT.AI không trả về link audio" });

    return res.status(200).json({ audioUrl: data.async });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
