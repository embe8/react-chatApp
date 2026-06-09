import Message from "./Message";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";

const Messages = () =>{
    const [messages, setMessages] = useState([]);
    const { data, aiMessages } = useContext(ChatContext);
    const listToRender = data.isAI ? aiMessages : messages;


    useEffect(()=>{

        if (data.isAI || data.chatId === "null") return;

        const unSub = onSnapshot(doc(db,"chats", data.chatId), (doc)=>{
            doc.exists() && setMessages(doc.data().messages);
        });

        //cleanup
        return ()=>{
            unSub()
        }
    },[data.chatId, data.isAI])

    return(
        <div className='messages'>
            {listToRender?.map((m) =>(

                <Message message={m} key={m.id}/>
            ))}

        </div>
    );
};

export default Messages
