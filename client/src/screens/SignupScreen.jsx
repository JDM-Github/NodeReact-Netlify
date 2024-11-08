import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { Helmet } from "react-helmet-async";
import { TextField, Typography, Button } from "@mui/material";
import { Store } from "../Store";
import { toast, ToastContainer } from "react-toastify";
import getError from "../utils";
import Modal from "react-bootstrap/Modal";

import InputAdornment from "@mui/material/InputAdornment";
import RequestHandler from "../functions/RequestHandler.js";
import "./SignupScreen.css";

function CreateTextField({
	type,
	label,
	placeholder,
	startIcon,
	onFocus,
	onBlur,
	onChange,
	error,
	helperText,
	value,
	required,
}) {
	return (
		<TextField
			value={value}
			error={error}
			helperText={helperText}
			type={type}
			label={label}
			variant="standard"
			placeholder={placeholder}
			onFocus={onFocus}
			onBlur={onBlur}
			onChange={onChange}
			required={required}
			InputProps={{
				startAdornment: startIcon ? (
					<InputAdornment position="start">
						{startIcon}
					</InputAdornment>
				) : null,
				sx: {
					"& .MuiInput-underline:before": {
						borderBottom: "4px solid #555",
					},
					"& .MuiInput-underline:hover:not(.Mui-disabled):before": {
						borderBottom: "4px solid #555",
					},
					"& .MuiInput-underline:after": {
						borderBottom: "4px solid #555",
					},
				},
			}}
			sx={{
				display: "flex",
				marginTop: "20px",
				width: "100%",
				"& .MuiInputBase-root": {
					paddingLeft: "5px",
				},
			}}
		/>
	);
}

