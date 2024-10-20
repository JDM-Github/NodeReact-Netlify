import React, { useContext, useEffect, useReducer, useState } from "react";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Store } from "../Store";
import { Link, useNavigate, useParams } from "react-router-dom";
import getError from "../utils";
import { Helmet } from "react-helmet-async";
import { Modal } from "react-bootstrap";
import { Button, Card, Col, ListGroup, Row } from "react-bootstrap";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { toast } from "react-toastify";
import RequestHandler from "../functions/RequestHandler";

function reducer(state, action) {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true, error: "" };
		case "FETCH_SUCCESS":
			return {
				...state,
				loading: false,
				order: action.payload,
				error: "",
			};
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };

		case "PAY_REQUEST":
			return { ...state, loadingPay: true };
		case "PAY_SUCCESS":
			return { ...state, loadingPay: false, successPay: true };
		case "PAY_FAIL":
			return { ...state, loadingPay: false };
		case "PAY_RESET":
			return { ...state, loadingPay: false, successPay: false };

		case "DELIVER_REQUEST":
			return { ...state, loadingDeliver: true };
		case "DELIVER_SUCCESS":
			return { ...state, loadingDeliver: false, successDeliver: true };
		case "DELIVER_FAIL":
			return { ...state, loadingDeliver: false };
		case "DELIVER_RESET":
			return { ...state, loadingDeliver: false, successDeliver: false };
		default:
			return state;
	}
}

