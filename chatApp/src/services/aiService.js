import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function fetchChats(chatId) {
    const docSnap = await getDoc(doc(db, "chats", chatId));
    if (!docSnap.exists()) return [];
    return docSnap.data().messages || [];
}

export async function sendToAI(messages) {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) throw new Error("AI request failed");
    const data = await res.json();
    return data.reply;
}

export async function summarizeChat(chatId, currentUser, otherUser) {
    const messages = await fetchHumanChat(chatId);
    const chatHistory = formatChats(messages, currentUser, otherUser);
  
    const res = await fetch("/api/ai/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatHistory }),
    });
    return (await res.json()).summary;
  }