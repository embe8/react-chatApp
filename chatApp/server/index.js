import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Turn message objects into plain text for the AI
function formatMessagesForAI(messages) {
  return messages
    .map((m) => {
      const name = m.senderId === "capychat-ai" ? "CapyChat AI" : "User";
      return `${name}: ${m.text}`;
    })
    .join("\n");
}

// POST /api/ai/chat
// Body: { messages: [{ id, text, senderId }, ...] }
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array required" });
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.senderId !== "capychat-ai");
    const chatHistory = formatMessagesForAI(messages);

    const reply = lastUserMessage
      ? `You said: "${lastUserMessage.text}".`
      : "Hi! I'm CapyChat AI. Ask me anything.";

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT}`);
});