function SignupScreen() {
	const navigate = useNavigate();
	const { search } = useLocation();
	const redirectInUrl = new URLSearchParams(search).get("redirect");
	const redirect = redirectInUrl ? redirectInUrl : "/";
	const [name, setName] = useState("");
	const [middlename, setMiddleName] = useState("");
	const [suffix, setSuffix] = useState("");
	const [lastname, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [bday, setBday] = useState("");
	const [error, setError] = useState(false);
	const [gender, setGender] = useState("");
	const [emailError, setEmailError] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [modalMessage, setmodalMessage] = useState(
		"Please verify your email to continue."
	);
	const handleBday = (event) => {
		const inputDate = event.target.value;
		const selectedDate = new Date(inputDate);
		const today = new Date();

		const age = today.getFullYear() - selectedDate.getFullYear();
		const monthDiff = today.getMonth() - selectedDate.getMonth();

		if (age < 18 || (age === 18 && monthDiff < 0)) {
			toast.error("You must be 18 years or older to register.");
			setBday("");
		} else {
			setBday(inputDate);
		}
	};

	const validatePassword = (password) => {
		const minLength = 8;
		const upperCase = /[A-Z]/;
		const lowerCase = /[a-z]/;
		const specialCharacter = /[!@#$%^&*(),.?":{}|<>]/;
		return (
			password.length >= minLength &&
			upperCase.test(password) &&
			lowerCase.test(password) &&
			specialCharacter.test(password)
		);
	};
	const handleEmailChange = (e) => {
		const emailValue = e.target.value;
		setEmail(emailValue);
	};
	const { state, dispatch: ctxDispatch } = useContext(Store);
	const { userInfo } = state;

	const submiteHandler = async (e) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			toast.error("Passwords Do Not Match");
			return;
		}
		if (!validatePassword(password)) {
			toast.error(
				"Password must be at least 8 characters long, and include uppercase, lowercase, and special characters."
			);
			return;
		}
		if (emailError) {
			toast.error(emailError);
			return;
		}
		try {
			// setShowModal(true);
			const data = await RequestHandler.handleRequest(
				"post",
				`users/signup`,
				{
					name,
					middlename,
					lastname,
					suffix,
					email,
					password,
					bday,
				}
			);
			toast.success(data.message);

			// THIS IS NOT GOOD
			// const intervalId = setInterval(async () => {
			// 	try {
			// 		const data = await RequestHandler.handleRequest(
			// 			"get",
			// 			`users/check-verification-status?email=${email}`
			// 		);
			// 		if (data.isVerified) {
			// 			clearInterval(intervalId);
			// 			setmodalMessage("The email successfully verified!");
			// 			setTimeout(() => {
			// 				navigate("/signin");
			// 			}, 3000);
			// 		}
			// 	} catch (error) {
			// 		toast.error(getError(error));
			// 	}
			// });
		} catch (err) {
			toast.error(getError(err));
		}
	};

	useEffect(() => {
		if (userInfo) {
			navigate(redirect);
		}
	}, [navigate, redirect, userInfo]);

	return (
		<>
			{true ? (
				<div className="registration-design">
					<div className="bg-registration"></div>
					<div className="registration-card">
						<Form onSubmit={submiteHandler}>
							<h2
								className="title-card"
								style={{ marginTop: "30px" }}
							>
								<center>CUSTOMER REGISTRATION</center>
							</h2>
							<hr
								style={{
									borderBottom: "3px solid #111",
									width: "40%",
									marginLeft: "30%",
								}}
							/>
							<Form.Group controlId="name">
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "repeat(3, 1fr)",
										columnGap: "10px",
									}}
								>
									<CreateTextField
										type="name"
										placeholder="First Name"
										onChange={(e) =>
											setName(e.target.value)
										}
										required={true}
									/>
									<CreateTextField
										type="middlename"
										placeholder="Middle Name"
										onChange={(e) =>
											setMiddleName(e.target.value)
										}
										required={true}
									/>
									<CreateTextField
										type="lastname"
										placeholder="Surname"
										onChange={(e) =>
											setLastName(e.target.value)
										}
										required={true}
									/>
								</div>
							</Form.Group>
							<Form.Group controlId="bdayGender">
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "repeat(2, 1fr)",
										columnGap: "10px",
									}}
								>
									<CreateTextField
										required={false}
										type="suffix"
										placeholder="Suffix"
										onChange={(e) =>
											setSuffix(e.target.value)
										}
									/>
									<CreateTextField
										type="date"
										placeholder="MM/DD/YYYY"
										onFocus={(e) =>
											(e.target.type = "date")
										}
										onBlur={(e) =>
											!e.target.value &&
											(e.target.type = "text")
										}
										onChange={handleBday}
										value={bday}
										required={true}
									/>
									<ToastContainer />
								</div>
							</Form.Group>
							<Form.Group controlId="email">
								<CreateTextField
									type="email"
									placeholder="Email"
									onChange={handleEmailChange}
									error={Boolean(emailError)}
									helperText={emailError}
									required={true}
								/>
							</Form.Group>
							<Form.Group controlId="password">
								<CreateTextField
									type="password"
									placeholder="Password"
									onChange={(e) =>
										setPassword(e.target.value)
									}
									required={true}
								/>
							</Form.Group>

							<Form.Text
								className="text-muted"
								style={{ marginTop: "0.5rem" }}
							>
								Password must be at least 8 characters long,
								include:
								<ul
									style={{
										margin: "0.5rem 0 0 1.5rem",
										padding: "0",
									}}
								>
									<li>At least one uppercase letter (A-Z)</li>
									<li>At least one lowercase letter (a-z)</li>
									<li>
										At least one special character (e.g.,
										!@#$%^&*)
									</li>
								</ul>
							</Form.Text>

							<Form.Group controlId="confirmPassword">
								<CreateTextField
									type="Password"
									placeholder="Confirm Password"
									onChange={(e) =>
										setConfirmPassword(e.target.value)
									}
									required={true}
								/>
							</Form.Group>
							<button
								type="submit"
								className="registration-button"
							>
								REGISTER
							</button>
							<span>
								<center style={{ marginTop: "10px" }}>
									Or
								</center>
							</span>
							<div className="bottom-registration">
								<Link to={`/signin?redirect=${redirect}`}>
									Log In Here
								</Link>
							</div>
						</Form>
						<Modal
							show={showModal}
							onHide={() => setShowModal(false)}
						>
							<Modal.Header closeButton>
								<Modal.Title>Email Verification</Modal.Title>
							</Modal.Header>
							<Modal.Body>
								<p>{modalMessage}</p>
							</Modal.Body>
							<Modal.Footer>
								<Button
									variant="primary"
									onClick={() => setShowModal(false)}
								>
									Close
								</Button>
							</Modal.Footer>
						</Modal>
					</div>
				</div>
			) : (
				<Container
					className="small-container"
					style={{
						marginTop: "2rem",
						border: "2px solid black",
						borderRadius: "8px",
						boxShadow:
							"10px 10px 10px 10px rgba(86, 81, 255, 0.57)",
					}}
				>
					<Helmet>
						<title>Sign Up</title>
					</Helmet>
					<h1 className="my-3">Sign Up</h1>
					<Form onSubmit={submiteHandler}>
						{/*USER'S NAME   USER'S NAME   USER'S NAME*/}
						<Form.Group
							className="mb-3"
							controlId="name"
							style={{
								width: "35.8rem",
								gap: "5px",
								flexDirection: "row",
								display: "flex",
								justifyContent: "flex-start",
							}}
						>
							<TextField
								sx={{ display: "flex", width: "50%" }}
								type="name"
								label="First Name"
								variant="outlined"
								required
								onChange={(e) => setName(e.target.value)}
							/>
							<TextField
								sx={{ display: "flex", width: "50%" }}
								type="middlename"
								label="Middlename"
								variant="outlined"
								onChange={(e) => setMiddleName(e.target.value)}
							/>
							<TextField
								sx={{ display: "flex", width: "50%" }}
								type="lastname"
								label="Surname"
								variant="outlined"
								required
								onChange={(e) => setLastName(e.target.value)}
							/>
						</Form.Group>

						<Form.Group
							className="mb-3"
							controlId="bdayGender"
							style={{
								width: "35.8rem",
								gap: "5px",
								flexDirection: "row",
								display: "flex",
								justifyContent: "flex-start",
							}}
						>
							{/* <FormControl sx={{display: "flex", width:"50%",}}>
									<InputLabel id="demo-simple-select-label">Gender</InputLabel>
										<Select
											labelId="demo-simple-select-label"
											id="demo-simple-select"
											value={gender}
											label="gender"
											required
											onChange={handleGender}
											>
																		
											<MenuItem value='Male'>Male</MenuItem>
											<MenuItem value='Female'>Female</MenuItem>
										</Select>
								</FormControl> */}
							<TextField
								sx={{ display: "flex", width: "50%" }}
								type="suffix"
								label="Suffix"
								variant="outlined"
								onChange={(e) => setSuffix(e.target.value)}
							/>
							<TextField
								sx={{ display: "flex", width: "50%" }}
								type="text"
								label="Birth Date"
								variant="outlined"
								required
								placeholder="MM/DD/YYYY" // Custom placeholder
								onFocus={(e) => (e.target.type = "date")} // Change to date type on focus
								onBlur={(e) =>
									!e.target.value && (e.target.type = "text")
								} // Revert to text type if no value
								onChange={handleBday}
								value={bday}
							/>

							<ToastContainer />
						</Form.Group>

						<Form.Group className="mb-3" controlId="email">
							{" "}
							{/*USER'S EMAIL   USER'S EMAIL   USER'S EMAIL*/}
							<TextField
								sx={{ display: "flex" }}
								type="email"
								label="Email"
								variant="outlined"
								required
								onChange={handleEmailChange}
								error={Boolean(emailError)}
								helperText={emailError}
							/>
						</Form.Group>

						<Form.Group className="mb-3" controlId="password">
							{" "}
							{/*USER'S PASSWORD   USER'S PASSWORD   USER'S PASSWORD*/}
							<TextField
								sx={{ display: "flex" }}
								type="password"
								label="Password"
								variant="outlined"
								required
								onChange={(e) => setPassword(e.target.value)}
							/>
							<Form.Text
								className="text-muted"
								style={{ marginTop: "0.5rem" }}
							>
								Password must be at least 8 characters long,
								include:
								<ul
									style={{
										margin: "0.5rem 0 0 1.5rem",
										padding: "0",
									}}
								>
									<li>At least one uppercase letter (A-Z)</li>
									<li>At least one lowercase letter (a-z)</li>
									<li>
										At least one special character (e.g.,
										!@#$%^&*)
									</li>
								</ul>
							</Form.Text>
							{/* <Form.Label>Password</Form.Label>
								<Form.Control type="password" required/> */}
						</Form.Group>
						<Form.Group
							className="mb-3"
							controlId="confirmPassword"
						>
							{/*USER'S CONFIRMED PASS   USER'S CONFIRMED PASS   USER'S CONFIRMED PASS*/}
							<TextField
								sx={{ display: "flex" }}
								type="Password"
								label="Confirm Password"
								variant="outlined"
								required
								onChange={(e) =>
									setConfirmPassword(e.target.value)
								}
							/>
						</Form.Group>
						<div className="mb-3">
							<Button
								type="submit"
								variant="outlined"
								sx={{
									border: "none",
									backgroundColor: "#f0c040",
									color: "black",
								}}
							>
								Sign Up
							</Button>
						</div>
						<div
							className="mb-3"
							style={{ display: "flex", gap: "5px" }}
						>
							<Typography>Already Have An Account?</Typography>
							<Link to={`/signin?redirect=${redirect}`}>
								Log In Here
							</Link>
						</div>
					</Form>
					<Modal show={showModal} onHide={() => setShowModal(false)}>
						<Modal.Header closeButton>
							<Modal.Title>Email Verification</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							{/* <p>Please check your email for a verification link. Once verified, you can continue.</p> */}
							<p>{modalMessage}</p>
						</Modal.Body>
						<Modal.Footer>
							<Button
								variant="primary"
								onClick={() => setShowModal(false)}
							>
								Close
							</Button>
						</Modal.Footer>
					</Modal>
				</Container>
			)}
		</>
	);
}

export default SignupScreen;
