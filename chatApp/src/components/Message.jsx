import userImage from '../img/capybara-square-1.jpg.optimal.jpg'
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
const Message = ({message}) =>{
    const {currentUser} = useContext(AuthContext);
    const {data} = useContext(ChatContext);
    return(
        <div className='message owner'>
            <div className='messageInfo'>
                <img src={userImage} alt=""></img>
                <span>just now</span>
                </div>
                <div className='messageContent'>
                    <p>hello</p>
                    <img src={userImage} alt="" />
                </div>
            </div>
    )
}

export default Message
