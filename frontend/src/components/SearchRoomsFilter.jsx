import { useState, useEffect, useContext } from "react";
import styles from "./SearchRoomsFilter.module.css";
import { AuthContext } from "../context/AuthContext";
import { RoomsContext } from "../context/RoomsContext";

export default function SearchRoomsFilter({ setFilteredRooms }) {
  const { user } = useContext(AuthContext);
const {setLoading} = useContext(RoomsContext);
  const [filters, setFilters] = useState({
    priceRange: 1000,
    distanceRange: 10,
  });

  useEffect(() => {
    if (user) fetchFilteredRooms();
  }, [filters, user]);

  const fetchFilteredRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASEURL}/rooms?latitude=${
          user.latitude
        }&longitude=${user.longitude}&userId=${user._id}&maxDistance=${
          filters.distanceRange
        }&maxPrice=${filters.priceRange}`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (response.ok) {
        setFilteredRooms(data.rooms);
      } else {
        console.error("Error fetching filtered rooms:", data.message);
      }
    } catch (error) {
      console.error("Error fetching filtered rooms:", error);
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className={styles.filterContainer}>
      <h1 style={{ marginBottom: "1rem" }}>Filter Rooms</h1>

      <div className={styles.filterGroup}>
        <label>Max Price: ₹{filters.priceRange}</label>
        <input
          type="range"
          min="100"
          max="100000"
          step="50"
          value={filters.priceRange}
          onChange={(e) =>
            setFilters({ ...filters, priceRange: Number(e.target.value) })
          }
        />
      </div>

      <div className={styles.filterGroup}>
        <label>Max Distance: {filters.distanceRange} km</label>
        <input
          type="range"
          min="1"
          max="100"
          step="1"
          value={filters.distanceRange}
          onChange={(e) =>
            setFilters({ ...filters, distanceRange: Number(e.target.value) })
          }
        />
      </div>
    </div>
  );
}
