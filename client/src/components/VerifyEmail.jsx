import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Button from "@mui/material/Button";
import RequestHandler from "../functions/RequestHandler";
function VerifyEmail() {
	//const [emailVerified, setEmailVerified] = useState(false);
	//const [showModal, setShowModal] = useState(true);
	const navigate = useNavigate();
	const { search } = useLocation();
	const [isVerified, setIsVerified] = useState(false);
	const [message, setMessage] = useState("");
	//const token = new URLSearchParams(search).get('token');

	useEffect(() => {
		const verifyEmail = async () => {
			const token = new URLSearchParams(search).get("token");
			if (token) {
				try {
					const data = await RequestHandler.handleRequest(
						"get",
						`/api/users/verify-email?token=${token}`
					);
					console.log("note data", data);
					setIsVerified(true);
					setMessage(data.message);
					// if(data.verified){
					//     setEmailVerified(true);
					//     setTimeout(() => {
					//         navigate('/signin')
					//     }, 3000);
					// }
				} catch (err) {
					setIsVerified(false);
					setMessage("Email Verification Fail");
					//console.error('Email Verification Fail', err);
				}
			} else {
				setMessage("no token found");
			}
		};
		verifyEmail();
		// if (token) {
		//     verifyEmail();
		// }else {
		//     console.error('No Email found in query string..');
		// }
	}, [search]);
	return (
		//     <Modal show={showModal}>
		//     <Modal.Header closeButton>
		//           <Modal.Title>Email Verification</Modal.Title>
		//     </Modal.Header>
		//           <Modal.Body>
		//             {emailVerified ? (
		//                 <p>Your email is successfully verified! Redirecting to the sign-in page...</p>
		//             ) : (
		//             <p>Verifying your email, please wait...</p>)
		//             }

		//           </Modal.Body>
		//           <Modal.Footer>
		//             <Button variant='primary' onClick={() => setShowModal(false)}>
		//               Close
		//             </Button>

		//           </Modal.Footer>

		//   </Modal>
		<Container>
			<h1></h1>
			<p>{message}</p>
			{isVerified && (
				<Button
					variant="contained"
					color="primary"
					onClick={() => navigate("/signin")}
				>
					Go to Sign in
				</Button>
			)}
		</Container>
	);
}

export default VerifyEmail;
