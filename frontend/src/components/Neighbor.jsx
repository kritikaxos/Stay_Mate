import { useNavigate } from "react-router-dom";
import styles from "./Neighbor.module.css";

export default function Neighbor({ user }) {
  const navigate = useNavigate();

  return (
    <div
      className={styles.neighbor}
      onClick={() => navigate(`/profile/${user._id}`)}
    >
      <div className={styles.leftSection}>
        <img
          src={user.photo || "https://avatar.iran.liara.run/public/10"}
          alt="Profile"
        />
        <p>{user.name}</p>
        <h5>{user.occupation}</h5>{" "}
        <h6>
          {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)},{" "}
          {user.age}
        </h6>
      </div>
      <div className={styles.rightSection}>
        <h5>Location: {user.location}</h5>
        <h5>
          Dietary Preference:{" "}
          {user.dietaryPreference
            ? user.dietaryPreference.charAt(0).toUpperCase() +
              user.dietaryPreference.slice(1)
            : "Any"}
        </h5>
        <div className={styles.contact}>
          <h5>Phone: {user.phone}</h5>
        </div>
      </div>
    </div>
  );
}
