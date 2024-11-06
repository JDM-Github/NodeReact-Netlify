import React, { useState } from "react";
import "./Dashboard.scss";
import Copyright from "../../Component/Copyright.tsx";

import background from "../../Assets/background.png";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RequestHandler from "../../Functions/RequestHandler.js";

export default function LoginPage() {
	const navigate = useNavigate();
	const [isLogin, setIsLogin] = useState(true);

	const [loginInfo, setLoginInfo] = useState({
		email: "",
		password: "",
	});

	const [requestInfo, setRequestInfo] = useState({
		email: "",
		password: "",
		confirmPassword: "",
	});

	const handleLoginInfo = (e) => {
		const { name, value } = e.target;
		setLoginInfo((old) => ({
			...old,
			[name]: value,
		}));
	};
	const handleRequestInfo = (e) => {
		const { name, value } = e.target;
		setRequestInfo((old) => ({
			...old,
			[name]: value,
		}));
	};

	const handleLogin = async () => {
		if (loginInfo.email == "admin" && loginInfo.password == "admin") {
			localStorage.setItem(
				"users",
				JSON.stringify({
					id: "ADMIN",
				})
			);
			navigate("/admin");
		} else {
			try {
				const data = await RequestHandler.handleRequest(
					"post",
					"users/login",
					loginInfo
				);

				if (data.success) {
					localStorage.setItem("users", JSON.stringify(data.user));
					toast.success("Login successful!");
					if (data.user.isAdmin) {
						navigate("/admin");
					} else {
						navigate("/client");
					}
				} else {
					toast.error(
						data.message ||
							"Login failed, please check your credentials."
					);
				}
			} catch (error) {
				toast.error(`An error occurred while logging in. ${error}`);
			}
		}
	};

	const handleRequest = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"users/request",
				requestInfo
			);

			if (data.success) {
				toast.success(
					"Request successful! Please wait for admin to verify your request"
				);
				setRequestInfo({
					email: "",
					password: "",
					confirmPassword: "",
				});
			} else {
				toast.error(
					data.message ||
						"Request failed, please check your credentials."
				);
			}
		} catch (error) {
			toast.error(`An error occurred while requesting. ${error}`);
		}
	};

	return (
		<div className="dashboard">
			<div className="top"></div>
			<div className="middle">
				<div className="login-page">
					<div className="login">
						<h1>Login</h1>
						<input
							type="text"
							name="email"
							placeholder="Email"
							value={loginInfo.email}
							onChange={handleLoginInfo}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleLogin();
								}
							}}
							required
						/>
						<input
							type="password"
							name="password"
							placeholder="Password"
							value={loginInfo.password}
							onChange={handleLoginInfo}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleLogin();
								}
							}}
							required
						/>
						<button
							type="submit"
							onClick={handleLogin}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleLogin();
								}
							}}
						>
							LOGIN
						</button>
						<center>
							<span>or</span>
						</center>
						<center>
							<div
								className="request-reg"
								onClick={() => setIsLogin(false)}
							>
								REQUEST REGISTER
							</div>
						</center>
					</div>
					<div className="register">
						<h1>
							<center>Request Register</center>
						</h1>

						<input
							name="email"
							type="text"
							placeholder="Email"
							onChange={handleRequestInfo}
							value={requestInfo.email}
						/>
						<input
							name="password"
							type="password"
							placeholder="Password"
							value={requestInfo.password}
							onChange={handleRequestInfo}
							required
						/>
						<input
							name="confirmPassword"
							type="password"
							placeholder="Confirm Password"
							onChange={handleRequestInfo}
							value={requestInfo.confirmPassword}
							required
						/>
						<button onClick={handleRequest}>REQUEST</button>

						<center>
							<span>or</span>
						</center>
						<center>
							<div
								className="request-reg"
								onClick={() => setIsLogin(true)}
							>
								Already have account? Login
							</div>
						</center>
					</div>
					<img
						src={background}
						alt="BG"
						className="display"
						style={{
							transform: isLogin ? "translateX(100%)" : "none",
						}}
					/>
				</div>
			</div>
			<Copyright />
			<ToastContainer />
		</div>
	);
}
