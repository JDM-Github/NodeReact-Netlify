import React from "react";
import Spinner from "react-bootstrap/Spinner";

function LoadingBox() {
	return (
		<Spinner
			animation="border"
			role="status"
			style={{
				position: "absolute",
				top: "100px",
				left: "calc(50% - 25px)",
			}}
		>
			<span className="visually-hidden">LOADING...</span>
		</Spinner>
	);
}

export default LoadingBox;
