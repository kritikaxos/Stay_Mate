import styles from "./Reviews.module.css";

const reviews = {
  1: {
    id: 1,
    name: "George",
    title: "Helped me in my first days of college!",
    content:
      "StayMate made my college transition so much easier! I found a great roommate who shared similar interests, and we instantly clicked. The filtering options were a lifesaver!",
  },
  2: {
    id: 2,
    name: "Rob",
    title: "Found the perfect place before moving!",

    content:
      "I was moving to a new city for work and had no idea where to stay. StayMate helped me find a great rental with a friendly roommate even before I arrived. The chat feature was really useful too!",
  },
  3: {
    id: 3,
    name: "John",
    title: "Convenient way to find roommates near my workplace.",

    content:
      "I was looking for a place close to my office, and StayMate helped me connect with a like-minded person who had a spare room. The process was smooth, and I moved in without any hassle!",
  },
};
function Review({ title, content, image, name }) {
  return (
    <div className={styles.review}>
      <div className={styles.image}>
        <img src={image} alt="User Avatar" />
      </div>
      <div className={styles.details}>
        <div className={styles.head}>"{title}"</div>
        <p className={styles.content}>{content}</p>
        <p className={styles.name}>- {name}"</p>
      </div>
    </div>
  );
}

function Reviews() {
  return (
    <div className={styles.reviewContainer}>
      <h3>Hear from the people themselves</h3>
      <ul className={styles.reviewList}>
        {Object.values(reviews).map((review) => (
          <li key={review.id}>
            <Review
              title={review.title}
              content={review.content}
              image={`https://avatar.iran.liara.run/public/${review.id}`}
              name={review.name}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Reviews;
