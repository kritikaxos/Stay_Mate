import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NeighborProfile from "./pages/NeighborProfile";
import HomePage from "./pages/HomePage";
import Chat from "./pages/Chat";
import User from "./pages/User";
import Room from "./pages/Room";
import SignUp from "./pages/SignUp";
import { AuthContext } from "./context/AuthContext";
import { useState, useContext, useEffect } from "react";
import PostProperty from "./pages/PostProperty";
import ForgotPassword from "./pages/ForgotPassword";
import Background from "./components/Background";
function App() {
  const [showNotif, setShowNotif] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { loggedIn, setLoggedIn } = useContext(AuthContext);
useEffect(() => {
  document.title = "StayMate"; 
}, []);
  return (
    <Router>
      <Background/>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              showNotif={showNotif}
              setShowNotif={setShowNotif}
              loggedIn={loggedIn}
              setLoggedIn={setLoggedIn}
              showChat={showChat}
              setShowChat={setShowChat}
            />
          }
        />
        <Route
          path="/chat"
          element={
            <Chat
              showNotif={showNotif}
              setShowNotif={setShowNotif}
              loggedIn={loggedIn}
              setLoggedIn={setLoggedIn}
              showChat={showChat}
              setShowChat={setShowChat}
            />
          }
        />
        <Route
          path="/user"
          element={
            <User
              showNotif={showNotif}
              setShowNotif={setShowNotif}
              loggedIn={loggedIn}
              setLoggedIn={setLoggedIn}
              showChat={showChat}
              setShowChat={setShowChat}
            />
          }
        />
        <Route
          path="/room"
          element={
            <Room
              showNotif={showNotif}
              setShowNotif={setShowNotif}
              loggedIn={loggedIn}
              setLoggedIn={setLoggedIn}
              showChat={showChat}
              setShowChat={setShowChat}
            />
          }
        />
        <Route path="/signup" element={<SignUp setLoggedIn={setLoggedIn} />} />
        <Route path="/profile/:id" element={<NeighborProfile />} />
        <Route path="/rooms/post" element={<PostProperty />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
