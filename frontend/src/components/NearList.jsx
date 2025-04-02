import styles from "./NearList.module.css";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Loading from "./Loading";
import Neighbor from "./Neighbor";
import NoResultsFound from "./NoResultsFound";

export default function NearList() {
  const { user } = useContext(AuthContext);
  const [neighbors, setNeighbors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNearbyUsers = async () => {
      try {
        const queryParams = new URLSearchParams({
          latitude: user.latitude,
          longitude: user.longitude,
          distanceRange: 20,
          userId: user._id, 
        });

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_BASEURL}/users/search?${queryParams}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch nearby users");
        }

        const data = await response.json();
        setNeighbors(data);
      } catch (error) {
        console.error("Error fetching nearby users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyUsers();
  }, [user?.latitude, user?.longitude]);

  return (
    <div className={styles.container}>
      {loading ? (
        <Loading />
      ) : (
        <>
          <h3 style={{ color: "black" }}>
            People around you looking for Roommates (within 20km)
          </h3>
          {neighbors.length ? (
            <ul className={styles.nearList}>
              {neighbors.map((neighbor) => (
                <Neighbor key={neighbor._id} user={neighbor} />
              ))}
            </ul>
          ) : (
            <div style={{ fontSize: "1.5rem", color: "gray" }}>
              <NoResultsFound />
            </div>
          )}
        </>
      )}
    </div>
  );
}
