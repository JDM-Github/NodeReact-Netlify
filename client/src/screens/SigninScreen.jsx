import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { Helmet } from "react-helmet-async";
import { TextField, Typography, Button } from "@mui/material";

import { Store } from "../Store";
import { toast } from "react-toastify";
import getError from "../utils";

import InputAdornment from "@mui/material/InputAdornment";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Lock from "@mui/icons-material/Lock";

import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import RequestHandler from "../functions/RequestHandler.js";

import "./SigninScreen.css";

const PasswordField = ({ onChange }) => {
	const [showPassword, setShowPassword] = useState(false);

	const handleClickShowPassword = () => setShowPassword(!showPassword);

	return (
		<TextField
			type={showPassword ? "text" : "password"}
			variant="standard"
			onChange={onChange}
			placeholder="Enter password"
			required
			InputProps={{
				endAdornment: (
					<InputAdornment position="end">
						<IconButton onClick={handleClickShowPassword}>
							{showPassword ? <VisibilityOff /> : <Visibility />}
						</IconButton>
					</InputAdornment>
				),

				startAdornment: (
					<InputAdornment position="start">
						<Lock sx={{ fontSize: 20 }} />
					</InputAdornment>
				),
				sx: {
					"& .MuiInput-underline:before": {
						borderBottom: "2px solid #000", // Custom bottom border
					},
					"& .MuiInput-underline:hover:not(.Mui-disabled):before": {
						borderBottom: "2px solid #000", // Hover bottom border
					},
					"& .MuiInput-underline:after": {
						borderBottom: "2px solid #000", // Focused bottom border
					},
				},
			}}
			sx={{
				display: "flex",
				marginTop: "30px",
				width: "100%",
				"& .MuiInputBase-root": {
					paddingLeft: "5px",
				},
			}}
		/>
	);
};

function SigninScreen() {
	const navigate = useNavigate();
	const { search } = useLocation();
	const redirectInUrl = new URLSearchParams(search).get("redirect");
	const redirect = redirectInUrl ? redirectInUrl : "/";

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [attempts, setAttempts] = useState(0);
	const [lockoutTime, setLockoutTime] = useState(null);

	const { state, dispatch: ctxDispatch } = useContext(Store);
	const { userInfo } = state;

	const submitHandler = async (e) => {
		e.preventDefault();
		if (lockoutTime) {
			const currentTime = new Date().getTime();
			if (currentTime < lockoutTime) {
				const timeLeft = Math.ceil((lockoutTime - currentTime) / 1000);
				toast.error(
					`Too many attempts. Please wait ${timeLeft} seconds.`
				);
				return;
			} else {
				setLockoutTime(null);
				setAttempts(0);
			}
		}

		try {
			const data = await RequestHandler.handleRequest(
				"post",
				`users/signin`,
				{
					email,
					password,
				}
			);
			ctxDispatch({ type: "USER_SIGNIN", payload: data });
			localStorage.setItem("userInfo", JSON.stringify(data));
			navigate(redirect || "/");
		} catch (err) {
			const errorMessage = getError(err);
			if (errorMessage.includes("401")) {
				setAttempts((prev) => prev + 1);
				if (attempts + 1 >= 3) {
					const lockTime = new Date().getTime() + 90 * 1000;
					setLockoutTime(lockTime);
					toast.error(
						"Too many attempts. You are locked out for 90 seconds."
					);
				} else {
					toast.error("Wrong email or password. Please try again.");
				}
			} else {
				toast.error(errorMessage);
			}
		}
	};

	useEffect(() => {
		if (userInfo) {
			navigate(redirect);
		}
	}, [navigate, redirect, userInfo]);

	return (
		<div className="login-design">
			<div className="bg-login"></div>
			<div className="login-card">
				<Form onSubmit={submitHandler}>
					<h2 className="title-card" style={{ marginTop: "30px" }}>
						<center>CUSTOMER LOGIN</center>
					</h2>
					<hr
						style={{
							borderBottom: "3px solid #111",
							width: "40%",
							marginLeft: "30%",
						}}
					/>

					<Form.Group controlId="email">
						<TextField
							type="email"
							variant="standard"
							placeholder="Enter email"
							required
							onChange={(e) => setEmail(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<AccountCircle sx={{ fontSize: 20 }} />
									</InputAdornment>
								),
								sx: {
									"& .MuiInput-underline:before": {
										borderBottom: "4px solid #555",
									},
									"& .MuiInput-underline:hover:not(.Mui-disabled):before":
										{
											borderBottom: "4px solid #555",
										},
									"& .MuiInput-underline:after": {
										borderBottom: "4px solid #555",
									},
								},
							}}
							sx={{
								display: "flex",
								marginTop: "40px",
								width: "100%",
								"& .MuiInputBase-root": {
									paddingLeft: "5px",
								},
							}}
						/>
					</Form.Group>

					<Form.Group controlId="password">
						<PasswordField
							onChange={(e) => setPassword(e.target.value)}
						/>
					</Form.Group>

					<button type="submit" className="login-button">
						LOGIN
					</button>
					<span>
						<center style={{ marginTop: "10px" }}>Or</center>
					</span>

					<div className="bottom-login">
						<Link to="/forgot-password">Forgot Password</Link>
						&nbsp;/&nbsp;
						<Link to={`/signup?redirect=${redirect}`}>
							Create account
						</Link>
					</div>
				</Form>
			</div>
		</div>
	);
}

export default SigninScreen;
