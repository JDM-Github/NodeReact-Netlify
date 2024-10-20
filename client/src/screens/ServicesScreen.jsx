import React, { useContext, useEffect, useReducer, useState } from "react";
import { Helmet } from "react-helmet-async";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Store } from "../Store";
import { toast } from "react-toastify";
import getError from "../utils";
import axios from "axios";
import { Box, TextField } from "@mui/material";
import { Col, FloatingLabel, Row } from "react-bootstrap";

import { useNavigate, useParams } from "react-router-dom";

const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true };
		case "FETCH_SUCCESS":
			return { ...state, loading: false };
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };

		case "UPLOAD_REQUEST":
			return { ...state, loadingUpload: true, errorUpload: "" };
		case "UPLOAD_SUCCESS":
			return { ...state, loadingUpload: false, errorUpload: "" };
		case "UPLOAD_FAIL":
			return {
				...state,
				loadingUpload: false,
				errorUpload: action.payload,
			};

		case "UPDATE_REQUEST":
			return { ...state, loadingUpdate: true };
		case "UPDATE_SUCCESS":
			return { ...state, loadingUpdate: false };
		case "UPDATE_FAIL":
			return { ...state, loadingUpdate: false };

		case "CREATE_REQUEST":
			return { ...state, loadingCreate: true };
		case "CREATE_SUCCESS":
			return { ...state, loadingCreate: false };
		case "CREATE_FAIL":
			return { ...state, loadingCreate: false };

		default:
			return state;
	}
};

export default function ServicesScreen() {
	const { state } = useContext(Store);
	const { userInfo, custom } = state;
	const params = useParams();
	const { id: customId } = params;
	const navigate = useNavigate();

	const [name, setName] = useState(" ");
	const [lastname, setLastName] = useState(" ");
	const [description, setDescription] = useState("");
	const [image, setImage] = useState("");
	const [images, setImages] = useState([]);

	const [
		{ loading, error, loadingUpdate, loadingUpload, loadingCreate },
		dispatch,
	] = useReducer(reducer, {
		loadingUpdate: false,
		loading: true,
		error: "",
	});

	return (
		<div
			className="container"
			style={{
				width: "81rem",
				gap: "5rem",
				justifyContent: "space-evenly",
				display: "flex",
				flexDirection: "column",
				// alignItems:"center"
			}}
		>
			<Helmet>
				<title>Services</title>
			</Helmet>

			<h1 className="my-3">RYB Services</h1>

			<div
				style={{
					flexDirection: "column",
					alignItems: "center",
					display: "flex",
				}}
			>
				<div
					style={{
						width: "35rem",
						flexDirection: "column",
						alignItems: "center",
						display: "flex",
						justifyContent: "space-evenly",
					}}
				>
					<div className="mb-3">
						<div
							className="serviceName"
							style={{
								display: "flex",
								justifyContent: "center",
							}}
						>
							Repair
						</div>
						<div
							className="serviceDescription"
							style={{ display: "flex", alignItems: "center" }}
						>
							<span>
								Lorem ipsum dolor sit amet consectetur
								adipiscing elit iaculis, magna libero
								ullamcorper conubia rutrum hac lacinia sagittis
								euismod, felis ut convallis tincidunt nisl
								faucibus mattis. Tincidunt fermentum vel nisl
								eleifend hac porttitor vehicula ornare venenatis
								lectus taciti, dignissim ante posuere facilisis
								nunc mauris malesuada arcu elementum habitasse
								hendrerit enim, et est sociosqu aenean libero
								fringilla placerat semper at ut.
							</span>
						</div>
					</div>
					<div className="mb-3">
						<div
							className="serviceName"
							style={{
								display: "flex",
								justifyContent: "center",
							}}
						>
							Customized
						</div>
						<div
							className="serviceDescription"
							style={{
								display: "flex",
								justifyContent: "center",
							}}
						>
							<span>
								Lorem ipsum dolor sit amet consectetur
								adipiscing elit iaculis, magna libero
								ullamcorper conubia rutrum hac lacinia sagittis
								euismod, felis ut convallis tincidunt nisl
								faucibus mattis. Tincidunt fermentum vel nisl
								eleifend hac porttitor vehicula ornare venenatis
								lectus taciti, dignissim ante posuere facilisis
								nunc mauris malesuada arcu elementum habitasse
								hendrerit enim, et est sociosqu aenean libero
								fringilla placerat semper at ut.
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
