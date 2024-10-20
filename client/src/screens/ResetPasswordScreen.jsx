import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import RequestHandler from "../functions/RequestHandler.js";

function ResetPasswordScreen() {
	const [password, setPassword] = useState("");
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");

	const submitHandler = async (e) => {
		e.preventDefault();
		try {
			await RequestHandler.handleRequest("post", "users/reset-password", {
				token,
				password,
			});
			toast.success("Password reset successful!");
			navigate("/signin");
		} catch (err) {
			toast.error("Failed to reset password");
		}
	};

	return (
		<div className="container d-flex justify-content-center align-items-center">
			<div className="col-md-6">
				<div className="card shadow">
					<div className="card-body">
						<h1 className="card-title text-center">
							Reset Password
						</h1>
						<p className="text-center">
							Enter your new password to reset it.
						</p>
						<form onSubmit={submitHandler}>
							<div className="form-group mb-3">
								<label htmlFor="password">New Password</label>
								<input
									type="password"
									className="form-control"
									id="password"
									placeholder="Enter new password"
									required
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
								/>
							</div>
							<div className="d-grid gap-2">
								<button
									type="submit"
									className="btn btn-primary btn-block"
								>
									Reset Password
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ResetPasswordScreen;
