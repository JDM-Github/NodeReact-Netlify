import React, { useContext, useEffect, useReducer, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Store } from "../Store";
import { getError } from "../utils";
import Container from "react-bootstrap/Container";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Button from "react-bootstrap/Button";
import RequestHandler from "../functions/RequestHandler";
const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true };
		case "FETCH_SUCCESS":
			return { ...state, loading: false };
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };

		case "UPDATE_REQUEST":
			return { ...state, loadingUpdate: true };
		case "UPDATE_SUCCESS":
			return { ...state, loadingUpdate: false };
		case "UPDATE_FAIL":
			return { ...state, loadingUpdate: false };

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
		default:
			return state;
	}
};

function ProductEditScreen() {
	const navigate = useNavigate();
	const params = useParams();
	const { id: productId } = params;
	const { state } = useContext(Store);
	const { userInfo } = state;

	const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
		useReducer(reducer, {
			loading: true,
			error: "",
		});

	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [price, setPrice] = useState("");
	const [image, setImage] = useState("");
	const [images, setImages] = useState([]);
	const [category, setCategory] = useState("");
	const [countInStock, setCountInStock] = useState("0");
	const [brand, setBrand] = useState("");
	const [description, setDescription] = useState("");

	useEffect(() => {
		const fetchData = async () => {
			try {
				dispatch({ type: "FETCH_REQUEST" });
				const data = await RequestHandler.handleRequest(
					"get",
					`products/${productId}`
				);

				setName(data.name);
				setSlug(data.slug);
				setPrice(data.price);
				setImage(data.image);
				setImages(data.images ?? []);
				setCategory(data.category);
				setCountInStock(data.countInStock);
				setBrand(data.brand);
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
	}, [productId]);

	const submitHandler = async (e) => {
		e.preventDefault();
		try {
			dispatch({ type: "UPDATE_REQUEST" });
			await RequestHandler.handleRequest(
				"put",
				`products/${productId}`,
				{
					id: productId,
					name,
					slug,
					price,
					image,
					images,
					category,
					brand,
					countInStock,
					description,
				},
				{ headers: { Authorization: `Bearer ${userInfo.token}` } }
			);
			dispatch({ type: "UPDATE_SUCCESS" });
			toast.success("UPDATE SUCCESSFUL");
			navigate("/admin/products");
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
			const data = await RequestHandler.handleRequest(
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
				setImages([...images, data]);
			} else {
				setImage(data);
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

	return (
		<Container className="small-container">
			<Helmet>
				<title>Edit Product ${productId}</title>
			</Helmet>
			<h1>Edit Product {productId}</h1>

			{loading ? (
				<LoadingBox></LoadingBox>
			) : error ? (
				<MessageBox></MessageBox>
			) : (
				<Form onSubmit={submitHandler}>
					<Form.Group className="mb-3" controlId="name">
						<Form.Label>Name</Form.Label>
						<Form.Control
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</Form.Group>

					<Form.Group className="mb-3" controlId="slug">
						<Form.Label>Slug</Form.Label>
						<Form.Control
							value={slug}
							onChange={(e) => setSlug(e.target.value)}
							required
						/>
					</Form.Group>

					<Form.Group className="mb-3" controlId="price">
						<Form.Label>Price</Form.Label>
						<Form.Control
							value={price}
							onChange={(e) => setPrice(e.target.value)}
							required
						/>
					</Form.Group>

					<Form.Group className="mb-3" controlId="image">
						<Form.Label>Image</Form.Label>
						<Form.Control
							value={image}
							onChange={(e) => setImage(e.target.value)}
							readOnly
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

					<Form.Group className="mb-3" controlId="additionalImage">
						<Form.Label>Additional Images</Form.Label>
						{images && images.length === 0 && (
							<MessageBox>No Other Images Yet</MessageBox>
						)}
						<ListGroup>
							{images.map((x) => (
								<ListGroup.Item
									key={x}
									style={{ display: "flex" }}
								>
									<Form.Control
										style={{ width: "90%" }}
										value={x}
										readOnly
									/>
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

					<Form.Group className="mb-3" controlId="category">
						<Form.Label>Category</Form.Label>
						<Form.Control
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							required
						/>
					</Form.Group>

					<Form.Group className="mb-3" controlId="brand">
						<Form.Label>Brand</Form.Label>
						<Form.Control
							value={brand}
							onChange={(e) => setBrand(e.target.value)}
							required
						/>
					</Form.Group>

					{/* <Form.Group className="mb-3" controlId="countInStock">
						<Form.Label>Count In Stock</Form.Label>
						<Form.Control
							value={countInStock}
							onChange={(e) => setCountInStock(e.target.value)}
							required
						/>
					</Form.Group> */}

					<Form.Group className="mb-3" controlId="description">
						<Form.Label>Description</Form.Label>
						<Form.Control
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							required
						/>
					</Form.Group>

					<div className="mb-3">
						<Button type="submit">UPDATE</Button>
						{loadingUpdate && <LoadingBox></LoadingBox>}
					</div>
				</Form>
			)}
		</Container>
	);
}

export default ProductEditScreen;
