import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";



const Reset = () => {
  const [err, setErr] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const auth = getAuth();

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      setErr(false);
    } catch (err) {
      setErr(true);
      setSuccess(false);
    }
  };
  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">   {/*for logo image:} <span role="img" aria-label="file">
                  <img src={Capy} alt="Attached image" style={{ height: "60px", width: "60px", marginRight: "5px" }} />
                </span>*/}CapyChat</span>
        <span className="title">Reset Password</span>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="email" />
          <button>Send email</button>
          {success && <span>Email sent!</span>}
          {err && <span>Something went wrong</span>}
        </form>
        <p><Link to="/login">Back to login</Link></p>
      </div>
    </div>
  );
};

export default Reset;
