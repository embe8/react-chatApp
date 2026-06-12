import {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useState,
  } from "react";
  import { AuthContext } from "./AuthContext";
  import { CAPYCHAT_AI } from "../config/aiUser";


  
  export const ChatContext = createContext();


  
  export const ChatContextProvider = ({ children }) => {
    const { currentUser } = useContext(AuthContext);
    const [aiMessages, setAiMessages] = useState([
      {
        id: "welcome",
        text: "Hi! I'm CapyChat AI. How can I help?",
        senderId: "capychat-ai",
  
      },
    ]);
    const INITIAL_STATE = {
      chatId: "null",
      user: {},
      isAI: false,
    };

  
    const chatReducer = (state, action) => {
      switch (action.type) {
        case "CHANGE_USER":
          return {
            user: action.payload,
            chatId:
              currentUser.uid > action.payload.uid
                ? currentUser.uid + action.payload.uid
                : action.payload.uid + currentUser.uid,
                isAI: false,
          };
        case "CHANGE_AI":
          return {
            user: CAPYCHAT_AI,
            chatId: `ai_${currentUser.uid}`,
            isAI: true,
          };
        case "RESET_CHAT":
          return INITIAL_STATE;
        default:
          return state;
      }
    };
  
    const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

    // Reset chat context when user changes
    useEffect(() => {
      if (currentUser) {
        dispatch({ type: "RESET_CHAT" });
        setAiMessages([
          {
            id: "welcome",
            text: "Hi! I'm CapyChat AI. How can I help?",
            senderId: "capychat-ai",
          },
        ]);
      }
    }, [currentUser?.uid]);
  
    return (
      <ChatContext.Provider value={{ data: state, dispatch, aiMessages, setAiMessages }}>
        {children}
      </ChatContext.Provider>
    );
  };
