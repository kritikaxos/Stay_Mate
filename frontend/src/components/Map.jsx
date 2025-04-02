import { useState, useEffect, useContext } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet"; 
import { AuthContext } from "../context/AuthContext";
import { UsersContext } from "../context/UsersContext";
import Loading from "./Loading";
import { useNavigate } from "react-router-dom";
import styles from "./Map.module.css";

export default function Map({ filteredUsers }) {
  const { user } = useContext(AuthContext);
  const { users, loading } = useContext(UsersContext);
  const [mapPosition, setMapPosition] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (user?.latitude && user?.longitude) {
      setMapPosition([user.latitude, user.longitude]);
    }
  }, [user]);

  const neighborList = users.filter(
    (neighbor) =>
      isInRange(neighbor.latitude, neighbor.longitude, 20) &&
      neighbor._id !== user._id
  );

  function isInRange(latitude, longitude, radius) {
    const earthRadius = 6371;
    function toRadians(degrees) {
      return (degrees * Math.PI) / 180;
    }

    const dLat = toRadians(latitude - user.latitude);
    const dLon = toRadians(longitude - user.longitude);
    const lat1 = toRadians(user.latitude);
    const lat2 = toRadians(latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;

    return distance <= radius;
  }

  if (!user?.latitude || !user?.longitude) return <p>Loading map...</p>;
  if (!mapPosition) return <Loading />;

  function handlePopUpClick(id) {
    setSelectedUser(users.find((u) => u._id === id));
  }

  // Create a custom icon for the markers
  const customIcon = L.icon({
    iconUrl: '/assets/pictures/location.png', // Replace with the actual image URL
    iconSize: [40, 40], // Size of the icon
    iconAnchor: [20, 40], // The point of the icon which will correspond to the marker's location
    popupAnchor: [0, -40], // Position of the popup
  });

  return (
    <div className={styles.mapContainer}>
      {!loading ? (
        <MapContainer
          center={mapPosition}
          zoom={12}
          scrollWheelZoom={true}
          className={styles.map}
          maxBounds={[
            [-90, -180],
            [90, 180],
          ]}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredUsers.length === 0
            ? neighborList.map((neighbor) => {
                return (
                  <Marker
                    key={neighbor._id}
                    position={[neighbor.latitude, neighbor.longitude]}
                    icon={customIcon} 
                  >
                    <Popup>
                      <h3
                        onClick={() => handlePopUpClick(neighbor._id)}
                        style={{
                          backgroundColor:
                            neighbor.gender === "male"
                              ? "rgb(126, 202, 223)"
                              : neighbor.gender === "female"
                              ? "rgba(255, 144, 227, 0.6)"
                              : "rgba(200, 196, 196, 0.75)",
                          padding: "0.3rem 0.5rem",
                          borderRadius: "0.5rem",
                          cursor: "pointer",
                        }}
                      >
                        {neighbor.name}
                      </h3>
                      <br />
                      {neighbor.age} <br />
                      {neighbor.occupation}
                    </Popup>
                  </Marker>
                );
              })
            : filteredUsers.map((neighbor) => (
                <Marker
                  key={neighbor._id}
                  position={[neighbor.latitude, neighbor.longitude]}
                  icon={customIcon} // Apply the custom icon
                >
                  <Popup>
                    <h3
                      onClick={() => handlePopUpClick(neighbor._id)}
                      style={{
                        backgroundColor:
                          neighbor.gender === "male"
                            ? "rgb(126, 202, 223)"
                            : neighbor.gender === "female"
                            ? "rgba(255, 144, 227, 0.6)"
                            : "rgba(200, 196, 196, 0.75)",
                        padding: "0.3rem 0.5rem",
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                      }}
                    >
                      {neighbor.name}
                    </h3>
                    <br />
                    {neighbor.age} <br />
                    {neighbor.occupation}
                  </Popup>
                </Marker>
              ))}
          <DetectMapClick onClick={() => setSelectedUser(null)} />

          {user && (
            <ResetLocationButton position={[user.latitude, user.longitude]} />
          )}
        </MapContainer>
      ) : (
        <Loading />
      )}

      {selectedUser && (
        <NeighborPopup
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

// Detect Map Click
function DetectMapClick({ onClick }) {
  useMapEvents({
    click: onClick,
  });
  return null;
}

// Reset Location Button
function ResetLocationButton({ position }) {
  const map = useMap();
  return (
    <button
      onClick={() => map.setView(position, 13)}
      style={{
        position: "absolute",
        bottom: "10px",
        left: "10px",
        zIndex: 1000,
        background: "cadetblue",
        color: "white",
        padding: "8px 12px",
        borderRadius: "5px",
        border: "none",
        cursor: "pointer",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.08)",
      }}
    >
      See Around Me
    </button>
  );
}

function NeighborPopup({ user }) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        background: "white",
        padding: "15px",
        borderRadius: "10px",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        zIndex: 90,
        maxWidth: "280px",
      }}
      className={styles.popUp}
      onClick={() => {
        navigate(`/profile/${user._id}`);
      }}
    >
      <img
        src={user.photo || "https://via.placeholder.com/60"}
        alt="Profile"
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: "0 0 5px", fontSize: "1.1rem" }}>
          {user.name}, {user.age}
        </h4>
        <p
          style={{
            margin: "0 0 5px",
            fontSize: "0.9rem",
            fontWeight: "bold",
            color: "#555",
          }}
        >
          {user.occupation}
        </p>
        <p style={{ margin: "0", fontSize: "0.85rem", color: "#777" }}>
          📍 {user.location || "Unknown Location"}
        </p>
      </div>
    </div>
  );
}
