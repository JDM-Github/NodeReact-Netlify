import React, { useState } from "react";
import { toast } from "react-toastify";
import RequestHandler from "../functions/RequestHandler.js";

function ForgotPasswordScreen() {
	const [email, setEmail] = useState("");

	const submitHandler = async (e) => {
		e.preventDefault();
		try {
			await RequestHandler.handleRequest(
				"post",
				"users/forgot-password",
				{ email }
			);
			toast.success("Password reset email sent!");
		} catch (err) {
			alert(err);
			toast.error("Error sending password reset email.");
		}
	};

	return (
		<div className="container d-flex justify-content-center align-items-center ">
			<div className="col-md-6">
				<div className="card shadow">
					<div className="card-body">
						<h1 className="card-title text-center">
							Forgot Password
						</h1>
						<p className="text-center">
							Enter your email address and we'll send you a link
							to reset your password.
						</p>
						<form onSubmit={submitHandler}>
							<div className="form-group mb-3">
								<label htmlFor="email">Email Address</label>
								<input
									type="email"
									className="form-control"
									id="email"
									placeholder="Enter your email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
							<div className="d-grid gap-2">
								<button
									type="submit"
									className="btn btn-primary btn-block"
								>
									Send Reset Link
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ForgotPasswordScreen;
