import { useState } from "react";
import LocationPicker from "./LocationPicker";
import styles from "./SetLocationButton.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faMapLocationDot,
} from "@fortawesome/free-solid-svg-icons";

const SetLocationButton = ({
  setUserData,
  isEditing,
  defLat = 20,
  defLong = 70,
}) => {
  const [showMap, setShowMap] = useState(false);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserData((prev) => ({
            ...prev,
            latitude,
            longitude,
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

  const handleSelectLocation = () => {
    setShowMap(true);
  };

  const handleLocationConfirm = (selectedPosition) => {
    setUserData((prev) => ({
      ...prev,
      latitude: selectedPosition.lat,
      longitude: selectedPosition.lng,
    }));
    setShowMap(false);
  };

  return (
    isEditing && (
      <div className={styles.buttonContainer}>
        <button
          className={styles.button}
          onClick={handleUseMyLocation}
          disabled={!isEditing}
          type="button"
        >
          <FontAwesomeIcon icon={faLocationDot} />
        </button>
        <button
          className={styles.button}
          onClick={handleSelectLocation}
          disabled={!isEditing}
          type="button"
        >
          <FontAwesomeIcon icon={faMapLocationDot} />
        </button>

        {showMap && (
          <LocationPicker
            onSelectLocation={handleLocationConfirm}
            onClose={() => setShowMap(false)}
            defLat={defLat}
            defLong={defLong}
          />
        )}
      </div>
    )
  );
};

export default SetLocationButton;
