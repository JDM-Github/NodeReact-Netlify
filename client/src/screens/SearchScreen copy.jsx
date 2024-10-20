import React, { useEffect, useReducer, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import getError from "../utils";
import axios from "axios";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import { Col, Row } from "react-bootstrap";
import Button from "@mui/material/Button";
import Rating from "../components/Rating";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Products from "../components/Products";
import LinkContainer from "react-router-bootstrap/LinkContainer";
import RequestHandler from "../functions/RequestHandler.js";

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
				countProducts: action.payload.countProducts,
				loading: false,
			};
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };
		default:
			return state;
	}
};

const prices = [
	{
		name: "₱1 - ₱50",
		value: "1-50",
	},
	{
		name: "₱51 - ₱200",
		value: "51-200",
	},
	{
		name: "₱201 - ₱1000",
		value: "201-1000",
	},
];

export const ratings = [
	{
		name: "4 Stars & up",
		rating: 4,
	},
	{
		name: "3 stars & up ",
		rating: 3,
	},
	{
		name: "2 stars & up",
		rating: 2,
	},
	{
		name: "1 stars & up",
		rating: 1,
	},
];

function SearchScreen() {
	const navigate = useNavigate();
	const { search } = useLocation();
	const sp = new URLSearchParams(search);
	const category = sp.get("category") || "all";
	const query = sp.get("query") || "all";
	const price = sp.get("price") || "all";
	const rating = sp.get("rating") || "all";
	const order = sp.get("order") || "newest";
	const page = sp.get("page") || 1;

	const [{ loading, error, products, pages, countProducts }, dispatch] =
		useReducer(reducer, {
			loading: true,
			error: "",
		});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await RequestHandler.handleRequest(
					"get",
					`products/search?page=${page}&query=${query}&category=${category}&price=${price}&rating=${rating}&order=${order}`
				);
				dispatch({ type: "FETCH_SUCCESS", payload: data });
			} catch (error) {
				dispatch({
					type: "FETCH_FAIL",
					payload: getError(error),
				});
			}
		};
		fetchData();
	}, [category, error, order, page, price, query, rating]);

	const [categories, setCategories] = useState([]);
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const data = await RequestHandler.handleRequest(
					"get",
					`products/categories`
				);
				setCategories(data);
			} catch (err) {
				toast.error(getError(err));
			}
		};
		fetchCategories();
	}, [dispatch]);
	const checkoutHandler = () => {
		navigate("/signin?redirect=/shipping");
	};

	const getFilterUrl = (filter, skipPathname) => {
		const filterPage = filter.page || page;
		const filterCategory = filter.category || category;
		const filterQuery = filter.query || query;
		const filterRating = filter.rating || rating;
		const filterPrice = filter.price || price;
		const sortOrder = filter.order || order;
		return `${
			skipPathname ? "" : "/search?"
		}category=${filterCategory}&query=${filterQuery}&price=${filterPrice}&rating=${filterRating}&order=${sortOrder}&page=${filterPage}`;
	};

	return (
		<div style={{ width: "100vw" }}>
			<Helmet>
				<title>Search Products</title>
			</Helmet>

			<Row>
				<Col md={2}>
					<h3>Category</h3>
					<div
						style={{
							display: "flex",
							justifyContent: "space-evenly",
							gap: "5px",
							flexDirection: "column",
							marginBottom: "20px",
						}}
					>
						<Link
							className={"all" === category ? "text-bold" : ""}
							to={getFilterUrl({ category: "all" })}
							style={{
								color: "white",
								textDecorationLine: "none",
							}}
						>
							<button className="Chosen">Any</button>
						</Link>
						{categories.map((c) => (
							<Link
								className={
									c.category === category ? "text-bold" : ""
								}
								to={getFilterUrl({ category: c.category })}
								style={{
									color: "white",
									textDecorationLine: "none",
								}}
								key={c.category}
							>
								<button className="Chosen">
									{c.category}{" "}
								</button>
							</Link>
						))}
					</div>

					<div
						style={{
							display: "flex",
							justifyContent: "space-evenly",
							gap: "5px",
							flexDirection: "column",
						}}
					>
						<h3>Price</h3>
						<Link
							className={"all" === price ? "text-bold" : ""}
							to={getFilterUrl({ price: "all" })}
						>
							<button className="Chosen">Any</button>
						</Link>

						{prices.map((p) => (
							<Link
								to={getFilterUrl({ price: p.value })}
								className={p.value === price ? "text-bold" : ""}
							>
								<button className="Chosen">{p.name}</button>
							</Link>
						))}
					</div>
				</Col>

				<Col md={8}>
					{loading ? (
						<LoadingBox></LoadingBox>
					) : error ? (
						<MessageBox variant="danger">{error}</MessageBox>
					) : (
						<>
							<Row>
								<Col md={7}>
									<div
										style={{
											display: "flex",
											marginBottom: "10px",
										}}
									>
										{countProducts === 0
											? "No"
											: countProducts}{" "}
										Results
										<strong>
											{query !== "all" && " : " + query}
											{category !== "all" &&
												" : " + category}
											{price !== "all" &&
												" : Price " + price}
											{rating !== "all" &&
												" : Rating" + rating + " & up"}
										</strong>
										{query !== "all" ||
										category !== "all" ||
										rating !== "all" ||
										price !== "all" ? (
											<div
												style={{
													marginLeft: "2px",
													padding: "0 5px",
													cursor: "pointer",
												}}
												variant="outlined"
												onClick={() =>
													navigate("/search")
												}
											>
												<i className="fas fa-times-circle" />
											</div>
										) : null}
									</div>
								</Col>

								<Col className="text-end">
									Sort By{" "}
									<select
										className="sort-select"
										value={order}
										onChange={(e) => {
											navigate(
												getFilterUrl({
													order: e.target.value,
												})
											);
										}}
									>
										<option value="newest">
											Newest Arrivals
										</option>
										<option value="lowest">
											Price: Low to High
										</option>
										<option value="highest">
											Price: High to Low
										</option>
									</select>
								</Col>
							</Row>

							{!loading && products && products.length === 0 && (
								<MessageBox>No Product Found</MessageBox>
							)}

							<Row style={{ marginTop: "10px" }}>
								{!loading &&
									products &&
									products.map((product) => (
										<Col
											sm={7}
											lg={4}
											className="mb-3"
											key={product.id}
										>
											<Products product={product} />
										</Col>
									))}
							</Row>

							<div>
								{[...Array(pages).keys()].map((x) => (
									<LinkContainer
										key={x + 1}
										className="mx-1"
										to={{
											pathname: "/search",
											search: getFilterUrl(
												{ page: x + 1 },
												true
											),
										}}
									>
										<Button
											variant="contained"
											sx={{
												backgroundColor: "black",
												marginTop: "20px",
											}}
											className={
												Number(page) === x + 1
													? "text-bold"
													: ""
											}
										>
											{x + 1}
										</Button>
									</LinkContainer>
								))}
							</div>
						</>
					)}
				</Col>
			</Row>
		</div>
	);
}

export default SearchScreen;
