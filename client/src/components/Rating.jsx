import React from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

function Rating({ rating, numReviews, caption, style }) {
	return (
		<div className="rating" style={{ height: "20px", ...style }}>
			{[1, 2, 3, 4, 5].map((star) => (
				<span key={star}>
					<i
						className={`star ${
							rating >= star
								? "fas fa-star"
								: rating >= star - 0.5
								? "fas fa-star-half-alt"
								: "far fa-star"
						}`}
						style={{ color: "gold" }}
					></i>
				</span>
			))}
		</div>
	);
}

export default Rating;
