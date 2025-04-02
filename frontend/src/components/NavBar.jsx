import { useState, useContext } from "react";
import SignInModal from "./SignInModal";
import styles from "./NavBar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faBed } from "@fortawesome/free-solid-svg-icons";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Loading from "./Loading";
export default function NavBar({
  setShowNotif,
  
  setLoggedIn,
  
}) {
  const [showSignIn, setShowSignIn] = useState(false);
  const { user, loggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  return (
    <>
      <nav className={styles.nav}>
        <NavLink to="/" style={{ color: "white", textDecoration: "none" }}>
          <h1 className={styles.heading}> StayMate</h1>
        </NavLink>
        <div className={styles.options}>
          {loggedIn ? (
            <div className={styles.loginButtons}>
              <span
                onClick={() => setShowNotif(false)}
                style={{ color: "white" }}
              ></span>
              <span onClick={() => setShowNotif((b) => !b)}>
                <FontAwesomeIcon icon={faBell} />
              </span>

              <span onClick={() => setShowNotif(false)}>
                <NavLink to="/room">
                  <FontAwesomeIcon icon={faBed} style={{ color: "white" }} />
                </NavLink>
              </span>
              <NavLink to="/user" style={{ color: "white" }}>
                <span
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => setShowNotif(false)}
                >
                  <img
                    className={styles.userImage}
                    src={
                      user?.photo || "https://avatar.iran.liara.run/public/41"
                    }
                    alt="Profile"
                  />
                </span>
              </NavLink>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <span
                className={styles.login}
                style={{ fontSize: "1rem", cursor: "pointer" }}
                onClick={() => {
                  setShowSignIn(true);
                  setShowNotif(false);
                }}
              >
                <p>Log In</p>
              </span>
              <span
                className={styles.signup}
                style={{ fontSize: "1rem", cursor: "pointer" }}
                onClick={() => {
                  navigate("/signup");
                }}
              >
                <p>Sign Up</p>
              </span>
            </div>
          )}
        </div>
      </nav>

      {showSignIn && (
        <SignInModal
          setLoggedIn={setLoggedIn}
          closeModal={() => setShowSignIn(false)}
        />
      )}
    </>
  );
}
