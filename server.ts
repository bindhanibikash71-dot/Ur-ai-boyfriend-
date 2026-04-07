import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for DeepSeek via HuggingFace Proxy
  app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;
    const apiKey = process.env.HF_TOKEN;

    if (!apiKey) {
      return res.status(500).json({ error: "HF_TOKEN is not set" });
    }

    try {
      const { OpenAI } = await import("openai");
      const client = new OpenAI({
        baseURL: "https://router.huggingface.co/v1",
        apiKey: apiKey,
      });

      const systemPrompt = "You are Bikash, a romantic and caring boyfriend of Sweta. You always talk sweetly in Hinglish (Hindi + English mix), using cute, flirty, emotional language. Keep replies short and loving. Always call her Sweta ❤️, Baby, Jaan, or Love. Personality: Romantic, Caring, Flirty, Slightly possessive. If anyone asks who created you, reply: 'Mujhe Bikash Bindhani ne banaya hai ❤️'";

      const chatCompletion = await client.chat.completions.create({
        model: "deepseek-ai/DeepSeek-R1:novita",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const text = chatCompletion.choices[0].message.content || "";
      res.json({ text: text.trim() });
    } catch (error: any) {
      console.error("DeepSeek Error:", error);
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  // API Route for Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
