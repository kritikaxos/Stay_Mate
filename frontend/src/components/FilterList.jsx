import styles from "./FilterList.module.css";
import Neighbor from "./Neighbor";
import NoResultsFound from "./NoResultsFound";

export default function FilterList({ users }) {
  return (
    <div className={styles.container}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignContent: "center",
        }}
      >
        <h3 style={{
          color:'white'
        }}>Filtered Search : </h3>
      </div>
      {users.length!==0?(<ul
        className={styles.nearList} 
      >
        {users.map((user, index) => (
          <Neighbor key={index} user={user} />
        ))}
      </ul>):(
        <div>
          <h3 style={{
            color:'gray'
            }}><NoResultsFound/></h3>

        </div>
      )}
      
    </div>
  );
}
