import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PostProperty.module.css";
import { AuthContext } from "../context/AuthContext";
import { RoomsContext } from "../context/RoomsContext"; // ✅ Import RoomsContext
import NavBar from "../components/NavBar";
import LocationPicker from "../components/LocationPicker";
import {
  faXmark,
  faLocationDot,
  faMapLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SuccessMessage from "../components/SuccessMessage"


function PostProperty() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { setRooms, setLoading, setUserRooms } = useContext(RoomsContext);
  const [showMap, setShowMap] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    price: "",
    availability: true,
    photos: [],
  });
  const fetchRooms = async () => {
    try {
      const latitude = user?.latitude || 21.2489992; // Default latitude
      const longitude = user?.longitude || 81.6098999; // Default longitude

      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_BASEURL
        }/rooms?latitude=${latitude}&longitude=${longitude}&userId=${user._id}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) {
        setRooms(data.rooms);
      } else {
        console.error("Error fetching rooms:", data.message);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    if (name === "price" && value < 0) {
      newValue = 0;
    }

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + formData.photos.length > 4) {
      alert("You can upload a maximum of 4 photos.");
      return;
    }

    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
    }));
  };

  // Remove an image from preview
  const handleRemovePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to retrieve location. Please enable location access.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleLocationConfirm = (selectedPosition) => {
    setFormData((prev) => ({
      ...prev,
      latitude: selectedPosition.lat,
      longitude: selectedPosition.lng,
    }));
    setShowMap(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to post a property.");
      return;
    }

    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("latitude", formData.latitude);
      formDataToSend.append("longitude", formData.longitude);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("availability", formData.availability);
      formDataToSend.append("owner", user._id);

      formData.photos.forEach(({ file }) => {
        formDataToSend.append("photos", file);
      });

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASEURL}/rooms`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formDataToSend,
        }
      );

      const data = await response.json();
      

      if (!response.ok) {
        throw new Error(data.message || "Failed to post property");
      }

      
      // ✅ Update state and trigger re-fetch
      setRooms((prevRooms) => [{ ...data.room, owner: user }, ...prevRooms]);
      setUserRooms((prevRooms) => [
        { ...data.room, owner: user },
        ...prevRooms,
      ]);
      
      setSuccessMessage("Property Posted Successfully!");
      await fetchRooms(); 
      navigate("/room");
    } catch (error) {
      console.error("Error posting property:", error.message);
      setErrorMessage(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      {errorMessage && (
        <SuccessMessage
          message={errorMessage}
          type="error"
          onClose={() => setErrorMessage("")}
        />
      )}
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage("")}
        />
      )}
      <div className={styles.container}>
        <h1>Post Property</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>Title</label>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <label>Location</label>
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            required
          />

          <label>Price</label>
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            required
          />

          <div className={styles.position}>
            <div className={styles.posInput}>
              <label>Latitude</label>
              <input
                className={styles.positionInput}
                type="text"
                value={formData.latitude}
                readOnly
              />
            </div>

            <div className={styles.posInput}>
              <label>Longitude</label>
              <input
                className={styles.positionInput}
                type="text"
                value={formData.longitude}
                readOnly
              />
            </div>

            <div className={styles.buttons}>
              <button
                type="button"
                onClick={handleSetLocation}
                className={styles.button}
              >
                <FontAwesomeIcon icon={faLocationDot} />
              </button>
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className={styles.button}
              >
                <FontAwesomeIcon icon={faMapLocationDot} />
              </button>
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            multiple
            id="upload"
            onChange={handleFileChange}
            className={styles.fileInput}
          />
          <label htmlFor="upload" className={styles.uploadButton}>
            Upload Photos
          </label>

          <div className={styles.photoPreviewContainer}>
            {formData.photos.map((photo, index) => (
              <div key={index} className={styles.photoPreview}>
                <img src={photo.preview} alt={`Preview ${index}`} />
                <button
                  type="button"
                  className={styles.removePhotoButton}
                  onClick={() => handleRemovePhoto(index)}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            ))}
          </div>

          {showMap && (
            <LocationPicker
              onSelectLocation={handleLocationConfirm}
              onClose={() => setShowMap(false)}
            />
          )}

          <button className={styles.post} type="submit">
            Post Property
          </button>
        </form>
      </div>
    </>
  );
}

export default PostProperty;
