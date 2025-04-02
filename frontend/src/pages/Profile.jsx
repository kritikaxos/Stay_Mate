import { useState } from "react";
import styles from "./Profile.module.css";
import NearList from "../components/NearList";
import MapContainer from "../components/Map";
import SearchByFilter from "../components/SearchByFilter";
import FilterList from "../components/FilterList";
import Contact from "../components/Contact";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Loading from "../components/Loading";

export default function Profile() {
  const [filters, setFilters] = useState(null);

  const [filteredUsers, setFilteredUsers] = useState([]);
  const { user, loading } = useContext(AuthContext);

  
  return (
    <div className={styles.profileContainer}>
      {!loading ? (
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Hi, {user?.name?.split(" ")[0]}</h1>
          </div>

          <div className={styles.main}>
            <NearList />
            <MapContainer
              filteredUsers={filteredUsers}
            />
          </div>

          <div className={styles.filter}>
            <SearchByFilter
              onFilter={setFilters}
              filteredUsers={filteredUsers}
              setFilteredUsers={setFilteredUsers}
            />
            {filters && <FilterList filters={filters} />}
          </div>
        </div>
      ) : (
        <Loading />
      )}

      <Contact />
    </div>
  );
}
