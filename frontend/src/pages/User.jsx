import { useState, useEffect, useContext } from "react";
import styles from "./User.module.css";
import NavBar from "../components/NavBar";
import Notifications from "../components/Notifications";
import { AuthContext } from "../context/AuthContext";
import SetLocationButton from "../components/SetLocationButton"; 
import { useNavigate } from "react-router-dom";
import SuccessMessage from '../components/SuccessMessage'
function User({ showNotif, setShowNotif, setLoggedIn, showChat, setShowChat }) {
  const DEFAULT_AVATAR = "https://avatar.iran.liara.run/public/41";
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const { user, logoutUser } = useContext(AuthContext);
  const [looking, setLooking] = useState(user?.lookingForRoommate || true);
  const [isEditing, setIsEditing] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(user || {});
  const [previewPhoto, setPreviewPhoto] = useState(
    user?.photo || "https://avatar.iran.liara.run/public/41"
  );
  const { setUser } = useContext(AuthContext);
  useEffect(() => {
    if (user) {
      setUserData(user);
      setPreviewPhoto(user.photo || "https://avatar.iran.liara.run/public/41");
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      setUserData({ ...userData, [name]: numericValue });
    } else {
      setUserData({ ...userData, [name]: value });
    }
  };

  const handlePhotoChange = (e, isReset = false) => {
    if (isReset) {
      setPhotoFile(null);
      setPreviewPhoto(DEFAULT_AVATAR);
    } else {
      // Normal file upload case
      const file = e.target.files[0];
      if (file) {
        setPhotoFile(file);
        setPreviewPhoto(URL.createObjectURL(file)); 
      }
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const handleSave = async () => {
    try {

      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("age", userData.age);
      formData.append("gender", userData.gender?.toLowerCase());
      formData.append("location", userData.location);
      formData.append("dietaryPreference", userData.dietaryPreference);
      formData.append("occupation", userData.occupation);
      formData.append("longitude", userData.longitude);
      formData.append("latitude", userData.latitude);
      formData.append("lookingForRoommate", looking);
      formData.append("phone", userData.phone);

      if (previewPhoto === DEFAULT_AVATAR) {
        formData.append("photo", DEFAULT_AVATAR); 
      } else if (photoFile) {
        formData.append("photo", photoFile); 
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASEURL}/users/update`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        // alert("Profile updated successfully!");
        setSuccessMessage("Profile updated successfully!");
        setIsEditing(false);
        setUser(result.user);
      } else {
        // alert(result.message || "Something went wrong!");
        setError(result.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      // alert("Error updating profile.");
      setError("Error updating Profile");
    }
  };

  return (
    <>
      {error && (
              <SuccessMessage
                message={error}
                type="error"
                onClose={() => setError("")}
              />
            )}
            {successMessage && (
              <SuccessMessage
                message={successMessage}
                type="success"
                onClose={() => setSuccessMessage("")}
              />
            )}
      <NavBar
        setShowNotif={setShowNotif}
        setLoggedIn={setLoggedIn}
        showChat={showChat}
        setShowChat={setShowChat}
      />
      
      <div className={styles.userContainer}>
        <div className={styles.leftSection}>
          <div className={styles.image}>
            <img src={previewPhoto} alt="User Profile" />
            {isEditing && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className={styles.fileInput}
                  id="upload-photo"
                  style={{ display: "none" }}
                />
                <label htmlFor="upload-photo" className={styles.uploadButton}>
                  Upload Photo
                </label>
                <button
                  className={styles.resetButton}
                  onClick={() => handlePhotoChange(null, true)}
                >
                  Reset to Default
                </button>
              </>
            )}
          </div>
          <div className={styles.nameSection}>
            <label style={{ display: `${!isEditing ? "none" : ""}` }}>
              Name:
            </label>
            <input
              type="text"
              name="name"
              className={!isEditing ? styles.nameInput : styles.editingName}
              value={userData.name}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <button
            className={styles.button}
            style={{
              color: looking ? "green" : "gray",
              backgroundColor: looking ? "rgba(144, 238, 144, 0.2)" : "#f0f0f0",
            }}
            onClick={() => setLooking(!looking)}
            disabled={!isEditing}
          >
            {looking ? "Looking For Roommate" : "Not Looking"}
          </button>
          <button
            className={styles.button}
            style={{ background: "rgb(197, 68, 68)", color: "white" }}
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.inputGroup}>
            <label>Age</label>
            <input
              type="number"
              name="age"
              className={styles.inputField}
              value={userData.age}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Gender</label>
            <select
              name="gender"
              className={styles.inputField}
              value={userData.gender}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Location</label>
            <input
              type="text"
              name="location"
              className={styles.inputField}
              value={userData.location}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              className={styles.inputField}
              value={userData.email}
              onChange={handleChange}
              disabled={true}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              className={styles.inputField}
              value={userData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              pattern="[0-9]*"
              inputMode="numeric"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Dietary Preference</label>
            <select
              name="dietaryPreference"
              className={styles.inputField}
              value={userData.dietaryPreference}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="Any">Any</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
            </select>
          </div>

          <div className={styles.position}>
            <div className={styles.coordinates}>
              <div className={styles.inputGroup}>
                <label>Latitude</label>
                <input
                  type="text"
                  name="latitude"
                  className={styles.inputField}
                  value={userData.latitude}
                  onChange={handleChange} 
                  disabled={!isEditing} 
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Longitude</label>
                <input
                  type="text"
                  name="longitude"
                  className={styles.inputField}
                  value={userData.longitude}
                  onChange={handleChange} 
                  disabled={!isEditing} 
                />
              </div>
            </div>


            <SetLocationButton setUserData={setUserData} isEditing={isEditing}/>
          </div>

          <div className={styles.buttons}>
            <button
              className={styles.editButton}
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              <p>{isEditing ? "Save" : "Edit"}</p>
            </button>
            {isEditing && (
              <button
                className={styles.editButton}
                style={{
                  backgroundColor: "rgb(255,255,255,0.6",
                  color: "black",
                }}
              >
                <p
                  onClick={() => {
                    setUserData(user); 
                    setPreviewPhoto(user?.photo || DEFAULT_AVATAR); 
                    setIsEditing(false); 
                  }}
                >
                  Cancel
                </p>
              </button>
            )}
          </div>
        </div>
      </div>

      {showNotif && <Notifications />}
    </>
  );
}

export default User;
