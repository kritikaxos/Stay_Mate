import { useState, useContext, useEffect } from "react";
import styles from "./SignUp.module.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import SetLocationButton from "../components/SetLocationButton";
import SuccessMessage from "../components/SuccessMessage";
import Loading from "../components/Loading";

function SignUp() {
  const navigate = useNavigate();
  const { setLoggedIn, setUser } = useContext(AuthContext);
  const [userCoordinates, setUserCoordinates] = useState({
    latitude: 28.7041,
    longitude: 77.1025,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    age: "",
    gender: "male",
    occupation: "",
    dietaryPreference: "other",
    location: "",
    latitude: "",
    longitude: "",
    lookingForRoommate: false,
    photo: "https://avatar.iran.liara.run/public/41",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASEURL}/users/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      setLoggedIn(true);
      setUser(data.data.user);
      setSuccessMessage("Signup successful!");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.log("Error signing up:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserCoordinates = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoordinates({ latitude, longitude });
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location: ", error);
          alert("Unable to retrieve your location. Please try again.");
          setLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserCoordinates();
  }, []);

  return (
    <>
      {loading && <Loading />}
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

      <div className={styles.userContainer}>
        <form className={styles.rightSection} onSubmit={handleSubmit}>
          <div className={styles.image}>
            <img src={formData.photo} alt="Profile" />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.fileInput}
            id="upload-photo"
          />
          <label htmlFor="upload-photo" className={styles.uploadButton}>
            Upload Photo
          </label>

          <div className={styles.inputGroup}>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Confirm Password</label>
            <input
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Gender</label>
            <select
              name="gender"
              className={styles.inputField}
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label>Occupation</label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Dietary Preference</label>
            <select
              name="dietaryPreference"
              value={formData.dietaryPreference}
              onChange={handleChange}
              className={styles.inputField}
            >
              <option value="vegetarian">Vegetarian</option>
              <option value="non-vegetarian">Non-Vegetarian</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Latitude</label>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Longitude</label>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
            />
          </div>

          <SetLocationButton
            setUserData={setFormData}
            isEditing={true}
            defLat={userCoordinates.latitude}
            defLong={userCoordinates.longitude}
            setLoading={setLoading}
          />

          <div className={styles.roommate}>
            <h3>Looking for Roommate?</h3>
            <input
              type="checkbox"
              name="lookingForRoommate"
              checked={formData.lookingForRoommate}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className={styles.submit} disabled={loading}>
            Sign Up
          </button>
        </form>
        <button
          type="button"
          className={styles.cancel}
          onClick={() => {
            setLoggedIn(false);
            navigate("/");
          }}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </>
  );
}

export default SignUp;
