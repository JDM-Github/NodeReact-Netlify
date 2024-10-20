import React, { useContext } from "react";
import { Store } from "../Store";
import { Helmet } from "react-helmet-async";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import MessageBox from "../components/MessageBox";
import { Link, useNavigate } from "react-router-dom";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/esm/Button";
import Card from "react-bootstrap/Card";
import axios from "axios";
import RequestHandler from "../functions/RequestHandler";

function CartScreen() {
	const navigate = useNavigate();
	const { state, dispatch: ctxDispatch } = useContext(Store);
	const {
		cart: { cartItems },
	} = state;
	const { userInfo } = state;
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
	const removeItemHandler = (item) => {
		ctxDispatch({ type: "CART_REMOVE_ITEM", payload: item });
	};
	const checkoutHandler = () => {
		navigate("/signin?redirect=/shipping");
	};

	return (
		<div>
			<Helmet>
				<title>Shopping Cart</title>
			</Helmet>
			<h1>Shopping Bag</h1>
			<Row>
				<Col md={8}>
					{cartItems.length === 0 ? (
						<MessageBox>
							CART IS EMPTY <Link to="/search">Go To Shop</Link>
						</MessageBox>
					) : (
						<ListGroup>
							{cartItems.map((item) => (
								<ListGroup.Item key={item.id}>
									<Row className="align-items-center">
										{/* IMAGE     IMAGE     IMAGE */}
										<Col md={4}>
											<img
												src={item.image}
												alt={item.name}
												className="img-fluid rounded img-thumbnail"
											></img>{" "}
											<Link
												to={`/product/${item.slug}`}
												style={{
													textDecoration: "none",
													color: "Black",
													fontWeight: "bold",
												}}
											>
												{item.name}
											</Link>
										</Col>

										{/* ITEM COUNT    ITEM COUNT    ITEM COUNT*/}
										<Col md={3} className="ItemCount">
											<Button
												variant="light"
												disabled={item.quantity === 1}
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
											<span>{item.quantity}</span>
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
										</Col>

										{/* ITEM PRICE    ITEM PRICE    ITEM PRICE  */}
										<Col
											className="ItemPrice"
											style={{
												alignItems: "center",
												height: "10vh",
												backgroundColor:
													"rgba(120, 255, 102, 0.54)",
												borderRadius: "8px",
											}}
											md={3}
										>
											₱
											{(
												item.price * item.quantity
											).toFixed(2)}
										</Col>

										{/* DELETE ITEM     DELETE ITEM      DELETE ITEM */}
										<Col md={2} className="ItemDelete">
											<Button
												onClick={() =>
													removeItemHandler(item)
												}
												variant="light"
											>
												<i className="fas fa-trash"></i>{" "}
												{/*DELETE ITEM*/}
											</Button>
										</Col>
									</Row>
								</ListGroup.Item>
							))}
						</ListGroup>
					)}
				</Col>
				<Col md={4}>
					<Card
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Card.Body>
							<ListGroup variant="flush">
								<ListGroup.Item>
									<h3>
										Subtotal (
										{cartItems.reduce(
											(a, c) => a + c.quantity,
											0
										)}{" "}
										item/s): ₱
										{cartItems
											.reduce(
												(a, c) =>
													a + c.price * c.quantity,
												0
											)
											.toFixed(2)}
									</h3>
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
											onClick={checkoutHandler}
											disabled={cartItems.length === 0}
										>
											<span className="top-key"></span>
											<span className="text">
												PROCEED TO CHECK OUT
											</span>
											<span className="bottom-key-1"></span>
											<span className="bottom-key-2"></span>
										</button>
									</div>
								</ListGroup.Item>
							</ListGroup>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</div>
	);
}

export default CartScreen;
