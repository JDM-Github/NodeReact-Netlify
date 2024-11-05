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

import "./SearchScreen.css";

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
		<div className="search" style={{ display: "flex" }}>
			<Helmet>
				<title>Search Products</title>
			</Helmet>

			<div className="sorter">
				<div className="text-end">
					<div className="text-end-text">Sort By </div>
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
						<option value="newest">Newest Arrivals</option>
						<option value="lowest">Price: Low to High</option>
						<option value="highest">Price: High to Low</option>
					</select>
				</div>

				<div className="text-end">
					<div className="text-end-text">Category </div>
					<select
						className="sort-select"
						value={category}
						onChange={(e) => {
							const selectedCategory = e.target.value;
							window.location.href = getFilterUrl({
								category: selectedCategory,
							});
						}}
					>
						<option value="all">Category</option>
						{categories.map((c) => (
							<option key={c.category} value={c.category}>
								{c.category}
							</option>
						))}
					</select>
				</div>

				<div className="text-end">
					<div className="text-end-text">Price </div>
					<select
						className="sort-select"
						value={price}
						onChange={(e) => {
							const selectedPrice = e.target.value;
							window.location.href = getFilterUrl({
								price: selectedPrice,
							});
						}}
					>
						<option value="all">Price</option>
						{prices.map((p) => (
							<option key={p.value} value={p.value}>
								{p.name}
							</option>
						))}
					</select>
				</div>
			</div>

			<div>
				<div
					className="result-text"
					style={{
						display: "flex",
						marginBottom: "10px",
						textAlign: "left",
						justifyContent: "left",
						alignItems: "center",
					}}
				>
					<div style={{ display: "flex" }}>
						{countProducts === 0 ? "No" : countProducts} Results
						<strong>
							{query !== "all" && " : " + query}
							{category !== "all" && " : " + category}
							{price !== "all" && " : Price " + price}
							{rating !== "all" && " : Rating" + rating + " & up"}
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
								onClick={() => navigate("/search")}
							>
								<i className="fas fa-times-circle" />
							</div>
						) : null}
					</div>
				</div>
				{!loading && products && products.length === 0 && (
					<MessageBox style={{ width: "100%" }}>
						No Product Found
					</MessageBox>
				)}
				<div>
					{loading ? (
						<LoadingBox />
					) : error ? (
						<MessageBox variant="danger">{error}</MessageBox>
					) : (
						<div className="products">
							{products.slice(0, 8).map((product) => (
								<Products product={product}></Products>
							))}
						</div>
					)}
				</div>

				<div style={{ marginBottom: "20px" }}>
					{[...Array(pages).keys()].map((x) => (
						<LinkContainer
							key={x + 1}
							className="mx-1"
							to={{
								pathname: "/search",
								search: getFilterUrl({ page: x + 1 }, true),
							}}
						>
							<Button
								variant="contained"
								sx={{
									backgroundColor: "black",
									marginTop: "20px",
								}}
								className={
									Number(page) === x + 1 ? "text-bold" : ""
								}
							>
								{x + 1}
							</Button>
						</LinkContainer>
					))}
				</div>
			</div>
		</div>
	);
}

export default SearchScreen;
