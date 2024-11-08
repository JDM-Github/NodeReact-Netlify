import React from "react";
import "./Navigation.css";

import { Link, useLocation } from "react-router-dom";
import NavDropdown from "react-bootstrap/NavDropdown";

import SearchBox from "./SearchBox";
import { Typography } from "@mui/material";
import { LinkContainer } from "react-router-bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";
import logo from "../LOGO.png";
import Badge from "react-bootstrap/esm/Badge";

export default function Navigation({ userInfo, cart, signoutHandler }) {
	const location = useLocation();
	const isSignInPage = location.pathname === "/signin";
	const isSignUpPage = location.pathname === "/signup";

	return (
		<div className="navigation">
			<div className="left">
				<LinkContainer to="/">
					<img src={logo} style={{ userSelect: "none" }} />
				</LinkContainer>

				<LinkContainer to="/">
					<Typography
						className="typography"
						sx={{
							color: "white",
							cursor: "pointer",
							userSelect: "none",
						}}
						ml="15px"
						fontWeight="bold"
						fontSize="1rem"
					>
						RYB OFFICIAL
					</Typography>
				</LinkContainer>

				{!userInfo && <SearchBox />}
				{userInfo && !userInfo.isAdmin && <SearchBox />}
			</div>
			<div className="right">
				{userInfo ? (
					<NavDropdown
						title={userInfo.name}
						id="basic-nav-dropdown"
						className="buttons"
					>
						<LinkContainer to="/profile">
							<NavDropdown.Item className="drop-down-item">
								User Profile
							</NavDropdown.Item>
						</LinkContainer>

						{userInfo.isRider ? null : (
							<>
								<LinkContainer to="/orderhistory">
									<NavDropdown.Item className="drop-down-item">
										Order History
									</NavDropdown.Item>
								</LinkContainer>
							</>
						)}

						<div onClick={signoutHandler}>
							<NavDropdown.Item className="drop-down-item">
								SIGN OUT
							</NavDropdown.Item>
						</div>
					</NavDropdown>
				) : (
					<>
						{isSignInPage ? (
							<Link className="nav-link" to="/signup">
								<div className="buttons">SIGN UP</div>
							</Link>
						) : (
							<Link className="nav-link" to="/signin">
								<div className="buttons">SIGN IN</div>
							</Link>
						)}
					</>
				)}

				<Link className="nav-link" to={{ pathname: "/search" }}>
					<div className="buttons">PRODUCTS</div>
				</Link>

				<Link className="nav-link" to={{ pathname: "/" }}>
					<div className="buttons">HOME</div>
				</Link>

				<Link to={{ pathname: "/cart" }}>
					<div className="buttons">
						<i className="fas fa-shopping-cart"></i>
						{cart.cartItems.length > 0 && (
							<Badge pill bg="danger">
								{cart.cartItems.reduce(
									(a, c) => a + c.quantity,
									0
								)}
							</Badge>
						)}
					</div>
				</Link>
			</div>
		</div>
	);
}
