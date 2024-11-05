import React, { useContext, useReducer, useState } from "react";
import { Helmet } from "react-helmet-async";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Store } from "../Store";
import { toast } from "react-toastify";
import getError from "../utils";
import axios from "axios";
import { Box, TextField } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import RequestHandler from "../functions/RequestHandler";

const reducer = (state, action) => {
	switch (action.type) {
		case "UPDATE_REQUEST":
			return { ...state, loadingUpdate: true };
		case "UPDATE_SUCCESS":
			return { ...state, loadingUpdate: false };
		case "UPDATE_FAIL":
			return { ...state, loadingUpdate: false };

		default:
			return state;
	}
};

export default function ProfileScreen() {
	const { state, dispatch: ctxDispatch } = useContext(Store);
	const { userInfo } = state;
	const [name, setName] = useState(userInfo.name);
	const [middlename, setMiddleName] = useState(userInfo.middlename);
	const [lastname, setLastName] = useState(userInfo.lastname);
	const [suffix, setSuffix] = useState(userInfo.suffix);
	const [email, setEmail] = useState(userInfo.email);
	const [birthday, setBirthday] = useState(
		new Date(userInfo.birthday).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		})
	);
	const [location, setLocation] = useState(userInfo.location);
	const [phoneNum, setPhoneNum] = useState(userInfo.phoneNum);

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [bday, setBday] = useState("");
	const [gender, setGender] = useState("");

	const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
		loadingUpdate: false,
	});

	const handleBday = (event) => {
		const digits = event.target.value.replace(/[^0-9 -/]/g, "");
		const newValue = digits.slice(0, 9);
		setBday(newValue);
	};
	const handleGender = (e) => {
		setGender(e.target.value);
	};

	const submitHandler = async (e) => {
		e.preventDefault();
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"users/profile",
				{
					id: userInfo.id,
					name,
					lastname,
					middlename,
					suffix,
					location,
					phoneNum,
					password,
					confirmPassword,
				},
				{
					headers: { Authorization: `Bearer ${userInfo.token}` },
				}
			);
			dispatch({
				type: "UPDATE_SUCCESS",
			});
			ctxDispatch({ type: "USER_SIGNIN", payload: data });
			localStorage.setItem("userInfo", JSON.stringify(data));
			toast.success("User updated successfully");
		} catch (err) {
			dispatch({
				type: "FETCH_FAIL",
			});
			toast.error(getError(err));
		}
	};

	return (
		<div className="container small-container">
			<Helmet>
				<title>User Profile</title>
			</Helmet>
			<h1 className="my-3">
				<center>User Profile</center>
			</h1>
			<form onSubmit={submitHandler}>
				<div
					style={{
						width: "100%",
						display: "flex",
						flexDirection: "row",
						gap: "10px",
						marginBottom: "20px",
					}}
				>
					<TextField
						sx={{ display: "flex", width: "33%" }}
						label="First Name"
						variant="outlined"
						value={name}
						required
						onChange={(e) => setName(e.target.value)}
					/>
					<TextField
						sx={{ display: "flex", width: "33%" }}
						label="Middle Name"
						variant="outlined"
						value={middlename}
						required
						onChange={(e) => setMiddleName(e.target.value)}
					/>
					<TextField
						sx={{ display: "flex", width: "33%" }}
						label="Last Name"
						variant="outlined"
						value={lastname}
						required
						onChange={(e) => setLastName(e.target.value)}
					/>
				</div>

				<div
					style={{
						width: "100%",
						display: "flex",
						flexDirection: "row",
						gap: "10px",
						marginBottom: "20px",
					}}
				>
					<TextField
						sx={{ display: "flex", width: "33%" }}
						label="Suffix"
						variant="outlined"
						value={suffix}
						onChange={(e) => setSuffix(e.target.value)}
					/>
					<div style={{ display: "flex", width: "33%" }} />
					<TextField
						sx={{ display: "flex", width: "33%" }}
						label="Birthday"
						variant="outlined"
						value={birthday}
						disabled
					/>
				</div>

				<div
					style={{
						width: "100%",
						display: "flex",
						flexDirection: "row",
						gap: "10px",
						marginBottom: "20px",
					}}
				>
					<TextField
						sx={{ display: "flex", width: "100%" }}
						label="Address"
						variant="outlined"
						value={location}
						onChange={(e) => setLocation(e.target.value)}
					/>
				</div>

				<div
					style={{
						width: "100%",
						display: "flex",
						flexDirection: "row",
						gap: "10px",
						marginBottom: "20px",
					}}
				>
					<TextField
						sx={{ display: "flex", width: "50%" }}
						label="Phone Number"
						variant="outlined"
						value={phoneNum}
						onChange={(e) => setPhoneNum(e.target.value)}
					/>
					<TextField
						sx={{ display: "flex", width: "50%" }}
						label="Email Address"
						variant="outlined"
						value={email}
						disabled
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>

				{/* <div
					style={{
						width: "100%",
						display: "flex",
						flexDirection: "row",
						gap: "10px",
						marginBottom: "20px",
					}}
				>
					<TextField
						sx={{ display: "flex", width: "100%" }}
						label="Password"
						variant="outlined"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
				<div
					style={{
						width: "100%",
						display: "flex",
						flexDirection: "row",
						gap: "10px",
						marginBottom: "20px",
					}}
				>
					<TextField
						sx={{ display: "flex", width: "100%" }}
						label="Confirm Password"
						variant="outlined"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
					/>
				</div> */}
				<div className="mb-3">
					<Button className="btn-secondary" type="submit">
						UPDATE
					</Button>
				</div>
			</form>
		</div>
	);
}
