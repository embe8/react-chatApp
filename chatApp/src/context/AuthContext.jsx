import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {//checks if there's a user and sets the user if there is
      setCurrentUser(user);
      console.log(user);
    });
    //cleanup to avoid leaks
    return () => {
      unsub();
    };
  }, []);
//children is the App, App can reach current user
  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
