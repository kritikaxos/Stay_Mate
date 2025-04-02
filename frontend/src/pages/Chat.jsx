import NavBar from "../components/NavBar";
import styles from "./Chat.module.css";
import Notifications from "../components/Notifications";
const people = [
  {
    id: 1,
    name: "John Doe",
    avatar: `https://avatar.iran.liara.run/public/30`,
  },
  {
    id: 2,
    name: "Jane Doe",
    avatar: `https://avatar.iran.liara.run/public/33`,
  },
  {
    id: 3,
    name: "Bob Smith",
    avatar: `https://avatar.iran.liara.run/public/20`,
  },
];
function ChatBar({name, avatar}){
      return (
        <div className={styles.chatBar}>
          <div>
            <img src={avatar} alt="" />
          </div>
          <div>{name}</div>
        </div>
      );
}
export default function Chat({ showNotif,setShowNotif, loggedIn, setLoggedIn, showChat, setShowChat }) {
  return (
    <>
      <NavBar
        setShowNotif={setShowNotif}
        loggedIn={loggedIn}
        setLoggedIn={setLoggedIn}
        showChat={showChat}
        setShowChat={setShowChat}
      />
      {loggedIn?(<div className={styles.container}>
        <ul className={styles.chatList}>
          <h1>Chats</h1>
          {people.map((person) => (
            <li key={person.id}>
              <ChatBar name={person.name} avatar={person.avatar} />
            </li>
          ))}
        </ul>
        <div className={styles.chatBox}>
          <div className={styles.messages}></div>
          <div className={styles.inputBox}>
            <input
              className={styles.inputText}
              type="text"
              placeholder="Type a message..."
            />
            <button className={styles.send}>Send</button>
          </div>
        </div>
      </div>):(<h2 className={styles.container}>Log In To Chat</h2>)}
      
      {showNotif && <Notifications />}
    </>
  );
}
