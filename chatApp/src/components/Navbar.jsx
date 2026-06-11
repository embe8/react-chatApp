import React, { useContext, useState } from 'react'
import {signOut} from "firebase/auth"
import { auth } from '../firebase'
import { AuthContext } from '../context/AuthContext'
import { Image } from '@imagekit/react';
import { IMAGEKIT_CONFIG, extractFirebasePath, IMAGE_TRANSFORMATIONS } from '../config/imagekit';
import UserProfileModal from '../pages/UserProfile';
const Navbar = () => {
  const {currentUser} = useContext(AuthContext)
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='navbar'>
      <span className="logo">CapyChat</span>
      <div className="user">
              <Image
                    urlEndpoint={IMAGEKIT_CONFIG.urlEndpoint}
                    src={extractFirebasePath(currentUser.photoURL)}
                    transformation={[IMAGE_TRANSFORMATIONS.avatar]}
                    alt="Chat image"
                    style={{ cursor: "pointer" }}
                    onClick={() => {console.log("icon clicked");
                      setIsOpen(true)}}
                    
                  />        
            <UserProfileModal isOpen={isOpen} setIsOpen={setIsOpen} />
          <span>{currentUser.displayName}</span>
        <button onClick={()=>signOut(auth)}>logout</button>
      </div>
    </div>
  )
}

export default Navbar
