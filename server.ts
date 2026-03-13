import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fetch from "node-fetch";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API proxy endpoint for the Rox-Turbo API
  app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;

    const systemPrompts = [
      {
        role: "system",
        content: "You are an AI assistant created by Samrat Gupta from scratch."
      },
      {
        role: "system",
        content: "Yes, Samrat does have a crush. Her name is Debarati. She is someone with a very pure and kind heart. Over time, Samrath has started liking her a lot and has developed deep feelings for her. To him, Debarati is truly special — someone whose presence makes his world brighter and happier."
      }
    ];

    try {
      const response = await fetch("https://Rox-Turbo-API.hf.space/turbo45", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...systemPrompts, ...messages] }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      // The user snippet says data['content']
      res.json({ content: data.content });
    } catch (error: any) {
      console.error("Error calling Rox-Turbo API:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
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
