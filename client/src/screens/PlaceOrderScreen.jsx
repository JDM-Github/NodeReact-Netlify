import React, { useContext, useEffect, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import { Card, Col, Row } from "react-bootstrap";
import { Store } from "../Store";
import { Link, useNavigate } from "react-router-dom";
import { ListGroup } from "react-bootstrap";
import CheckoutSteps from "../components/CheckoutSteps";
import { TextField, Typography, Button } from "@mui/material";
import { toast } from "react-toastify";
import Axios from "axios";
import LoadingBox from "../components/LoadingBox";
import getError from "../utils";
import axios from "axios";
import RequestHandler from "../functions/RequestHandler";

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

function PlaceOrderScreen() {
	const navigate = useNavigate();

	const [{ loading }, dispatch] = useReducer(reducer, { loading: false });

	const { state, dispatch: ctxDispatch } = useContext(Store);
	const {
		cart,
		userInfo,
		cart: { shippingAddress },
	} = state;

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
	cart.totalPrice = cart.itemsPrice + cart.shippingPrice; // + cart.taxPrice;

	// const placeOrderHandler = async () => {
	//   try{
	//     dispatch({type: 'CREATE_REQUEST'});

	//     const { data } = await Axios.post('/api/orders',
	//       {
	//         orderItems: cart.cartItems,
	//         shippingAddress: cart.shippingAddress,
	//         paymentMethodName: cart.paymentMethodName,
	//         referenceNumber: cart.referenceNumber,
	//         paymentImage: cart.paymentImage,
	//         itemsPrice: cart.itemsPrice,
	//         shippingPrice: cart.shippingPrice,
	//         taxPrice: cart.taxPrice,
	//         totalPrice: cart.totalPrice,
	//       },
	//       {
	//         headers: {
	//           authorization: `Bearer ${userInfo.token}`,
	//         },
	//       }
	//     );
	//     ctxDispatch({type: 'CART_CLEAR'}); // clears the cart after placing order
	//     dispatch({type: 'CREATE_SUCCESS'});
	//     localStorage.removeItem('cartItems');
	//     navigate(`/order/${data.order.id}`);
	//   }
	//   catch(err){
	//     dispatch({type: 'CREATE_FAIL'});
	//     toast.error(getError(err));
	//   }
	// };
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
		return data.filename;
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
					paymentImage: cart.paymentImage,
					itemsPrice: cart.itemsPrice,
					shippingPrice: cart.shippingPrice,
					taxPrice: cart.taxPrice,
					totalPrice: cart.totalPrice,
					userId: userInfo.id,
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

	return (
		<div>
			<CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
			<Helmet>
				<title>Preview Order</title>
			</Helmet>
			<h1 className="my-3">Review Order</h1>
			<Row>
				<Col md={8}>
					<Card className="mb-3">
						<Card.Body>
							<Card.Title>Shipping</Card.Title>
							<Card.Text>
								<strong>Name: </strong>
								{cart.shippingAddress.fullName}
								<br />
								<strong>Last Name: </strong>
								{cart.shippingAddress.LastName}
								<br />
								<strong>Address: </strong>
								{cart.shippingAddress.address},{" "}
								{cart.shippingAddress.city} <br />
								<strong>Phone Number: </strong>
								{cart.shippingAddress.postalCode}
							</Card.Text>
							<Link to="/shipping">
								<Button
									variant="outlined"
									sx={{
										border: "none",
										backgroundColor: "#f0c040",
										color: "black",
									}}
								>
									EDIT
								</Button>
							</Link>
						</Card.Body>
					</Card>

					<Card className="mb-3">
						<Card.Body>
							<Card.Title>Payment</Card.Title>
							<Card.Text>
								<strong>Method: </strong>
								{cart.paymentMethodName} <br />
								<strong>Reference Number: </strong>
								{cart.referenceNumber} <br />
								{cart.paymentImage && (
									<>
										<strong>Payment Image: </strong>
										<br></br>
										<img
											src={cart.paymentImage}
											alt="Payment Image"
											style={{ maxWidth: "100px" }}
										/>
									</>
								)}
							</Card.Text>
							<Link to="/payment">
								<Button
									variant="outlined"
									sx={{
										border: "none",
										backgroundColor: "#f0c040",
										color: "black",
									}}
								>
									EDIT
								</Button>
							</Link>
						</Card.Body>
					</Card>

					<Card className="mb-3">
						<Card.Body>
							<Card.Title>Items</Card.Title>
							<ListGroup variant="flush">
								{cart.cartItems.map((item) => (
									<ListGroup.Item key={item.id} style={{}}>
										<Row>
											<Col md={6}>
												<img
													src={item.image}
													alt={item.name}
													className="img-fluid rounded img-thumbnail"
												/>{" "}
												<Typography>
													{item.name}
												</Typography>
											</Col>
											<div
												className="card"
												style={{
													paddingBottom: "5px",
													paddingTop: "5px",
													gap: "5px",
													display: "flex",
													alignItems: "center",
													flexDirection: "row",
												}}
											>
												<Button
													variant="light"
													disabled={
														item.quantity === 1
													}
													onClick={() =>
														updateCartHandler(
															item,
															item.quantity - 1
														)
													}
												>
													<i className="fas fa-minus-circle"></i>
													{/*MINUS ITEM*/}
												</Button>

												<Col
													md={3}
													style={{
														display: "flex",
														justifyContent:
															"center",
													}}
												>
													{item.quantity}
												</Col>

												<Button
													variant="light"
													disabled={
														item.quantity ===
														item.countInStock
													}
													onClick={() =>
														updateCartHandler(
															item,
															item.quantity + 1
														)
													}
												>
													<i className="fas fa-plus-circle"></i>
													{/*ADD ITEM*/}
												</Button>
											</div>

											<Col md={3}>
												₱
												{(
													item.price * item.quantity
												).toFixed(2)}
											</Col>
										</Row>
									</ListGroup.Item>
								))}
							</ListGroup>
							{/* <Link to="/cart">
                  <Button
                    variant="outlined"
                      sx={{border: "none", backgroundColor:"#f0c040", color:"black"}}>
                  EDIT
                  </Button>
                  </Link> */}
						</Card.Body>
					</Card>
				</Col>

				<Col>
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
								<ListGroup.Item
									style={{
										display: "flex",
										justifyContent: "center",
										marginTop: "10px",
									}}
								>
									<div className="d-grid">
										<button
											className="fancy"
											type="button"
											onClick={placeOrderHandler}
											disabled={
												cart.cartItems.length === 0
											}
											variant="outlined"
											sx={{
												border: "none",
												backgroundColor: "#f0c040",
												color: "black",
											}}
										>
											<span className="top-key"></span>
											<span className="text">
												PLACE ORDER
											</span>
											<span className="bottom-key-1"></span>
											<span className="bottom-key-2"></span>
										</button>
									</div>
									{loading && <LoadingBox />}
								</ListGroup.Item>
							</ListGroup>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</div>
	);
}

export default PlaceOrderScreen;
