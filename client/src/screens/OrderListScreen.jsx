import React, { useContext, useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import Button from "react-bootstrap/Button";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Store } from "../Store";
import getError from "../utils";
import RequestHandler from "../functions/RequestHandler";

const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true };
		case "FETCH_SUCCESS":
			return { ...state, orders: action.payload, loading: false };
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };

		case "DELETE_REQUEST":
			return { ...state, loadingDelete: true, successDelete: false };
		case "DELETE_SUCCESS":
			return { ...state, loadingDelete: false, successDelete: true };
		case "DELETE_FAIL":
			return { ...state, loadingDelete: false };
		case "DELETE_RESET":
			return { ...state, loadingDelete: false, successDelete: false };
		default:
			return state;
	}
};

function OrderListScreen() {
	const navigate = useNavigate();
	const { state } = useContext(Store);
	const { userInfo } = state;

	const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
		useReducer(reducer, {
			loading: true,
			error: "",
		});

	useEffect(() => {
		const fetchData = async () => {
			try {
				dispatch({ type: "FETCH_REQUEST" });
				const data = await RequestHandler.handleRequest(
					"get",
					`orders`,
					{
						headers: { Authorization: `Bearer ${userInfo.token}` },
					}
				);

				dispatch({ type: "FETCH_SUCCESS", payload: data });
			} catch (err) {
				dispatch({ type: "FETCH_FAIL", payload: getError(err) });
			}
		};
		if (successDelete) {
			dispatch({ type: "DELETE_RESET" });
		} else {
			fetchData();
		}
	}, [userInfo, successDelete]);

	const deleteHandler = async (order) => {
		if (window.confirm("You Are About To Delete An Order. Confirm?")) {
			try {
				dispatch({ type: "DELETE_REQUEST" });
				await RequestHandler.handleRequest(
					"delete",
					`orders/${order.id}`,
					{
						headers: { Authorization: `Bearer ${userInfo.token}` },
					}
				);
				toast.success("Order Has Been Deleted");
				dispatch({ type: "DELETE_SUCCESS" });
			} catch (error) {
				toast.error(getError(error));
				dispatch({ type: "DELETE_FAIL" });
			}
		}
	};

	return (
		<div
			style={{
				position: "absolute",
				top: "0",
				left: "20vw",
				width: "80vw",
				padding: "20px",
				boxSizing: "border-box",
			}}
		>
			<Helmet>
				<title>Orders</title>
			</Helmet>
			<h1>Customer Orders</h1>
			{loadingDelete && <LoadingBox></LoadingBox>}
			{loading ? (
				<LoadingBox></LoadingBox>
			) : error ? (
				<MessageBox variant="danger"></MessageBox>
			) : (
				<table className="table">
					<thead>
						<tr>
							<th>ID</th>
							<th>USER</th>
							<th>DATE</th>
							<th>TOTAL</th>
							<th>PAID</th>
							<th>STATUS</th>
							<th>ACTIONS</th>
						</tr>
					</thead>
					<tbody>
						{orders.map((order) => (
							<tr key={order.id}>
								<td>{order.id}</td>
								<td>
									{order.user
										? order.user.name
										: "DELETED USER"}
								</td>
								<td>{order.createdAt.substring(0, 10)}</td>
								<td>{order.totalPrice.toFixed(2)}</td>
								<td>
									{order.isPaid
										? order.paidAt.substring(0, 10)
										: "Not Yet Paid"}
								</td>
								<td>
									{order.isDelivered
										? order.deliveredAt.substring(0, 10)
										: "Not Yet Delivered"}
								</td>
								<td>
									<div
										style={{
											display: "flex",
											justifyContent: "space-evenly",
										}}
									>
										<Button
											type="button"
											variant="outline-warning"
											onClick={() =>
												navigate(`/order/${order.id}`)
											}
										>
											EDIT
										</Button>
										<Button
											type="button"
											variant="outline-danger"
											onClick={() => deleteHandler(order)}
										>
											DELETE
										</Button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}

export default OrderListScreen;
