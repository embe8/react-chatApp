import React, { useContext, useEffect, useRef, useState} from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import Attach from "../img/attach_file2.png";
import { Image } from '@imagekit/react';
import { IMAGEKIT_CONFIG, extractFirebasePath, IMAGE_TRANSFORMATIONS } from '../config/imagekit';

function formatTimestamp(timestamp) {
  if (!timestamp) return "";

  const messageDate = timestamp.toDate();
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

    const [enlargedImage, setEnlargedImage] = useState(null);

    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: "smooth"});
    }, [message]);

    return(
        <div 
        ref={ref}
        className={`message ${message.senderId === currentUser.uid && "owner"}`}>
            <div className='messageInfo'>
                <Image
                  urlEndpoint={IMAGEKIT_CONFIG.urlEndpoint}
                  src={
                    extractFirebasePath(
                      (message.senderId === currentUser.uid
                        ? currentUser.photoURL
                        : data.user.photoURL) || 'img/capybara-square-1.jpg'
                    )
                  }
                  transformation={[IMAGE_TRANSFORMATIONS.avatar]}
                  alt="User avatar"
                />
                <span>{formatTimestamp(message?.date)}</span>
            </div>
            <div className='messageContent'>
                {message.text && <p>{message.text}</p>}
                {message.img && (
                  <Image
                    urlEndpoint={IMAGEKIT_CONFIG.urlEndpoint}
                    src={extractFirebasePath(message.img)}
                    transformation={[IMAGE_TRANSFORMATIONS.messageImage]}
                    alt="Chat image"
                    className="clickableImage"
                    onClick={() => setEnlargedImage(extractFirebasePath(message.img))}// click handler to enlarge image
                  />
                )}

                {/* Attached file */}
                {message.file && (
                  <div className="fileAttachment">
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
                      <Image
                        urlEndpoint={IMAGEKIT_CONFIG.urlEndpoint}
                        src={extractFirebasePath(message.file.url)}
                        transformation={[IMAGE_TRANSFORMATIONS.filePreview]}
                        alt={message.file.name}
                        className="fileImagePreview"
                      />
                    )}

                  </div>
                )}
            </div>
                         {enlargedImage && (
                      <div
                      className="imageModal"
                      onClick={() => setEnlargedImage(null)}
                      >
                        <img src={enlargedImage} alt="Enlarged image" />
                      </div>
                    )}
        </div>
    );
};

export default Message;
