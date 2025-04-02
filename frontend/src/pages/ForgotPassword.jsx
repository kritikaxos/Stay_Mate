import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ForgotPassword.module.css";
import Loading from "../components/Loading";
import SuccessMessage from '../components/SuccessMessage'
import NavBar from '../components/NavBar'

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [step, setStep] = useState(1); 
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("")
  const navigate = useNavigate();

  const handleEmail = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASEURL}/users/forgotPassword`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Enter a valid email");
      setSuccessMessage("Password reset token sent to your email.");
      setStep(2); 
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToken = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASEURL}/users/resetPassword/${token}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, passwordConfirm }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Invalid token or expired.");

      setSuccessMessage("Password reset successful! Redirecting...");

      setTimeout(() => {
        navigate("/");
      }, 2000); 
      
      setStep(1); 
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className={styles.forgotPage}>
        <div className={styles.container}>
          <h1>Forgot Password?</h1>
          {isLoading && <Loading />}
          {successMessage && (
            <SuccessMessage
              message={successMessage}
              type="success"
              onClose={() => setSuccessMessage("")}
            />
          )}

          {error && (
            <SuccessMessage
              message={error}
              type="error"
              onClose={() => setError("")}
            />
          )}

          {step === 1 && (
            <form onSubmit={handleEmail} className={styles.form}>
              <label>Email:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Continue"}
              </button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
              <label>Enter the token sent to your email:</label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your token"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify Token"}
              </button>
            </form>
          )}
          {step === 3 && (
            <form onSubmit={handleToken} className={styles.form}>
              <label>New Password:</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                disabled={isLoading}
              />
              <label>Confirm Password:</label>
              <input
                type="password"
                required
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Confirm new password"
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
