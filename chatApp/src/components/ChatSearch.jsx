import React, {useState, useContext} from 'react'
import { AuthContext } from "../context/AuthContext";
import { collection, query, where, doc, setDoc, getDoc, getDocs, updateDoc, serverTimestamp} from "firebase/firestore";
import { db } from "../firebase";
import { text } from 'express';


const ChatSearch = () => {

    const [chats, setChats] = useState([]); //results
    const [searchTerm, setSearchTerm] = useState("");
    const {currentUser} = useContext(AuthContext);
    const [err, setErr] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (searchTerm.trim() == "") {
            return;
        }
        setErr(false);
        setSearched(true);
    

    try {
        // get all docs in userChats
        const userChatsSnap = await getDoc(doc(db, "userChats", currentUser.uid));

        if (!userChatsSnap.exists()) {
            setChats([]);
            return;
        } 

        const userChatsData = userChatsSnap.data();
        const chatIds = Object.keys(userChatsData);

        // fetch each chat and search messages
        const matchingMessages = []

        await Promise.all(
            chatIds.map(async(chatId) => {
                const chatSnap = await getDoc(doc(db, "chats", chatId));
                if (!chatSnap.exists()) return;

                const messages = chatSnap.data().message || [];
                const otherUser = userChatsData[chatId]?.userInfo?.displayName || "Unkown";
            
                messages.forEach((m) => {
                    const isInvolved =
                    m.senderId === currentUser.uid || 
                    userChatsData[chatId]?.userInfo?.uid == m.senderId;

                if (
                    isInvolved && 
                    m.text?.toLowerCase().includes(searchTerm.toLowerCase())
                ) {
                    matchingMessages.push({
                        ...m,
                        otherUser,
                        chatId,
                    });
                }
                });
            })
        );

        setChats(matchingMessages);
        if (matchingMessages.length == 0) setErr(true);

    } catch (error) {
        console.error(error);
        setErr(true);
    }
};

        const handleKey = (e) => {
            e.code = "Enter" && handleSearch();

        };

        return(
            <div className='chatSearch'>
                <div className='chatSearchForm'>
                    <input 
                type="text" 
                placeholder='searc messages...' 
                onKeyDown={handleKey} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                value={searchTerm}
                />
                <button onClick={handleSearch}>Search</button>
                    </div>

                    {/*Results*/}
                    {err && <p>No messages found.</p>}
                    {chats.map((m) => {
                        <div key={m.id} className='searchResult'>
                            <span className='searchResultUser'>
                                {m.senderId === currentUser.uid ? "You" : m.otherUser}:

                            </span>
                            <span className='searchResultText'>{m.text}</span>
                            </div>
                    })}
            </div>
        )
    };


export default ChatSearch