import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔒 API Key 只在这里
const API_KEY = process.env.API_KEY;

app.post("/api/chat", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.chatanywhere.tech/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: req.body.messages
        })
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Proxy failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API proxy running at port ${PORT}`);
});
