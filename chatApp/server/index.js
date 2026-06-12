import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "./serviceAccountKey.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();
const PORT = 3001;

initializeApp({
  credential: cert(serviceAccount),
});

const adminDb = getFirestore();

app.use(cors());
app.use(express.json());

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const geminiMessages = messages.map((m) => ({
      role: m.senderId === "capychat-ai" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: "You are CapyChat AI, a friendly helpful assistant in a chat app." }]
          },
          contents: geminiMessages,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(500).json({ error: data.error?.message || "Gemini error" });
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI request failed" });
  }
});

app.post("/api/ai/ask-chats", async (req, res) => {
  try {
    const { question, currentUserId } = req.body;

    const userChatsSnap = await adminDb
      .collection("userChats")
      .doc(currentUserId)
      .get();

    if (!userChatsSnap.exists) {
      return res.json({ reply: "No chats found." });
    }

    const userChatsData = userChatsSnap.data();
    const chatIds = Object.keys(userChatsData);

    const allChats = await Promise.all(
      chatIds.map(async (chatId) => {
        const chatSnap = await adminDb
          .collection("chats")
          .doc(chatId)
          .get();
        return {
          otherUser: userChatsData[chatId]?.userInfo?.displayName || "Unknown",
          messages: chatSnap.exists ? chatSnap.data().messages || [] : [],
        };
      })
    );

    const context = allChats.map(chat => {
      const msgs = chat.messages
        .map(m => `${m.senderId === currentUserId ? "Me" : chat.otherUser}: ${m.text}`)
        .join("\n");
      return `--- Chat with ${chat.otherUser} ---\n${msgs}`;
    }).join("\n\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: "You are CapyChat AI. You have access to the user's chat history. Answer questions about their conversations." }]
          },
          contents: [{
            role: "user",
            parts: [{ text: `Here are all my chats:\n\n${context}\n\nQuestion: ${question}` }]
          }]
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(500).json({ error: data.error?.message || "Gemini error" });
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to query chats" });
  }
});

// Serve the React build files
app.use(express.static(path.join(__dirname, "../dist")));

// For any non-API route, send back index.html (so React Router works)
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT}`);
});