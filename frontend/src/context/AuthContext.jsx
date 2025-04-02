import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Ensure initial loading state

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASEURL}/users/me`,
        {
          method: "GET",
          credentials: "include", // Send cookies
        }
      );

      if (response.ok) {
        const data = await response.json();
        // console.log("✅ User authenticated:", data.user);
        setUser(data.user);
        setLoggedIn(true);
      } else {
        // console.log("❌ User not authenticated.");
        setUser(null);
        setLoggedIn(false);
      }
    } catch (error) {
      console.error("⚠️ Error checking auth status:", error);
      setUser(null);
      setLoggedIn(false);
    } finally {
      setLoading(false); // Done loading
    }
  };

  // ✅ Run authentication check on page load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // ✅ Login function
  const loginUser = async (email, password) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASEURL}/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      // console.log("🔹 Login successful:", data.user);
      setUser(data.user);
      setLoggedIn(true);
      return data;
    } catch (error) {
      console.error("❌ Login failed:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout function
  const logoutUser = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;

    try {
      setLoading(true);
      await fetch(`${import.meta.env.VITE_BACKEND_BASEURL}/users/logout`, {
        method: "POST",
        credentials: "include",
      });

      // console.log("🔹 Logged out successfully");
      setUser(null);
      setLoggedIn(false);
    } catch (error) {
      console.error("⚠️ Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loggedIn,
        setLoggedIn,
        loginUser,
        logoutUser,
        loading,
      }}
    >
      {!loading && children} {/* Prevent UI flicker while loading */}
    </AuthContext.Provider>
  );
};
