import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";

export default function NoResultsFound() {
  return (
    <div className="no-results-found">
      <h2 style={{display:'flex', gap:'1rem', alignItems:'center', color:'black'}}>
        No Results Found
        <FontAwesomeIcon icon={faCircleQuestion} />
      </h2>
    </div>
  );
}
