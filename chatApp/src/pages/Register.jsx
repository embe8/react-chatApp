import React, { useState } from "react";
import Add from "../img/attach_image.png";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, query, doc, where, setDoc, getDocs } from "firebase/firestore";
import Capy from "../img/chat-logo.png";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setErr(false);
    setLoading(false);
    e.preventDefault();
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];

    // check if display name inputted already exists
      const qDisplayName = query(
        collection(db, "users"),
        where("displayName", "==", displayName)
      );
      // check if email address is already registered
      const qEmail = query(
        collection(db, "users"),
        where("email", "==", email)
      );


    try {

      // check query results, place each query in an array
      const [displayNameSnap, emailSnap] = await Promise.all([
          getDocs(qDisplayName),
          getDocs(qEmail),
      ]);
      //const querySnapshot = await getDocs(qDisplayName);


      // match found alert user that name exists
          if (!displayNameSnap.empty) 
          {
            setErr("Display name already taken");
            console.log("Display name taken"); // Display error message
            setLoading(false);
            return; // abort account creation
          }
          // match found alert user that email already registered
          if (!emailSnap.empty) 
          {
            setErr("Email already registered"); // Display error message
            console.log("Email taken");
            setLoading(false);
            return; // abort account creation
          }
          if(!file)
          {
            setErr("Add an avatar"); 
            setLoading(false);
            return;
          }
          else{ setLoading(true); }


      //Create user if no match found

      const res = await createUserWithEmailAndPassword(auth, email, password);

      //Create a unique image name
      const date = new Date().getTime();
      const storageRef = ref(storage, `${displayName + date}`);

      await uploadBytesResumable(storageRef, file).then(() => {
        getDownloadURL(storageRef).then(async (downloadURL) => {
          try {
            //Update profile
            await updateProfile(res.user, {
              displayName,
              photoURL: downloadURL,
            });
            //create user on firestore
            await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              displayName,
              email,
              photoURL: downloadURL,
            });

            //create empty user chats on firestore
            await setDoc(doc(db, "userChats", res.user.uid), {});
            navigate("/");
          } catch (err) {
            console.log(err);
            setErr("Something went wrong");
            setLoading(false);
          }
        });
      });
    } catch (err) {
      console.error(err)
      setLoading(false);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
      <img src={Capy} alt="Attached image" style={{ height: "200px", width: "200px", marginRight: "5px" }} />
        <span className="title">Register</span>
        <form onSubmit={handleSubmit}>
          <input required type="text" placeholder="display name" />
          <input required type="email" placeholder="email" />
          <input required type="password" placeholder="password" />
          <input style={{ display: "none" }} type="file" id="file" />
          <label htmlFor="file">
            <img src={Add} alt="" />
            <span>Add an avatar</span>
          </label>
          <button disabled={loading}>Sign up</button>
          {err && <span>{err}</span>}
          {loading && "Uploading and compressing the image please wait..."}
        </form>
        <p>
          Have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
