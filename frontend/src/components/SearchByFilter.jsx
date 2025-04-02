import { useState, useContext, useEffect } from "react";
import styles from "./SearchByFilter.module.css";
import { UsersContext } from "../context/UsersContext";
import { AuthContext } from "../context/AuthContext";
import FilterList from "./FilterList";

export default function SearchByFilter({ filteredUsers, setFilteredUsers }) {
  const { user } = useContext(AuthContext);

  const initialFilter = {
    searchQuery: "",
    gender: "",
    ageRange: 18,
    distanceRange: 2,
    dietaryPreference: "",
    locationQuery: "",
  };

  const [filters, setFilters] = useState(
    JSON.parse(localStorage.getItem("filters")) || initialFilter
  );
  const [showFilteredUsers, setShowFilteredUsers] = useState(
    JSON.parse(localStorage.getItem("showFilteredUsers")) || false
  );
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("filteredUsers"));
    if (storedUsers) {
      setFilteredUsers(storedUsers);
      setShowFilteredUsers(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("filters", JSON.stringify(filters));
    localStorage.setItem(
      "showFilteredUsers",
      JSON.stringify(showFilteredUsers)
    );
  }, [filters, showFilteredUsers]);

  useEffect(() => {
    const storedTimestamp = localStorage.getItem("filterTimestamp");
    if (storedTimestamp) {
      const currentTime = Date.now();
      if (currentTime - storedTimestamp > 5 * 60 * 1000) {
        clearFilters();
      }
    }
  }, []);

  useEffect(() => {
    if (filteredUsers.length > 0) {
      localStorage.setItem("filteredUsers", JSON.stringify(filteredUsers));
      localStorage.setItem("filterTimestamp", Date.now());
    }
  }, [filteredUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: name === "distanceRange" ? Number(value) : value,
      ...(name === "locationQuery" && value !== "" ? { distanceRange: 2 } : {}),
      ...(name === "distanceRange" && value !== ""
        ? { locationQuery: "" }
        : {}),
    }));
  };

  const applyFilters = async () => {
    try {
      if (!user?.latitude || !user?.longitude) {
        console.error("User location is missing. Cannot filter by distance.");
        return;
      }

      setLoading(true); // Start loading

      const queryParams = new URLSearchParams({
        searchQuery: filters.searchQuery || "",
        gender: filters.gender || "",
        ageRange: filters.ageRange || "",
        distanceRange: filters.distanceRange || "",
        dietaryPreference: filters.dietaryPreference || "",
        locationQuery: filters.locationQuery || "",
        latitude: user.latitude,
        longitude: user.longitude,
        userId:user._id
      });

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASEURL}/users/search?${queryParams}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch filtered users");
      }

      const data = await response.json();
      setFilteredUsers(data);
      setShowFilteredUsers(true);
    } catch (error) {
      console.error("Error fetching filtered users:", error);
    } finally {
      setLoading(false); 
    }
  };

  const clearFilters = () => {
    
    setFilteredUsers([]);
    setShowFilteredUsers(false);
    localStorage.removeItem("filters");
    localStorage.removeItem("filteredUsers");
    localStorage.removeItem("showFilteredUsers");
  };

  return (
    <div className={styles.searchByFilter}>
      <h4>Search by Filter</h4>
      <div className={styles.options}>
        <div className={styles.filterGroup}>
          <label>Search by Name:</label>
          <input
            type="text"
            placeholder="Enter name..."
            name="searchQuery"
            value={filters.searchQuery}
            onChange={handleChange}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Search by Location:</label>
          <input
            type="text"
            placeholder="Enter location..."
            name="locationQuery"
            value={filters.locationQuery}
            onChange={handleChange}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Distance Radius: {filters.distanceRange} km</label>
          <input
            type="range"
            name="distanceRange"
            min="1"
            max="100"
            value={filters.distanceRange || 1}
            onChange={handleChange}
            disabled={filters.locationQuery !== ""}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Gender:</label>
          <select name="gender" value={filters.gender} onChange={handleChange}>
            <option value="">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Age Range: {filters.ageRange}+</label>
          <input
            type="range"
            name="ageRange"
            min="18"
            max="60"
            value={filters.ageRange}
            onChange={handleChange}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Dietary Preference:</label>
          <select
            name="dietaryPreference"
            value={filters.dietaryPreference}
            onChange={handleChange}
          >
            <option value="">Any</option>
            <option value="veg">Vegetarian</option>
            <option value="nonveg">Non-Vegetarian</option>
          </select>
        </div>
        <div className={styles.buttons}>
          <button onClick={applyFilters} disabled={loading}>
            {loading ? "Loading..." : "Apply Filters"}
          </button>
          <button
            onClick={clearFilters}
            className={styles.clearButton}
            style={{ backgroundColor: "rgb(255, 77, 77, 0.9)" }}
          >
            Clear Filters
          </button>
        </div>
      </div>
      {loading && <p>Loading filtered users...</p>}
      {showFilteredUsers && !loading && <FilterList users={filteredUsers} />}
    </div>
  );
}
