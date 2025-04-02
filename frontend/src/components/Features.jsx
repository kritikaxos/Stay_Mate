import styles from "./Features.module.css";

export default function Features() {
  return (
    <ul className={styles.featureList}>
      <li>
        <h2>Filter Results</h2>
        <p>
          Easily narrow down your search by applying filters such as budget,
          location, lifestyle preferences, and more.
        </p>
      </li>
      <li>
        <h2>Look for Rooms</h2>
        <p>
          Find available rental listings alongside potential roommates, making
          your search for a new place seamless.
        </p>
      </li>
      <li>
        <h2>Send Requests</h2>
        <p>
          Send qequests to potential roommates or landlords before making a
          decision, ensuring a perfect match.
        </p>
      </li>
      <li>
        <h2>Map Integration</h2>
        <p>
          Visualize listings and roommates nearby with an interactive map for a
          better location-based search experience.
        </p>
      </li>
    </ul>
  );
}
