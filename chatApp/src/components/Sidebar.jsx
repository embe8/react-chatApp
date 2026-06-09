import React from 'react'
import Navbar from './Navbar'
import Search from './Search';
import Chats from './Chats';
import CapyLogo from "../img/chat-logo.png";
import { ChatContext } from "../context/ChatContext";
import { useContext, useState } from "react";



const Sidebar = () =>{
    const { dispatch } = useContext(ChatContext);
    const handleSelectAI = () => {
        dispatch({ type: "CHANGE_AI" });
    }
    return(
        <div className="sidebar">
            <Navbar/>
            <Search/>
            <div className="userChat aiChat" onClick={() => handleSelectAI()}>
                <img src={CapyLogo} alt="CapyChat AI" />
                <div className="userChatInfo">
                    <span>CapyChat AI</span>
                    <p>Ask me anything</p>
                </div>
            </div>
            <Chats/>
            </div>
    );
};

export default Sidebar
