import { useState, useEffect, useContext } from "react";
import styles from "./Room.module.css";
import NavBar from "../components/NavBar";
import Notifications from "../components/Notifications";
import { RoomsContext } from "../context/RoomsContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import NoResultsFound from "../components/NoResultsFound";
import SearchRoomsFilter from "../components/SearchRoomsFilter";
import L from "leaflet"; 

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

const DEFAULT_AVATAR = "https://avatar.iran.liara.run/public/41";

function RoomItem({
  image,
  name,
  price,
  description,
  owner,
  isMyProperty,
  onDelete,
  removing
}) {
  const imageUrl =
    image && image.includes("picsum")
      ? image
      : image
      ? `${import.meta.env.VITE_BACKEND_BASEURL}/${image}`
      : DEFAULT_AVATAR;
  
  return (
    <div className={styles.roomItem}>
      <div>
        <img src={imageUrl} alt={name} />
      </div>
      <div className={styles.details}>
        <div className={styles.leftSection}>
          <h3>{name}</h3>
          <h4>₹ {price}/mo</h4>
          <p>{description}</p>
        </div>
        <div className={styles.rightSection}>
          {isMyProperty ? (
            <button className={styles.removeButton} onClick={onDelete} style={{cursor:'pointer'}}>
              {removing?<Loading/>:'Remove'}
            </button>
          ) : (
            <div className={styles.contactButton}>
              <p>Phone: {owner?.phone || "N/A"}</p>
              <p>Email: {owner?.email || "N/A"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoomDetailsModal({ room, onClose }) {
  if (!room) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2>{room.title}</h2>
        <img
          src={
            room.photos?.[0]
              ? `${import.meta.env.VITE_BACKEND_BASEURL}/${room.photos[0]}`
              : DEFAULT_AVATAR
          }
          alt={room.title}
        />
        <p>
          <strong>Price:</strong> ${room.price} per month
        </p>
        <p>
          <strong>Description:</strong> {room.description}
        </p>
        <p>
          <strong>Owner Contact:</strong> {room.owner?.email || "N/A"}
        </p>
        <p>
          <strong>Phone:</strong> {room.owner?.phone || "N/A"}
        </p>
        <button onClick={onClose} className={styles.closeButton}>
          Close
        </button>
      </div>
    </div>
  );
}

export default function Room({
  showNotif,
  setShowNotif,
  loggedIn,
  setLoggedIn,
  showChat,
  setShowChat,
}) {
  const {
    rooms,
    userRooms,
    setRooms,
    setUserRooms,
    loading,
  } = useContext(RoomsContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [mapPosition, setMapPosition] = useState(null);
  const [filteredRooms, setFilteredRooms] = useState(rooms);
  const [removing, setRemoving] = useState(false);
  const customIcon = L.icon({
      iconUrl: '/assets/pictures/location.png', // Replace with the actual image URL
      iconSize: [40, 40], // Size of the icon
      iconAnchor: [20, 40], // The point of the icon which will correspond to the marker's location
      popupAnchor: [0, -40], // Position of the popup
    });
  useEffect(() => {
    if (user?.latitude && user?.longitude) {
      setMapPosition([user.latitude, user.longitude]);
    }
  }, [user]);

  useEffect(() => {
    setFilteredRooms(rooms);
  }, [rooms]);

  const handleRemoveProperty = async (roomId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this property?"
    );
    if (!confirmDelete) return;

    try {
      setRemoving(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASEURL}/rooms/${roomId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data.success) {
        // Remove from both nearby rooms and user's own properties
        setRooms((prevRooms) =>
          prevRooms.filter((room) => room._id !== roomId)
        );
        setUserRooms((prevUserRooms) =>
          prevUserRooms.filter((room) => room._id !== roomId)
        );
      } else {
        alert("Failed to remove property: " + data.message);
      }
    } catch (error) {
      alert("Error removing property: " + error.message);
    } finally {
      setRemoving(false);
    }
  };

  if (!mapPosition) return <Loading />;
  if (!user?.latitude || !user?.longitude) return <p>Loading map...</p>;

  return (
    <>
      <NavBar
        setShowNotif={setShowNotif}
        loggedIn={loggedIn}
        setLoggedIn={setLoggedIn}
        showChat={showChat}
        setShowChat={setShowChat}
      />
      <div className={styles.roomContainer}>
        <SearchRoomsFilter setFilteredRooms={setFilteredRooms} />

        <div className={styles.container}>
          <div className={styles.headerSection}>
            <h1>Places near you available for rent</h1>
            <div className={styles.buttons}>
              <button
                className={styles.Button}
                onClick={() => navigate("/rooms/post")}
              >
                <p>Post Property</p>
              </button>
            </div>
          </div>

          <div className={styles.allRooms}>
             
              <div className={styles.othersList}>
                {loading?(<Loading/>):(
                  filteredRooms.length > 0 ? (
                  <>
                    <ul className={styles.roomList}>
                      {loading && <Loading />}
                      {filteredRooms.map((room) => (
                        <li key={room._id}>
                          <RoomItem
                            image={room.photos?.[0]}
                            name={room.title}
                            price={room.price}
                            description={room.description}
                            owner={room.owner}
                            removing={removing}
                          />
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <NoResultsFound />
                ))}
                
              </div>
            

            <MapContainer center={mapPosition} zoom={12} className={styles.map}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {filteredRooms.map((room) => (
                <Marker
                  key={room._id}
                  position={[room.latitude, room.longitude]}
                  icon={customIcon}
                >
                  <Popup>
                    <div>
                      <h3>{room.title}</h3>
                      <p>${room.price} per month</p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedRoom(room);
                        }}
                        className={styles.viewDetails}
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}

              <DetectMapClick onClick={() => setSelectedRoom(null)} />
              <ResetLocationButton position={mapPosition} />
            </MapContainer>
          </div>
        </div>

        <div id="my-properties" className={styles.myProperties}>
          <h1>My Properties</h1>
          {userRooms.length === 0 ? (
            <NoResultsFound />
          ) : (
            <ul className={styles.myList}>
              {userRooms.map((room) => (
                <li key={room._id}>
                  <RoomItem
                    image={room.photos?.[0]}
                    name={room.title}
                    price={room.price}
                    owner={room.owner}
                    description={room.description}
                    isMyProperty={true}
                    onDelete={() => handleRemoveProperty(room._id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {showNotif && <Notifications />}
        {selectedRoom && (
          <RoomDetailsModal
            room={selectedRoom}
            onClose={() => setSelectedRoom(null)}
          />
        )}
      </div>
    </>
  );
}

function DetectMapClick({ onClick }) {
  useMapEvents({ click: onClick });
  return null;
}

function ResetLocationButton({ position }) {
  const map = useMap();
  return (
    <button
      onClick={() => map.setView(position, 13)}
      className={styles.resetButton}
    >
      See Around Me
    </button>
  );
}
