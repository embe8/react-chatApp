import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    // Gemini uses "model" and "parts" instead of "role/content"
    const geminiMessages = messages.map((m) => ({
      role: m.senderId === "capychat-ai" ? "model" : "user",
      parts: [{ text: m.text }],
    }));



    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

app.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT}`);
});

app.post("api/ai/ask-chats", async (req, res) => {
  try {
    const { question, currentUserId} = req.body;

    // Fetch user chats to get all chatIds and user names
    const userChatsSnap = await adminDb
      .collection("userChats")
      .doc(currentUserId)
      .get();

      if(!userChatsSnap.exists) {
        return res.json({ reply: "No chats found."});
      }

      const userChatsData = userChatsSnap.data();
      const chatIds = Object.keys(userChatsData);

      // fetch all messages for each chat
      const allChats = await Promise.all(
        chatIds.map(async (chatId) => {
        const chatSnap = await adminDb
          .collection("chats")
          .doc(chatId)
          .get();
      return {
        otherUser: userChatsData[chatId]?.userInfo?.displayName || "Unkown",
        messages: chatSnap.exists ? chatSnap.data().messages || [] : [],
      }

  })
);

// format chats as plain text
const context = allChats.map(chat => {
  const msgs = formatMessages(chat.messages);
  return `--- Chat with ${chat.otherUser} ---\n${msgs}`;
    }).join("\n\n");

    // send to gemini with context
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: "You are CapyChat AI. You have access to the user's chat history. Answer questions about their conversations." }]
          },
          contents: [{
            role: "user",
            parts: [{ text: `Here are all my chats:\n\n${context}}]\n\nQuestion: ${question}` }]
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
    res.status(500).json({ error: "AI request failed" });
  }
}); 