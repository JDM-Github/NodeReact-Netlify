import React, { useContext, useEffect, useState, useReducer } from "react";
import CheckoutSteps from "../components/CheckoutSteps";
import { Helmet } from "react-helmet-async";
import { Form, Button, Spinner } from "react-bootstrap";
import { Store } from "../Store";
import { useNavigate } from "react-router-dom";
import qrCodeImage from "../../src/images/qr_code.jpg";
import RequestHandler from "../functions/RequestHandler";

import { Card, Col, Row } from "react-bootstrap";
import { ListGroup } from "react-bootstrap";
import { toast } from "react-toastify";
import LoadingBox from "../components/LoadingBox";
import getError from "../utils";

function reducer(state, action) {
	switch (action.type) {
		case "CREATE_REQUEST":
			return { ...state, loading: true };
		case "CREATE_SUCCESS":
			return { ...state, loading: false };
		case "CREATE_FAIL":
			return { ...state, loading: false };
		default:
			return;
	}
}

function PaymentMethodScreen() {
	const navigate = useNavigate();
	const [{ loading }, dispatch] = useReducer(reducer, { loading: false });
	const { state, dispatch: ctxDispatch } = useContext(Store);
	// const {
	// 	cart: { shippingAddress, paymentMethod },
	// } = state;

	const {
		cart,
		userInfo,
		cart: { shippingAddress },
	} = state;

	const [paymentMethodName, setPaymentMethod] = useState("GCash");
	const [referenceNumber, setReferenceNumber] = useState("");
	const [paymentImage, setPaymentImage] = useState(null);
	const [isLoading, setIsLoading] = useState(false); // For loading state
	const [error, setError] = useState(""); // For handling errors

	const updateCartHandler = async (item, quantity) => {
		const data = await RequestHandler.handleRequest(
			"get",
			`products/${item.id}`
		);
		if (data.countInStock < quantity) {
			window.alert("SORRY. PRODUCT IS OUT OF STOCK");
			return;
		}

		ctxDispatch({
			type: "CART_ADD_ITEM",
			payload: { ...item, quantity },
		});
	};

	const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; //123.1236 => 123.23 round off the number
	cart.itemsPrice = round2(
		cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
	);
	cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10);
	cart.taxPrice = round2(0.5 * (cart.itemsPrice + cart.shippingPrice));
	cart.totalPrice = cart.itemsPrice + cart.shippingPrice;

	const handleImageUpload = async (event) => {
		const file = event.target.files[0];
		if (!file) return;
		try {
			const filename = await uploadPaymentImage(file);
			ctxDispatch({ type: "SET_PAYMENT_IMAGE", payload: filename });
			toast.success("Payment image uploaded successfully.");
		} catch (error) {
			toast.error("Error uploading image.");
		}
	};

	const uploadPaymentImage = async (file) => {
		const formData = new FormData();
		formData.append("image", file);

		const data = await RequestHandler.handleRequest(
			"post",
			"uploadImage",
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		);
		return data.filename; // Assume the server returns the filename or URL.
	};

	const placeOrderHandler = async () => {
		try {
			dispatch({ type: "CREATE_REQUEST" });

			if (!cart.paymentImage) {
				throw new Error("No payment image available.");
			}

			const data = await RequestHandler.handleRequest(
				"post",
				"orders",
				{
					orderItems: cart.cartItems,
					shippingAddress: cart.shippingAddress,
					paymentMethodName: cart.paymentMethodName,
					referenceNumber: cart.referenceNumber,
					paymentImage: cart.paymentImage, // Make sure this is set
					itemsPrice: cart.itemsPrice,
					shippingPrice: cart.shippingPrice,
					taxPrice: cart.taxPrice,
					totalPrice: cart.totalPrice,
				},
				{
					headers: {
						authorization: `Bearer ${userInfo.token}`,
					},
				}
			);

			ctxDispatch({ type: "CART_CLEAR" });
			dispatch({ type: "CREATE_SUCCESS" });
			localStorage.removeItem("cartItems");
			navigate(`/order/${data.order.id}`);
		} catch (err) {
			dispatch({ type: "CREATE_FAIL" });
			toast.error(getError(err));
		}
	};

	useEffect(() => {
		if (!cart.paymentMethodName) {
			navigate("/payment");
		}
	}, [cart, navigate]);

	useEffect(() => {
		if (!shippingAddress.address) {
			navigate("/shipping");
		}
	}, [shippingAddress, navigate]);
	const formatReferenceNumber = (input) => {
		// Remove non-digit characters
		const cleaned = input.replace(/\D/g, "");

		// Limit to 13 digits
		const limited = cleaned.slice(0, 13);

		// Format as '0000 000 000000'
		const formatted = limited.replace(
			/(\d{4})(\d{0,3})(\d{0,6})/,
			(match, p1, p2, p3) => {
				return `${p1}${p2 ? " " + p2 : ""}${p3 ? " " + p3 : ""}`;
			}
		);

		return formatted.trim();
	};
	const submitHandler = async (e) => {
		e.preventDefault();

		// Check if the reference number is 13 digits
		const cleanedReferenceNumber = referenceNumber.replace(/\D/g, "");
		if (cleanedReferenceNumber.length !== 13) {
			alert("Please enter a complete 13-digit GCash reference number.");
			return;
		}

		if (!paymentImage) {
			alert("Please provide a payment screenshot.");
			return;
		}

		setIsLoading(true);

		try {
			const formData = new FormData();
			formData.append("image", paymentImage);
			formData.append("paymentMethod", paymentMethodName);
			formData.append("referenceNumber", referenceNumber);

			const params = {};
			for (let [key, value] of formData.entries()) params[key] = value;

			const data = await RequestHandler.handleRequest(
				"post",
				"uploadImage",
				params,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);

			const uploadedPaymentImage = data.filename;
			ctxDispatch({
				type: "SAVE_PAYMENT_METHOD",
				payload: {
					paymentMethodName,
					referenceNumber,
					paymentImage: uploadedPaymentImage,
				},
			});

			localStorage.setItem(
				"paymentMethod",
				JSON.stringify({
					paymentMethodName,
					referenceNumber,
					paymentImage: uploadedPaymentImage,
				})
			);

			setTimeout(() => {
				navigate("/placeorder");
			}, 1000);
		} catch (error) {
			console.error("Error uploading payment image:", error);
			setError("Failed to upload payment image. Please try again.");
			setIsLoading(false);
		}
	};

	const handleFileUpload = (e) => {
		setPaymentImage(e.target.files[0]);
	};

	return (
		<div>
			<CheckoutSteps step1 step2 step3 />
			<div className="container small-container">
				<Helmet>
					<title>Payment Method</title>
				</Helmet>
				<h1 style={{ marginTop: "20px" }}>Payment Method</h1>
				<Form onSubmit={submitHandler}>
					<div className="mb-3">
						<Form.Check
							type="radio"
							label="GCash"
							id="GCash"
							value="GCash"
							checked={paymentMethodName === "GCash"}
							onChange={() => setPaymentMethod("GCash")}
						/>
					</div>
					<div className="mb-3">
						<Form.Group controlId="referenceNumber">
							<Form.Label>GCash Reference Number</Form.Label>
							<Form.Control
								type="text"
								placeholder="Enter GCash reference number"
								value={referenceNumber}
								onChange={(e) =>
									setReferenceNumber(
										formatReferenceNumber(e.target.value)
									)
								}
								required
								maxLength={16} // Set max length to account for spaces
							/>
						</Form.Group>
					</div>
					<div className="mb-3">
						<Form.Group controlId="paymentImage">
							<Form.Label>Upload Payment Screenshot</Form.Label>
							<Form.Control
								type="file"
								onChange={handleFileUpload}
								accept="image/*"
								required
							/>
						</Form.Group>
					</div>
					{error && <div style={{ color: "red" }}>{error}</div>}
					<div className="mb-3">
						<Button
							type="submit"
							variant="primary"
							disabled={isLoading}
						>
							{isLoading ? (
								<Spinner
									as="span"
									animation="border"
									size="sm"
								/>
							) : (
								"Continue"
							)}
						</Button>
					</div>
				</Form>
				<Col
					style={{
						position: "absolute",
						top: "150px",
						left: "80px",
						width: "20%", // Adjust size as needed
						height: "60%", // Adjust size as needed
					}}
				>
					<Card>
						<Card.Body>
							<Card.Title>Order Summary</Card.Title>
							<ListGroup variant="flush">
								<ListGroup.Item>
									<Row>
										<Col>Items</Col>
										<Col>₱{cart.itemsPrice.toFixed(2)}</Col>
									</Row>
								</ListGroup.Item>
								<ListGroup.Item>
									<Row>
										<Col>Shipping</Col>
										<Col>
											₱{cart.shippingPrice.toFixed(2)}
										</Col>
									</Row>
								</ListGroup.Item>
								<ListGroup.Item>
									<Row>
										<Col>Down Payment</Col>
										<Col>₱{cart.taxPrice.toFixed(2)}</Col>
									</Row>
								</ListGroup.Item>
								<ListGroup.Item>
									<Row>
										<Col>
											<strong>Order Total</strong>
										</Col>
										<Col>
											<strong>
												₱{cart?.totalPrice?.toFixed(2)}
											</strong>
										</Col>
									</Row>
								</ListGroup.Item>
							</ListGroup>
						</Card.Body>
					</Card>
				</Col>
				<img
					src={qrCodeImage}
					alt="QR Code"
					style={{
						position: "absolute",
						top: "170px",
						right: "120px",
						width: "20%", // Adjust size as needed
						height: "60%", // Adjust size as needed
					}}
				/>
			</div>
		</div>
	);
}

export default PaymentMethodScreen;
