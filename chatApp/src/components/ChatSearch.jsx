import { useState } from 'react';
import { AuthContext } from "../context/AuthContext";
import { collection, query, where, doc, setDoc, getDoc, getDocs, updateDoc, serverTimestamp} from "firebase/firestore";
import { db } from "../firebase";
import { text } from 'express';


const chatSearch = () => {

    const [chats, setChats] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const {currentUser} = useContext(AuthContext);
    const [err, setErr] = useState(false);

    const handleSearch = async () => {
        const q = query(
            collection(db, "chats"),
            where("text", ">=", searchTerm)
        )
    };

    try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            setChats(null);
            setErr(true);
        } else {
            querySnapshot.forEach((doc) => {
                setChats(doc.data);
                
            }); setErr(false);
        }
        } catch(err) {
            setErr(true);
        }

        const handleKey = (e) => {
            e.code = "Enter" && handleSearch();

        };

        return(
            <div className='chatSearch'><div className='chatSearchForm'>
                    <input 
           type="text" 
           placeholder='search...' 
           onKeyDown={handleKey} 
           onChange={(e) => setChats(e.target.value)} 
           value={text}/>
            </div>

            </div>

        )
    };


export default chatSearch