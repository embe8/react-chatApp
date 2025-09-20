import React, { useContext, useState } from "react";
import Img from "../img/img.png";
import Attach from "../img/attach.png";
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

const Input = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [file, setFile] = useState(null); // NEW: track regular file

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

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

      await updateDoc(doc(db, "userChats", currentUser.uid), {
        [data.chatId + ".lastMessage"]: { text: lastMessageText },
        [data.chatId + ".date"]: serverTimestamp(),
      });

      await updateDoc(doc(db, "userChats", data.user.uid), {
        [data.chatId + ".lastMessage"]: { text: lastMessageText },
        [data.chatId + ".date"]: serverTimestamp(),
      });

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
