import React, { useState } from "react";
import "./ChatImage.css";

const ChatImage = ({ handleImageClick, msg, userInfo }) => {
	return (
		<div
			style={{
				display: "flex",
				width: "100%",
				justifyContent: `
				${msg.user === userInfo.id ? "right" : "left"}`,
			}}
		>
			{msg.image ? (
				<img
					className={`image-send`}
					src={msg.image}
					alt="Message"
					onClick={() => handleImageClick(msg.image)}
				/>
			) : null}
		</div>
	);
};

export default ChatImage;
