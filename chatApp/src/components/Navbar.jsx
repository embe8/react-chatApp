import React, { useContext } from 'react'
import {signOut} from "firebase/auth"
import { auth } from '../firebase'
import { AuthContext } from '../context/AuthContext'
import { Image } from '@imagekit/react';
import { IMAGEKIT_CONFIG, extractFirebasePath, IMAGE_TRANSFORMATIONS } from '../config/imagekit';

const Navbar = () => {
  const {currentUser} = useContext(AuthContext)

  return (
    <div className='navbar'>
      <span className="logo">CapyChat</span>
      <div className="user">
              <Image
                    urlEndpoint={IMAGEKIT_CONFIG.urlEndpoint}
                    src={extractFirebasePath(currentUser.photoURL)}
                    transformation={[IMAGE_TRANSFORMATIONS.avatar]}
                    alt="Chat image"
                  />        
          <span>{currentUser.displayName}</span>
        <button onClick={()=>signOut(auth)}>logout</button>
      </div>
    </div>
  )
}

export default Navbar
