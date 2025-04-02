import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UsersProvider } from "./context/UsersContext.jsx";
import { RoomsProvider } from "./context/RoomsContext.jsx";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <UsersProvider>
      <RoomsProvider>
        <App />
      </RoomsProvider>
    </UsersProvider>
  </AuthProvider>
);
