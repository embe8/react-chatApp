import userImage from '../img/capybara-square-1.jpg.optimal.jpg'
import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import Attach from "../img/attach_file2.png";


function formatTimestamp(timestamp) {
  if (!timestamp) return "";

  const messageDate = timestamp.toDate(); // Firestore Timestamp -> JS Date
  const now = new Date();
  const diffMs = now - messageDate;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const optionsTime = {
    hour: "numeric",
    minute: "2-digit",
  };

  if (diffMinutes < 3) {
    return "just now";
  } else if (diffHours < 24 && messageDate.toDateString() === now.toDateString()) {
    return `Today at ${messageDate.toLocaleTimeString([], optionsTime)}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${messageDate.toLocaleTimeString([], optionsTime)}`;
  } else {
    const optionsDateTime = {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    };
    return messageDate.toLocaleString([], optionsDateTime);
  }
}

const Message = ({message}) =>{
    const {currentUser} = useContext(AuthContext);
    const {data} = useContext(ChatContext);

    const ref = useRef();

    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: "smooth"});
    }, [message]);
    return(
        <div 
        ref={ref}
        className={`message ${message.senderId === currentUser.uid && "owner"}`}>
            <div className='messageInfo'>
                <img src={message.senderId === currentUser.uid ? currentUser.photoURL : data.user.photoURL} alt=""></img>
                <span>{formatTimestamp(message?.date)}</span>
                </div>
                <div className='messageContent'>
                    {message.text && <p>{message.text}</p>}
                    {message.img && <img src={message.img} alt="" />}
                     {/* Attached file (inside bubble) */}
  {message.file && (
    <div className="fileAttachment">
      {/* Show file name with 📎 icon */}
      <a
        href={message.file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="fileName"
      >
       <span role="img" aria-label="file">
          <img src={Attach} alt="Attached image" style={{ height: "20px", width: "20px", marginRight: "5px" }} />
          <span style={{ color: "#5c413f" }}>{message.file.name}</span>
        </span>
      </a>

      {/* Show image preview if it's an image file */}
      {message.file.type.startsWith("image/") && (
        <img
          src={message.file.url}
          alt={message.file.name}
          className="fileImagePreview"
        />
      )}
    </div>
  )}
</div>
            </div>
    );
};

export default Message;

