import React from 'react'
import userImage from '../img/capybara-square-1.jpg.optimal.jpg'

const Message = () =>{
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
