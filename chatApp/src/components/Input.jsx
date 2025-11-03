import React, { useContext, useState } from "react";
import Img from "../img/attach_image.png";
import Attach from "../img/attach_file.png";
import Emoji from "../img/emoji_icon.png"
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import {
  arrayUnion,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import EmojiPicker from "emoji-picker-react";
import { useEffect } from "react";



const Input = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [file, setFile] = useState(null); // NEW: track regular file
  const [showPicker, setShowPicker] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setShowPicker(false);
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, []);


  const handleSend = async () => {
    const messageId = uuid();
    const messageObj = {
      id: messageId,
      text,
      senderId: currentUser.uid,
      date: Timestamp.now(),
    };

    const uploadFileToStorage = async (uploadFile) => {
      const storageRef = ref(storage, uuid());
      const uploadTask = uploadBytesResumable(storageRef, uploadFile);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (error) => reject(error),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    };

    try {
      if (img) {
        const imgURL = await uploadFileToStorage(img);
        messageObj.img = imgURL;
      } else if (file) {
        const fileURL = await uploadFileToStorage(file);
        messageObj.file = {
          url: fileURL,
          name: file.name,
          type: file.type,
        };
      }

      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion(messageObj),
      });

      // Update last message text
      const lastMessageText = text || (img ? "📷 Image" : "📎 File");

      // Only update userChats if the user is not chatting with themselves
      if (data.user.uid !== currentUser.uid) {
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [data.chatId + ".lastMessage"]: { text: lastMessageText },
          [data.chatId + ".date"]: serverTimestamp(),
          [data.chatId + ".userInfo"]: {
            uid: data.user.uid,
            displayName: data.user.displayName,
            photoURL: data.user.photoURL
          }
        });

        await updateDoc(doc(db, "userChats", data.user.uid), {
          [data.chatId + ".lastMessage"]: { text: lastMessageText },
          [data.chatId + ".date"]: serverTimestamp(),
          [data.chatId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL
          }
        });
      }

      // Reset inputs
      setText("");
      setImg(null);
      setFile(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="input">
      <input
        type="text"
        placeholder="Type something..."
        onChange={(e) => setText(e.target.value)}
        value={text}
      />
      <div className="send">
      
  {showPicker && (
    <div style={{ position: 'relative', bottom: '60px', right: '0' , zIndex: 10}}>
      <EmojiPicker
        onEmojiClick={(emojiObject, event) =>
          setText(prev => prev + emojiObject.emoji)
        }
      />
    </div>
  )}

        {/* Emoji Input (Emoji Mart/Emoji Picker)) */}
        <input
          type="emoji"
          id="emoji"
          style={{ display: "none" }}
          onClick={() => setShowPicker(!showPicker)}
        />
        <label htmlFor="emoji">
          <img src={Emoji} alt="Add emoji" />
        </label>

        {/* File Input (for non-image files) */}
        <input
          type="file"
          id="file"
          style={{ display: "none" }}
          onChange={(e) => setFile(e.target.files[0])}
        />
        <label htmlFor="file">
          <img src={Attach} alt="Attach file" />
        </label>

        {/* Image Input */}
        <input
          type="file"
          id="image"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => setImg(e.target.files[0])}
        />
        <label htmlFor="image">
          <img src={Img} alt="Send image" />
        </label>

        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Input;
