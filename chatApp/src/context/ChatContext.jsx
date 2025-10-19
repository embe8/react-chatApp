import {
    createContext,
    useContext,
    useReducer,
    useEffect,
  } from "react";
  import { AuthContext } from "./AuthContext";
  
  export const ChatContext = createContext();
  
  export const ChatContextProvider = ({ children }) => {
    const { currentUser } = useContext(AuthContext);
    const INITIAL_STATE = {
      chatId: "null",
      user: {},
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
        // Reset to initial state when a new user logs in
        dispatch({ type: "RESET_CHAT" });
      }
    }, [currentUser?.uid]);
  
    return (
      <ChatContext.Provider value={{ data: state, dispatch }}>
        {children}
      </ChatContext.Provider>
    );
  };
