import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const RoomsContext = createContext();

export const RoomsProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [userRooms, setUserRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  // Fetch nearby rooms (excluding user's own rooms)
  useEffect(() => {
    if (loading || !user?._id) return;

    const fetchRooms = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_BASEURL}/rooms?latitude=${
            user.latitude
          }&longitude=${user.longitude}&userId=${user._id}&maxDistance=10`,
          { credentials: "include" }
        );

        const data = await response.json();
        if (response.ok) {
          setRooms(data.rooms);
          
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
      setLoading(false);
    };
    fetchRooms();
  }, [user]);

  // Fetch only the user's own properties
  useEffect(() => {
    if (!user?._id) return;

    const fetchUserRooms = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_BASEURL}/rooms/my?userId=${user._id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (response.ok) {
          setUserRooms(data.rooms);
        } else {
          console.error("Failed to fetch user rooms:", data.message);
        }
      } catch (error) {
        console.error("Error fetching user rooms:", error);
      }
    };

    fetchUserRooms();
  }, [user?._id]); 

  return (
    <RoomsContext.Provider
      value={{
        rooms,
        userRooms,
        setRooms,
        setUserRooms,
        loading,
        setLoading,
      }}
    >
      {children}
    </RoomsContext.Provider>
  );
};
