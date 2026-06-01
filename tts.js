const FPT_API_KEY = "AsRUOROjeyHusjPL7yZqKe2psiepmU6p";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { text, voice } = req.body;
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
    if (!data.async) return res.status(500).json({ error: data.message || "FPT.AI lỗi" });

    // Chờ FPT.AI xử lý xong rồi tải audio về
    await new Promise(r => setTimeout(r, 2500));

    const audioRes = await fetch(data.async);
    if (!audioRes.ok) return res.status(500).json({ error: "Không tải được audio" });

    const audioBuffer = await audioRes.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-cache");
    return res.status(200).send(Buffer.from(audioBuffer));

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