function OrderScreen() {
	const { state } = useContext(Store);
	const { userInfo } = state;
	const params = useParams();
	const { id: orderId } = params;
	const navigate = useNavigate();
	const [showPaymentInfo, setShowPaymentInfo] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [selectedImage, setSelectedImage] = useState("");
	const [
		{
			loading,
			error,
			order,
			successPay,
			loadingPay,
			loadingDeliver,
			successDeliver,
		},
		dispatch,
	] = useReducer(reducer, {
		loading: true,
		order: {},
		error: "",
		successPay: false,
		loadingPay: false,
	});

	const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
	const [proofOfDeliveryImage, setProofOfDeliveryImage] = useState(null);
	const [loadingUpload, setLoadingUpload] = useState(false);
	const [showTransactionModal, setShowTransactionModal] = useState(false);
	const [transactionDetails, setTransactionDetails] = useState({});
	const handleViewTransactionHistory = () => {
		setTransactionDetails({
			name: order.shippingAddress.fullName,
			lastName: order.shippingAddress.LastName,
			address: `${order.shippingAddress.address}, ${order.shippingAddress.city}`,
			phone: order.shippingAddress.postalCode,
			deliveredAt: order.deliveredAt,
			paymentMethod: order.paymentMethodName,
			paidAt: order.paidAt,
			paymentImage: order.paymentImage,
			deliveryImage: order.deliveryImage,
			proofOfDeliveryImage: order.proofOfDeliveryImage, // Assuming this exists in your order
		});
		setShowTransactionModal(true);
	};

	const handleImageChange = (e) => {
		setProofOfDeliveryImage(e.target.files[0]); // Store the selected file
	};
	// async function deliverOrderHandler() {
	//   if (!proofOfDeliveryImage) {
	//     toast.error('Please upload proof of delivery.');
	//     return;
	//   }

	//   const formData = new FormData();
	//   formData.append('image', proofOfDeliveryImage); // Add the image to form data

	//   try {
	//     setLoadingUpload(true);
	//     const data = await RequestHandler.handleRequest("put",
	//       `orders/${order.id}/deliver`, // Modify this backend route to handle image upload
	//       formData,
	//       { headers: { authorization: `Bearer ${userInfo.token}`, 'Content-Type': 'multipart/form-data' } }
	//     );

	//     dispatch({ type: 'DELIVER_SUCCESS' });
	//     toast.success('Order delivered successfully!');
	//   } catch (err) {
	//     toast.error(getError(err));
	//     dispatch({ type: 'DELIVER_FAIL' });
	//   } finally {
	//     setLoadingUpload(false);
	//   }
	// }
	async function deliverOrderHandler() {
		if (!proofOfDeliveryImage) {
			toast.error("Please upload proof of delivery.");
			return;
		}

		const formData = new FormData();
		formData.append("image", proofOfDeliveryImage);

		try {
			setLoadingUpload(true);
			const data = await RequestHandler.handleRequest(
				"put",
				`orders/${order.id}/deliver`,
				formData,
				{
					headers: {
						authorization: `Bearer ${userInfo.token}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);

			dispatch({ type: "DELIVER_SUCCESS", payload: data });
			toast.success("Order delivered successfully!");
		} catch (err) {
			toast.error(getError(err));
			dispatch({ type: "DELIVER_FAIL" });
		} finally {
			setLoadingUpload(false);
		}
	}

	function createOrder(data, actions) {
		return actions.order
			.create({
				purchase_units: [{ amount: { value: order.totalPrice * 0.5 } }],
			})

			.then((orderID) => {
				return orderID;
			});
	}
	async function confirmPaymentHandler() {
		try {
			dispatch({ type: "PAY_REQUEST" });
			const data = await RequestHandler.handleRequest(
				"put",
				`orders/${order.id}/confirmPayment`,
				{},
				{ headers: { authorization: `Bearer ${userInfo.token}` } }
			);
			dispatch({ type: "PAY_SUCCESS", payload: data });
			toast.success("Payment confirmed successfully!");
		} catch (err) {
			toast.error(getError(err));
			dispatch({ type: "PAY_FAIL" });
		}
	}

	function onApprove(data, actions) {
		return actions.order.capture().then(async function (details) {
			try {
				dispatch({ type: "PAY_REQUEST" });
				const data = await RequestHandler.handleRequest(
					"put",
					`orders/${order.id}/pay`,
					details,
					{ headers: { authorization: `Bearer ${userInfo.token}` } }
				);
				dispatch({ type: "PAY_SUCCESS", payload: data });
				toast.success("ORDER IS PAID");
			} catch (err) {
				dispatch({ type: "PAY_FAIL", payload: getError(err) });
				toast.error(getError(err));
			}
		});
	}

	function onError(err) {
		toast.error(getError(err));
	}

	useEffect(() => {
		const fetchOrder = async () => {
			try {
				dispatch({ type: "FETCH_REQUEST" });
				const data = await RequestHandler.handleRequest(
					"get",
					`orders/${orderId}`,
					{
						headers: { authorization: `Bearer ${userInfo.token}` },
					}
				);

				dispatch({ type: "FETCH_SUCCESS", payload: data });
			} catch (err) {
				dispatch({ type: "FETCH_FAIL", payload: getError(err) });
			}
		};

		if (!userInfo) {
			return navigate("/login");
		}
		if (
			!order.id ||
			successPay ||
			successDeliver ||
			(order.id && order.id !== orderId)
		) {
			fetchOrder();
			if (successPay) {
				dispatch({ type: "PAY_RESET" });
			}
			if (successDeliver) {
				dispatch({ type: "DELIVER_RESET" });
			}
		} else {
			const loadPayPalScript = async () => {
				const { data: clientId } = await RequestHandler.handleRequest(
					"get",
					"keys/paypal",
					{
						header: { authorization: `Bearer ${userInfo.token}` },
					}
				);
				paypalDispatch({
					type: "resetOptions",
					value: {
						"client-id": clientId,
						currency: "PHP",
					},
				});
				paypalDispatch({ type: "setLoadingStatus", value: "pending" });
			};
			loadPayPalScript();
		}
	}, [
		order,
		userInfo,
		orderId,
		navigate,
		paypalDispatch,
		successPay,
		successDeliver,
	]);

	// Function to handle image click and show modal
	const handleImageClick = (imageSrc) => {
		setSelectedImage(imageSrc);
		setShowModal(true);
	};
	// async function deliverOrderHandler() {
	//   try {
	//     dispatch({type:'DELIVER_REQUEST'})
	//     const {data} = await RequestHandler.handleRequest("put",
	//       `orders/${order.id}/deliver`, {},
	//       {headers: {authorization: `Bearer ${userInfo.token}`}}
	//     );

	//     dispatch({type:'DELIVER_SUCCESS'})
	//     toast.success('ORDER IS BEING DELIVERED')
	//   } catch (err) {
	//     toast.error(getError(err));
	//     dispatch({type:'DELIVER_FAIL'})
	//   }
	// }

	return loading ? (
		<LoadingBox></LoadingBox>
	) : error ? (
		<MessageBox variant="danger">{error}</MessageBox>
	) : (
		<div
			style={
				userInfo.isAdmin || userInfo.isRider
					? {
							position: "absolute",
							top: "0",
							left: "20vw",
							width: "80vw",
							padding: "20px",
							boxSizing: "border-box",
					  }
					: {}
			}
		>
			<Helmet>
				<title>Order: {orderId}</title>
			</Helmet>
			<h1 className="my-3">Order ID: {orderId}</h1>
			<Row>
				<Col md={8}>
					{/* FIRST-CARD    FIRST-CARD    FIRST-CARD    FIRST-CARD */}
					<Card className="mb-3">
						<Card.Body>
							<Card.Title>
								Shipping and Customer Information
							</Card.Title>
							<Card.Text>
								<strong>Name: </strong>
								{order.shippingAddress.fullName} <br />
								<strong>Last Name: </strong>
								{order.shippingAddress.LastName} <br />
								<strong>Address: </strong>{" "}
								{order.shippingAddress.address},
								{order.shippingAddress.city} <br />
								<strong>Phone Number: </strong>
								{order.shippingAddress.postalCode}
							</Card.Text>
							{order.isDelivered ? (
								<MessageBox variant="success">
									Delivered At: {order.deliveredAt}
								</MessageBox>
							) : (
								<MessageBox variant="danger">
									Parcel Not Delivered
								</MessageBox>
							)}
						</Card.Body>
					</Card>

					{/* SECOND-CARD    SECOND-CARD    SECOND-CARD    SECOND-CARD */}
					<Card className="mb-3">
						<Card.Body>
							<Card.Title>Payment</Card.Title>
							<Card.Text>
								<strong>Method: </strong>
								{order.paymentMethodName}
							</Card.Text>
							{order.isPaid ? (
								<MessageBox variant="success">
									Paid At: {order.paidAt}
								</MessageBox>
							) : (
								<MessageBox variant="danger">
									Not Yet Paid
								</MessageBox>
							)}
						</Card.Body>
					</Card>

					{/* THIRD-CARD    THIRD-CARD    THIRD-CARD    THIRD-CARD */}
					<Card className="mb-3">
						<Card.Body>
							<Card.Title>Items</Card.Title>
							<ListGroup variant="flush">
								{order.orderItems.map((item) => (
									<ListGroup.Item key={item.id}>
										<Row
											style={{
												display: "flex",
												alignItems: "center",
											}}
										>
											<Col md={6}>
												<img
													src={item.image}
													alt={item.name}
													className="img-fluid rounded img-thumbnail"
												/>{" "}
												<Link
													to={`/product/${item.slug}`}
													style={{
														textDecoration: "none",
														color: "Black",
													}}
												>
													{item.name}
												</Link>
											</Col>

											<Col md={3}>
												<span>{item.quantity}</span>
											</Col>
											<Col md={3}>
												₱{item.price.toFixed(2)}
											</Col>
										</Row>
									</ListGroup.Item>
								))}
							</ListGroup>
						</Card.Body>
					</Card>
				</Col>

				<Col md={4}>
					<Card className="mb-3">
						<Card.Body>
							<Card.Title>Order Summary</Card.Title>
							<ListGroup variant="flush">
								<ListGroup.Item>
									<Row>
										<Col>Items</Col>
										<Col>
											₱{order.itemsPrice.toFixed(2)}
										</Col>
									</Row>
								</ListGroup.Item>

								<ListGroup.Item>
									<Row>
										<Col>Shipping</Col>
										<Col>
											₱{order.shippingPrice.toFixed(2)}
										</Col>
									</Row>
								</ListGroup.Item>

								<ListGroup.Item>
									<Row>
										<Col>Down Payment</Col>
										<Col>₱{order.taxPrice.toFixed(2)}</Col>
									</Row>
								</ListGroup.Item>

								<ListGroup.Item>
									<Row>
										<Col>
											<strong>Order Total</strong>
										</Col>
										<Col>
											<strong>
												₱{order.totalPrice.toFixed(2)}
											</strong>
										</Col>
									</Row>
								</ListGroup.Item>

								{/* {!order.isPaid && ( // this is called a Conditional Rendering
                    <ListGroup.Item>
                      {isPending 
                        ? (<LoadingBox/>)
                        : (<div>
                            <PayPalButtons
                              createOrder={createOrder} // this runs when paypal button is clicked
                              onApprove={onApprove} // this runs when you have successful payment to update status of the order in the backend
                              onError={onError} // this runs when there is error in paying of order
                              > </PayPalButtons>
                          </div>)
                      }
                      {loadingPay && <LoadingBox/>}
                    </ListGroup.Item>
                  )}
                  {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                    <ListGroup.Item>
                      {loadingDeliver && <LoadingBox></LoadingBox>}
                      <div className="d-grid">
                        <Button type='Button'
                          onClick={deliverOrderHandler}>
                            Deliver Order
                          </Button>
                      </div>
                    </ListGroup.Item>
                  )} */}
								{order.isPaid && order.isDelivered && (
									<ListGroup.Item>
										<div className="d-grid">
											<Button
												type="button"
												onClick={
													handleViewTransactionHistory
												}
											>
												View Transaction History
											</Button>
										</div>
									</ListGroup.Item>
								)}
								{!order.isPaid && (
									<ListGroup.Item>
										<div className="d-grid">
											{userInfo.isRider ? (
												<Button
													type="button"
													onClick={() =>
														navigate(
															"/admin/orders"
														)
													}
												>
													Go to Order List
												</Button>
											) : userInfo.isAdmin ? (
												<Button
													type="button"
													onClick={() =>
														setShowPaymentInfo(true)
													}
												>
													Check Payment Info
												</Button>
											) : (
												<Button
													type="button"
													onClick={() =>
														navigate(
															"/orderhistory"
														)
													}
												>
													Check Payment History
												</Button>
											)}
										</div>
									</ListGroup.Item>
								)}

								{userInfo.isAdmin &&
									showPaymentInfo &&
									(console.log(
										"isAdmin is true:",
										userInfo.isAdmin
									),
									(
										<ListGroup.Item>
											{/* Show payment reference number and image */}
											<Card className="mb-3">
												<Card.Body>
													<Card.Title>
														Payment Information
													</Card.Title>
													<Card.Text>
														<strong>
															Reference Number:
														</strong>{" "}
														{order.referenceNumber}{" "}
														<br />
														<strong>
															Proof of Payment:
														</strong>
														<br />
														<img
															src={`${order.paymentImage}`}
															alt="Payment Image"
															style={{
																maxWidth:
																	"100px",
															}}
															onClick={() =>
																handleImageClick(
																	order.paymentImage
																)
															}
														/>
													</Card.Text>
													{!order.isPaid ? (
														<div className="d-grid">
															{/* Button to confirm payment */}
															<Button
																type="button"
																onClick={
																	confirmPaymentHandler
																}
															>
																Confirm Payment
															</Button>
														</div>
													) : null}
												</Card.Body>
											</Card>
										</ListGroup.Item>
									))}

								{userInfo.isRider &&
									order.isPaid &&
									!order.isDelivered &&
									(console.log(
										"isRider is true:",
										userInfo.isRider
									),
									(
										<ListGroup.Item>
											{loadingDeliver && <LoadingBox />}
											<div className="d-grid">
												{/* File input for proof of delivery */}
												<input
													type="file"
													onChange={handleImageChange}
													accept="image/*"
												/>
												{loadingUpload && (
													<LoadingBox />
												)}{" "}
												<ListGroup.Item>
													{/* Show payment reference number and image */}
													<Card className="mb-3">
														<Card.Body>
															<Card.Text>
																<strong>
																	Proof of
																	Delievery:
																</strong>
																<br />
																{proofOfDeliveryImage ? (
																	<img
																		src={`${URL.createObjectURL(
																			proofOfDeliveryImage
																		)}`}
																		alt="Payment Image"
																		style={{
																			maxWidth:
																				"100px",
																		}}
																		onClick={() =>
																			handleImageClick(
																				URL.createObjectURL(
																					proofOfDeliveryImage
																				)
																			)
																		}
																	/>
																) : null}
															</Card.Text>
															{!order.isPaid ? (
																<div className="d-grid">
																	{/* Button to confirm payment */}
																	<Button
																		type="button"
																		onClick={
																			confirmPaymentHandler
																		}
																	>
																		Confirm
																		Payment
																	</Button>
																</div>
															) : null}
														</Card.Body>
													</Card>
												</ListGroup.Item>
												{/* Loading indicator for the file upload */}
												<Button
													type="Button"
													onClick={
														deliverOrderHandler
													}
													disabled={
														!proofOfDeliveryImage
													}
												>
													Deliver Order
												</Button>
											</div>
										</ListGroup.Item>
									))}
							</ListGroup>
						</Card.Body>
					</Card>
				</Col>
			</Row>
			<Modal show={showModal} onHide={() => setShowModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>Receipt</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<img
						src={`${selectedImage}`}
						alt="Zoomed"
						className="img-fluid"
					/>
				</Modal.Body>
			</Modal>
			<Modal
				show={showTransactionModal}
				onHide={() => setShowTransactionModal(false)}
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title>Transaction Summary</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<h5>Shipping and Customer Information</h5>
					<p>
						<strong>Name:</strong> {transactionDetails.name} <br />
						<strong>Last Name:</strong>{" "}
						{transactionDetails.lastName} <br />
						<strong>Address:</strong> {transactionDetails.address}{" "}
						<br />
						<strong>Phone Number:</strong>{" "}
						{transactionDetails.phone}
					</p>
					<p>
						<strong>Delivered At:</strong>{" "}
						{transactionDetails.deliveredAt}
					</p>
					<h5>Payment</h5>
					<p>
						<strong>Method:</strong>{" "}
						{transactionDetails.paymentMethod} <br />
						<strong>Paid At:</strong> {transactionDetails.paidAt}
					</p>
					<h5>Proof of Payment</h5>
					<img
						src={`${transactionDetails.paymentImage}`}
						alt="Proof of Payment"
						style={{ maxWidth: "100px" }}
					/>
					<h5>Proof of Delivery</h5>

					<img
						src={`${transactionDetails.proofOfDeliveryImage}`}
						alt="Proof of Delivery"
						style={{ maxWidth: "100px" }}
					/>
				</Modal.Body>
			</Modal>
		</div>
	);
}

export default OrderScreen;
