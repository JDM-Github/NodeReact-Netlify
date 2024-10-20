import React, { useContext, useEffect, useReducer } from "react";
import { Store } from "../Store";
import axios from "axios";
import getError from "../utils";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Button from "react-bootstrap/esm/Button";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import RequestHandler from "../functions/RequestHandler";

const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true };
		case "FETCH_SUCCESS":
			return { ...state, users: action.payload, loading: false };
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

function UserListScreen() {
	const [{ loading, error, users, loadingDelete, successDelete }, dispatch] =
		useReducer(reducer, {
			loading: true,
			error: "",
		});

	const { state } = useContext(Store);
	const { userInfo } = state;
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				dispatch({ type: "FETCH_REQUEST" });

				const data = await RequestHandler.handleRequest(
					"get",
					`users`,
					{
						headers: { Authorization: `Bearer ${userInfo.token}` },
					}
				);

				dispatch({ type: "FETCH_SUCCESS", payload: data });
			} catch (err) {
				dispatch({
					type: "FETCH_FAIL",
					payload: getError(err),
				});
			}
		};
		if (successDelete) {
			dispatch({ type: "DELETE_RESET" });
		} else {
			fetchData();
		}
	}, [userInfo, successDelete]);

	const deleteHandler = async (user) => {
		if (window.confirm("You Are About To Delete A User. Confirm?")) {
			try {
				dispatch({ type: "DELETE_REQUEST" });

				await RequestHandler.handleRequest(
					"delete",
					`users/${user.id}`,
					{
						headers: { Authorization: `Bearer ${userInfo.token}` },
					}
				);
				toast.success("USER HAS BEEN DELETED");
				dispatch({ type: "DELETE_SUCCESS" });
			} catch (err) {
				toast.error(getError(err));
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
				<title>USERS</title>
			</Helmet>
			<h1>Users</h1>
			{loadingDelete && <LoadingBox></LoadingBox>}

			{loading ? (
				<LoadingBox></LoadingBox>
			) : error ? (
				<MessageBox variant="danger">{error}</MessageBox>
			) : (
				<table className="table">
					<thead>
						<tr>
							<th>USER'S ID</th>
							<th>NAME</th>
							<th>EMAIL</th>
							<th>IS ADMIN</th>
							<th>ACTIONS</th>
						</tr>
					</thead>
					<tbody>
						{users.map((user) => (
							<tr key={user.id}>
								<td>{user.id}</td>
								<td>{user.name}</td>
								<td>{user.email}</td>
								<td>{user.isAdmin ? "Admin" : "Not Admin"}</td>
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
												navigate(
													`/admin/user/${user.id}`
												)
											}
										>
											EDIT
										</Button>
										<Button
											type="button"
											variant="outline-danger"
											onClick={() => deleteHandler(user)}
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

export default UserListScreen;
