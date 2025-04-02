import { useContext, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import styles from "./LocationPicker.module.css";
import "leaflet/dist/leaflet.css";
import { AuthContext } from "../context/AuthContext";
import L from "leaflet"; // Import Leaflet for custom icons

const LocationPicker = ({ onSelectLocation, onClose, defLat=20, defLong=70 }) => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const {user} = useContext(AuthContext)
  const handleConfirm = () => {
    if (selectedPosition) {
      onSelectLocation(selectedPosition); 
    }
    onClose();
  };
  const position =
    user && user.latitude && user.longitude
      ? [user.latitude, user.longitude]
      : [defLat, defLong];
const customIcon = L.icon({
      iconUrl: '/assets/pictures/location.png', // Replace with the actual image URL
      iconSize: [40, 40], // Size of the icon
      iconAnchor: [20, 40], // The point of the icon which will correspond to the marker's location
      popupAnchor: [0, -40], // Position of the popup
    });

  return (
    <div className={styles.overlay}>
      <div className={styles.mapContainer}>
        <MapContainer
          center={position} 
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler setSelectedPosition={setSelectedPosition} />
          {selectedPosition && <Marker position={selectedPosition}  icon={customIcon}/>}
        </MapContainer>

        <div className={styles.controls}>
          <button className={styles.confirmButton} onClick={handleConfirm}>
            Confirm
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const MapClickHandler = ({ setSelectedPosition }) => {
  useMapEvents({
    click(e) {
      setSelectedPosition(e.latlng);
    },
  });

  return null;
};

export default LocationPicker;
