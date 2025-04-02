import { useEffect } from "react";
import styles from "./SuccessMessage.module.css";

export default function SuccessMessage({ message, type = "success", onClose }) {
      useEffect(() => {
            const timer = setTimeout(() => {
                  onClose(); 
            }, 3500);
            
            return () => clearTimeout(timer); 
      }, [onClose]);
      if(message.length<=0)return;

  return <div className={`${styles.message} ${styles[type]}`}>{message}</div>;
}
