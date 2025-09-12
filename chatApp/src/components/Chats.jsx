import React from 'react'
import userImage from '../img/capybara-square-1.jpg.optimal.jpg'


const Chats = () =>{
    return(
        <div className="chats">
             <div className="userChat">
                <img src={userImage}></img>
                <div className="userChatInfo">
                    <span>Jane</span>
                    <p>hello</p>
                </div>
            </div>
        </div>
    )
}

export default Chats
