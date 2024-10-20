import React, { useContext, useEffect, useReducer } from "react";
import { Store } from "../Store";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import getError from "../utils";
import axios from "axios";
import { toast } from "react-toastify";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Helmet } from "react-helmet-async";
import Container from "react-bootstrap/Container";
import RequestHandler from "../functions/RequestHandler";

const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true };
		case "FETCH_SUCCESS":
			return { ...state, loading: false };
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };

		case "UPDATE_REQUST":
			return { ...state, loadingUpdate: true };
		case "UPDATE_SUCCESS":
			return { ...state, loadingUpdate: false };
		case "UPDATE_FAIL":
			return { ...state, loadingUpdate: false };

		default:
			return state;
	}
};

function UserEditScreen() {
	const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
		loading: true,
		error: "",
	});

	const { state } = useContext(Store);
	const { userInfo } = state;
	const params = useParams();
	const { id: userId } = params;
	const navigate = useNavigate();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				dispatch({ type: "FETCH_REQUEST" });
				const data = await RequestHandler.handleRequest(
					"get",
					`users/${userId}`,
					{ headers: { Authorization: `Bearer ${userInfo.token}` } }
				);
				setName(data.name);
				setEmail(data.email);
				setIsAdmin(data.isAdmin);
				dispatch({ type: "FETCH_SUCCESS" });
			} catch (err) {
				dispatch({
					type: "FETCH_FAIL",
					payload: getError(err),
				});
			}
		};
		fetchData();
	}, [userId, userInfo]);

	const submitHandler = async (e) => {
		e.preventDefault();
		try {
			dispatch({ type: "UPDATE_REQUEST" });

			await RequestHandler.handleRequest(
				"put",
				`users/${userId}`,
				{ id: userId, name, email, isAdmin },
				{ headers: { Authorization: `Bearer ${userInfo.token}` } }
			);

			dispatch({ type: "UPDATE_SUCCESS" });

			toast.success("USER INFO UPDATED");
			navigate("/admin/users");
		} catch (error) {
			toast.error(getError(error));
			dispatch({ type: "UPDATE_FAIL" });
		}
	};
	return (
		<Container className="small-container">
			<Helmet>
				<title>Edit User ${userId}</title>
			</Helmet>
			<h1>Edit User Info {userId}</h1>

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

					<Form.Group className="mb-3" controlId="email">
						<Form.Label>Email</Form.Label>
						<Form.Control
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</Form.Group>

					<Form.Check
						className="mb-3"
						type="checkbox"
						id="isAdmin"
						label="Is Admin"
						checked={isAdmin}
						onChange={(e) => setIsAdmin(e.target.checked)}
					/>

					<div className="mb-3">
						<Button type="submit">UPDATE</Button>
						{loadingUpdate && <LoadingBox></LoadingBox>}
					</div>
				</Form>
			)}
		</Container>
	);
}

export default UserEditScreen;
