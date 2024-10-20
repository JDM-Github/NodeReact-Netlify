import React, { useContext, useEffect, useReducer, useState } from "react";
import { Helmet } from "react-helmet-async";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Store } from "../Store";
import { toast } from "react-toastify";
import getError from "../utils";
import axios from "axios";
import { Box, TextField } from "@mui/material";
import { FloatingLabel } from "react-bootstrap";

import { useNavigate, useParams } from "react-router-dom";
import Container from "react-bootstrap/Container";
import ListGroup from "react-bootstrap/ListGroup";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import RequestHandler from "../functions/RequestHandler";

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

export default function CustomizeRequestScreen() {
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

	useEffect(() => {
		const fetchData = async () => {
			try {
				dispatch({ type: "FETCH_REQUEST" });
				const data = await RequestHandler.handleRequest(
					"get",
					`custom/${customId}`
				);
				setName(data.name);
				setLastName(data.lastname);
				setImage(data.image);
				setImages(data.images);
				setDescription(data.description);
				dispatch({ type: "FETCH_SUCCESS" });
			} catch (err) {
				dispatch({
					type: "FETCH_FAIL",
					payload: getError(err),
				});
			}
		};
		fetchData();
	}, [customId]);

	const submitHandler = async (e) => {
		e.preventDefault();
		try {
			dispatch({ type: "UPDATE_REQUEST" });
			await RequestHandler.handleRequest(
				"put",
				`custom`,
				{
					name,
					lastname,
					image,
					images,
					description,
				},
				{ headers: { Authorization: `Bearer ${userInfo.token}` } }
			);
			dispatch({ type: "UPDATE_SUCCESS" });
			toast.success("UPDATE SUCCESSFUL");
		} catch (err) {
			toast.error(getError(err));
			dispatch({ type: "UPDATE_FAIL" });
		}
	};

	const uploadFileHandler = async (e, forImages) => {
		const file = e.target.files[0];
		const bodyFormData = new FormData();
		bodyFormData.append("file", file);

		try {
			dispatch({ type: "UPLOAD_REQUEST" });
			const data = RequestHandler.handleRequest(
				"post",
				"upload",
				bodyFormData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
						authorization: `Bearer ${userInfo.token}`,
					},
				}
			);
			dispatch({ type: "UPLOAD_SUCCESS" });

			if (forImages) {
				setImages([...images, data.secure_url]);
			} else {
				setImage(data.secure_url);
			}
			toast.success("IMAGE UPLOADED. NOW, CLICK ON UPDATE.");
		} catch (err) {
			toast.error(getError(err));
			dispatch({ type: "UPLOAD_FAIL", payload: getError(err) });
		}
	};

	const deleteFileHandler = async (fileName) => {
		setImages(images.filter((x) => x !== fileName));
		toast.success("IMAGE HAS BEEN REMOVED. NOW, CLICK ON UPDATE.");
	};

	const createHandler = async () => {
		if (window.confirm("Send Request, Confirm?")) {
			try {
				dispatch({ type: "CREATE_REQUEST" });
				const data = await RequestHandler.handleRequest(
					"post",
					"custom",
					{ headers: { Authorization: `Bearer ${userInfo.token}` } }
				);
				toast.success("Request Customize Success!");
				dispatch({ type: "CREATE_SUCCESS" });
				navigate(`/`);
			} catch (err) {
				toast.error(getError(error));
				dispatch({
					type: "CREATE_FAIL",
				});
			}
		}
	};

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
			{loadingCreate && <LoadingBox></LoadingBox>}

			{loading ? (
				<LoadingBox></LoadingBox>
			) : error ? (
				<MessageBox variant="danger">{error}</MessageBox>
			) : (
				<div
					style={{
						display: "flex",
						justifyContent: "space-evenly",
						flexDirection: "row",
					}}
				>
					<Form onSubmit={submitHandler}>
						<Form.Group className="mb-3" controlId="name">
							<Form.Label>Name</Form.Label>
							<Form.Control
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3" controlId="name">
							<Form.Label>Name</Form.Label>
							<Form.Control
								value={lastname}
								onChange={(e) => setLastName(e.target.value)}
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3" controlId="image">
							<Form.Label>Image</Form.Label>
							<Form.Control
								value={image}
								onChange={(e) => setImage(e.target.value)}
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3" controlId="imageFile">
							<Form.Label>Upload Image</Form.Label>
							<Form.Control
								type="file"
								onChange={uploadFileHandler}
							/>
							{loadingUpload && <LoadingBox></LoadingBox>}
						</Form.Group>

						<Form.Group
							className="mb-3"
							controlId="additionalImage"
						>
							<Form.Label>Additional Images</Form.Label>
							{images.length === 0 && (
								<MessageBox>No Other Images Yet</MessageBox>
							)}
							<ListGroup>
								{images.map((x) => (
									<ListGroup.Item key={x}>
										{x}
										<Button
											variant="light"
											onClick={() => deleteFileHandler(x)}
										>
											<i className="fa fa-times-circle"></i>
										</Button>
									</ListGroup.Item>
								))}
							</ListGroup>

							<Form.Group
								className="mb-3"
								controlId="additionalImageFile"
							>
								<Form.Label>Upload Additional Image</Form.Label>
								<Form.Control
									type="file"
									onChange={(e) => uploadFileHandler(e, true)}
								/>
								{loadingUpload && <LoadingBox></LoadingBox>}
							</Form.Group>
						</Form.Group>

						<Form.Group className="mb-3" controlId="description">
							<Form.Label>Description</Form.Label>
							<Form.Control
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								required
							/>
						</Form.Group>

						<div className="mb-3">
							<Button type="submit">SEND</Button>
							{loadingUpdate && <LoadingBox></LoadingBox>}
						</div>
					</Form>
				</div>
			)}
		</div>
	);
}
