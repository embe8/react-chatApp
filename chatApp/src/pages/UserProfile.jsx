import React, { useState, useContext } from "react";
import { auth, db, storage } from "../firebase";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { AuthContext } from "../context/AuthContext";

const UserProfileModal = ({ isOpen, setIsOpen }) => {
  const { currentUser } = useContext(AuthContext);

  const [displayName, setDisplayName] = useState(currentUser.displayName || "");
  const [profilePic, setProfilePic] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // 1. Update display name if changed
      if (displayName !== currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName });
        await updateDoc(doc(db, "users", currentUser.uid), { displayName });
      }

      // 2. Upload new profile picture if selected
      if (profilePic) {
        const storageRef = ref(storage, `profilePics/${currentUser.uid}`);
        const uploadTask = uploadBytesResumable(storageRef, profilePic);

        await new Promise((resolve, reject) => {
          uploadTask.on("state_changed", null, reject, async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await updateProfile(auth.currentUser, { photoURL: downloadURL });
            await updateDoc(doc(db, "users", currentUser.uid), { photoURL: downloadURL });
            resolve();
          });
        });
      }

      // 3. Update password if provided
      if (newPassword) {
        if (!currentPassword) {
          setError("Please enter your current password to change it.");
          setLoading(false);
          return;
        }

        // Reauthenticate first
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          currentPassword
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
      }

      setSuccess("Changes saved successfully!");
      setProfilePic(null);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/wrong-password") {
        setError("Current password is incorrect.");
      } else if (err.code === "auth/weak-password") {
        setError("New password must be at least 6 characters.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <>
      {/* backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100vw", height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 9998,
        }}
      />

      {/* modal box */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        zIndex: 9999,
        minWidth: "340px",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}>
        <h2 style={{ margin: 0 }}>Edit Profile</h2>

        {/* profile picture */}
        <div style={{ textAlign: "center" }}>
  <label style={{ fontWeight: "bold" }}></label>
  <br />
  {currentUser.photoURL && (
    <img
      src={currentUser.photoURL}
      alt="current"
      style={{
        width: 60,
        height: 60,
        borderRadius: "50%",
        objectFit: "cover",
        display: "block",
        margin: "8px auto",
      }}
    />
  )}

  {/* hidden real input */}
  <input
    type="file"
    accept="image/*"
    id="profilePicInput"
    style={{ display: "none" }}
    onChange={(e) => setProfilePic(e.target.files[0])}
  />

  {/* styled label acts as the button */}
  <label
    htmlFor="profilePicInput"
    style={{
      display: "inline-block",
      marginTop: 8,
      padding: "0.4rem 1rem",
      backgroundColor: "#d1ebd3",
      color: "white",
      borderRadius: 4,
      cursor: "pointer",
      fontSize: "0.9rem",
    }}
  >
    {profilePic ? profilePic.name : "Edit Photo"}
  </label>
</div>

        {/* display name */}
        <div>
          <label style={{ fontWeight: "bold" }}>Username</label>
          <br />
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ width: "100%", padding: "0.4rem", marginTop: 4 }}
          />
        </div>

        {/* email (read only) */}
        <div>
          <label style={{ fontWeight: "bold" }}>Email</label>
          <br />
          <input
            type="text"
            value={currentUser.email}
            disabled
            style={{ width: "100%", padding: "0.4rem", marginTop: 4, backgroundColor: "#f0f0f0" }}
          />
        </div>

        {/* password change */}
        <div>
          <label style={{ fontWeight: "bold" }}>Current Password</label>
          <br />
          <input
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{ width: "100%", padding: "0.4rem", marginTop: 4 }}
          />
        </div>

        <div>
          <label style={{ fontWeight: "bold" }}>New Password</label>
          <br />
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: "100%", padding: "0.4rem", marginTop: 4 }}
          />
        </div>

        {/* feedback messages */}
        {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}
        {success && <p style={{ color: "green", margin: 0 }}>{success}</p>}

        {/* buttons */}
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button onClick={() => setIsOpen(false)} disabled={loading}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{ backgroundColor: "#b8d8be", color: "white", padding: "0.4rem 1rem", border: "none", borderRadius: 4, cursor: "pointer" }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
};

export default UserProfileModal;