import React, { useContext, useEffect, useReducer, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import { Store } from "../Store";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import getError from "../utils";
import Modal from "react-bootstrap/Modal";
import RequestHandler from "../functions/RequestHandler";

const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true };
		case "FETCH_SUCCESS":
			return {
				...state,
				products: action.payload.products,
				page: action.payload.page,
				pages: action.payload.pages,
				loading: false,
			};
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };

		case "CREATE_REQUEST":
			return { ...state, loadingCreate: true };
		case "CREATE_SUCCESS":
			return { ...state, loadingCreate: false };
		case "CREATE_FAIL":
			return { ...state, loadingCreate: false };

		case "DELETE_REQUEST":
			return { ...state, loadingDelete: true, successDelete: false };
		case "DELETE_SUCCESS":
			return { ...state, loadingDelete: false, successDelete: true };
		case "DELETE_FAIL":
			return { ...state, loadingDelete: false, successDelete: false };
		case "DELETE_RESET":
			return { ...state, loadingDelete: false, successDelete: false };
		default:
			return state;
	}
};

function ProductListScreen() {
	const [
		{
			loading,
			error,
			products,
			pages,
			loadingCreate,
			loadingDelete,
			successDelete,
		},
		dispatch,
	] = useReducer(reducer, {
		loading: true,
		error: "",
	});

	const navigate = useNavigate();
	const { search } = useLocation();
	const sp = new URLSearchParams(search);
	const page = sp.get("page") || 1;

	const { state } = useContext(Store);
	const { userInfo } = state;
	const [showArchived, setShowArchived] = useState(false);
	const [archivedProducts, setArchivedProducts] = useState([]);
	const [loadingArchived, setLoadingArchived] = useState(false);
	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await RequestHandler.handleRequest(
					"get",
					`products/admin?page=${page}`,
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
	}, [page, userInfo, successDelete]);

	const createHandler = async () => {
		if (window.confirm("Are You Sure To Create?")) {
			try {
				dispatch({ type: "CREATE_REQUEST" });

				const data = await RequestHandler.handleRequest(
					"post",
					"products",
					{},
					{
						headers: {
							Authorization: `Bearer ${userInfo.token}`,
						},
					}
				);

				toast.success("product created successfully");
				dispatch({ type: "CREATE_SUCCESS" });
				navigate(`/admin/product/${data.product.id}`);
			} catch (error) {
				toast.error(getError(error));
				dispatch({
					type: "CREATE_FAIL",
				});
			}
		}
	};

	const deleteHandler = async (product) => {
		if (window.confirm("YOU ARE ABOUT TO DELETE AN ITEM. CONFIRM?")) {
			try {
				await RequestHandler.handleRequest(
					"delete",
					`products/${product.id}`,
					{},
					{
						headers: { Authorization: `Bearer ${userInfo.token}` },
					}
				);
				toast.success("PRODUCT HAS BEEN DELETED");
				dispatch({ type: "DELETE_SUCCESS" });
				fetchArchivedProducts();
			} catch (error) {
				toast.error(getError(error));
				dispatch({
					type: "DELETE_FAIL",
				});
			}
		}
	};
	const archiveHandler = async (product) => {
		if (window.confirm("Are you sure to archive this product?")) {
			try {
				await RequestHandler.handleRequest(
					"put",
					`products/${product.id}/archive`,
					{},
					{
						headers: { Authorization: `Bearer ${userInfo.token}` },
					}
				);
				toast.success("Product has been archived");
				dispatch({ type: "DELETE_SUCCESS" });
			} catch (error) {
				toast.error(getError(error));
				dispatch({
					type: "DELETE_FAIL",
				});
			}
		}
	};

	const fetchArchivedProducts = async () => {
		setLoadingArchived(true);
		try {
			const data = await RequestHandler.handleRequest(
				"get",
				"products/archived",
				{
					headers: { Authorization: `Bearer ${userInfo.token}` },
				}
			);
			setArchivedProducts(data);
			setLoadingArchived(false);
		} catch (error) {
			toast.error(getError(error));
			setLoadingArchived(false);
		}
	};

	const restoreHandler = async (product) => {
		if (window.confirm("Are you sure to restore this product?")) {
			try {
				await RequestHandler.handleRequest(
					"put",
					`products/${product.id}/unarchive`,
					{},
					{
						headers: { Authorization: `Bearer ${userInfo.token}` },
					}
				);
				toast.success("Product has been restored");
				fetchArchivedProducts(); // Refresh the archived products list
			} catch (error) {
				toast.error(getError(error));
			}
		}
	};

	const handleShowArchived = () => {
		setShowArchived(true);
		fetchArchivedProducts();
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
			<Row>
				<Col>
					<h1>PRODUCTS</h1>
				</Col>

				<Col className="col text-end">
					<div>
						<Button type="button" onClick={createHandler}>
							Create Product
						</Button>
						<Button
							variant="info"
							className="ms-2"
							onClick={handleShowArchived}
						>
							View Archived Products
						</Button>
					</div>
				</Col>
			</Row>

			{loadingCreate && <LoadingBox></LoadingBox>}
			{loadingDelete && <LoadingBox></LoadingBox>}

			{loading ? (
				<LoadingBox></LoadingBox>
			) : error ? (
				<MessageBox variant="danger">{error}</MessageBox>
			) : (
				<>
					<table className="table">
						<thead>
							<tr>
								<th>ID</th>
								<th>NAME</th>
								<th>PRICE</th>
								<th>CATEGORY</th>
								<th>BRAND</th>
								<th
									style={{
										display: "flex",
										justifyContent: "center",
									}}
								>
									ACTIONS
								</th>
							</tr>
						</thead>

						<tbody>
							{products.map((product) => (
								<tr key={product.id}>
									<td>{product.id}</td>
									<td>{product.name}</td>
									<td>{product.price}</td>
									<td>{product.category}</td>
									<td>{product.brand}</td>
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
														`/admin/product/${product.id}`
													)
												}
											>
												EDIT
											</Button>
											<Button
												type="button"
												variant="outline-danger"
												onClick={() =>
													archiveHandler(product)
												}
											>
												ARCHIVE
											</Button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<div>
						{[...Array(pages).keys()].map((x) => (
							<Link
								className={
									x + 1 === Number(pages)
										? "btn tex-bold"
										: "btn"
								}
								key={x + 1}
								to={`/admin/products?page=${x + 1}`}
							>
								{x + 1}
							</Link>
						))}
					</div>
				</>
			)}
			<Modal
				show={showArchived}
				onHide={() => setShowArchived(false)}
				size="lg"
			>
				<Modal.Header closeButton>
					<Modal.Title>Archived Products</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{loadingArchived ? (
						<LoadingBox />
					) : archivedProducts.length === 0 ? (
						<MessageBox>No archived products found</MessageBox>
					) : (
						<table className="table">
							<thead>
								<tr>
									<th>ID</th>
									<th>NAME</th>
									<th>PRICE</th>
									<th>ACTIONS</th>
								</tr>
							</thead>
							<tbody>
								{archivedProducts.map((product) => (
									<tr key={product.id}>
										<td>{product.id}</td>
										<td>{product.name}</td>
										<td>{product.price}</td>
										<td>
											<Button
												type="button"
												variant="success"
												onClick={() =>
													restoreHandler(product)
												}
											>
												Restore
											</Button>
											<Button
												type="button"
												variant="danger"
												className="ms-2"
												onClick={() =>
													deleteHandler(product)
												}
											>
												Delete
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="secondary"
						onClick={() => setShowArchived(false)}
					>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
}

export default ProductListScreen;
