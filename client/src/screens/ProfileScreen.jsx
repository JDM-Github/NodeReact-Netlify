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
	const [lastname, setLastName] = useState(userInfo.lastname);
	const [email, setEmail] = useState(userInfo.email);
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
				"put",
				"users/profile",
				{
					name,
					lastname,
					email,
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
			<h1 className="my-3">User Profile</h1>
			<form onSubmit={submitHandler}>
				<Form.Group className="mb-3" controlId="name">
					<Box
						sx={{
							display: "flex",
							gap: "5px",
							justifyContent: "flex-start",
							flexDirection: "row",
						}}
					>
						<div
							style={{
								width: "36rem",
								display: "flex",
								flexDirection: "row",
								gap: "10px",
							}}
						>
							<TextField
								sx={{ display: "flex", width: "50%" }}
								label="First Name"
								variant="outlined"
								value={name}
								required
								onChange={(e) => setName(e.target.value)}
							/>
							<TextField
								sx={{ display: "flex", width: "50%" }}
								label="Surname"
								variant="outlined"
								value={lastname}
								onChange={(e) => setLastName(e.target.value)}
								required
							/>
							{/* <Form.Label>First Name</Form.Label><br></br>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{width:"50%",border: "2px solid orange"}}
          />
          
          <Form.Label>Last Name</Form.Label><br></br>
          <Form.Control style={{width:"50%",border: "2px solid orange"}}/> */}
						</div>
					</Box>
				</Form.Group>

				<Form.Group className="mb-3" controlId="bdayGender">
					<Box
						sx={{
							display: "flex",
							gap: "5px",
							justifyContent: "flex-start",
							flexDirection: "row",
						}}
					>
						<div
							style={{
								width: "36rem",
								display: "flex",
								flexDirection: "row",
								gap: "10px",
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
            </FormControl>  */}
							<TextField
								sx={{ display: "flex", width: "50%" }}
								label="Month/Date/Year"
								variant="outlined"
								value={bday}
								onChange={handleBday}
								required
							/>
						</div>
					</Box>
				</Form.Group>

				<Form.Group className="mb-3" controlId="name">
					<Form.Label>Email</Form.Label>
					<Form.Control
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						style={{ border: "2px solid orange" }}
					/>
				</Form.Group>
				<Form.Group className="mb-3" controlId="password">
					<Form.Label>Password</Form.Label>
					<Form.Control
						type="password"
						onChange={(e) => setPassword(e.target.value)}
						style={{ border: "2px solid orange" }}
					/>
				</Form.Group>
				<Form.Group className="mb-3" controlId="password">
					<Form.Label>Confirm Password</Form.Label>
					<Form.Control
						type="password"
						onChange={(e) => setConfirmPassword(e.target.value)}
						style={{ border: "2px solid orange" }}
					/>
				</Form.Group>
				<div className="mb-3">
					<Button type="submit">Update</Button>
				</div>
			</form>
		</div>
	);
}
