import React, { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useReducer } from "react";
import axios from "axios";
import getError from "../utils";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Store } from "../Store";
import Col from "react-bootstrap/esm/Col";
import Card from "react-bootstrap/esm/Card";
import Button from "react-bootstrap/esm/Button";
import Row from "react-bootstrap/esm/Row";
import { Helmet } from "react-helmet-async";
import ListGroup from "react-bootstrap/ListGroup";
import { toast } from "react-toastify";
import RequestHandler from "../functions/RequestHandler";

const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true };
		case "FETCH_SUCCESS":
			return { ...state, custom: action.payload, loading: false };
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };

		default:
			return state;
	}
};

const CustomizeScreen = () => {
	const { state } = useContext(Store);
	const {
		userInfo,
		cart: { shippingAddress },
	} = state;
	const params = useParams();
	const { id: customId } = params;
	const [selectedImage, setSelectedImage] = useState("");

	const [{ loading, error, custom }, dispatch] = useReducer(reducer, {
		custom: [],
		loading: true,
		error: "",
	});

	useEffect(() => {
		const fetchData = async () => {
			dispatch({ type: "FETCH_REQUEST" });
			try {
				const result = await RequestHandler.handleRequest(
					"get",
					`custom/${customId}`
				);
				dispatch({ type: "FETCH_SUCCESS", payload: result.data });
			} catch (err) {
				dispatch({ type: "FETCH_FAIL", payload: getError(err) });
			}
			//setProducts(result.data);
		};
		fetchData();
	}, [customId]);

	return loading ? (
		<LoadingBox />
	) : error ? (
		<MessageBox variant="danger">{error}</MessageBox>
	) : (
		// {custom.id}
		// {userInfo.name}
		// {userInfo.lastname}
		// <img
		//   className='img-large'
		//     src={selectedImage || custom.image}
		//       alt={custom.id}/>

		// {custom.description}

		// {
		//           [custom.image, ...custom.images].map((x) =>(
		//             <Col key={x}>
		//               <Card>
		//                 <Button
		//                 className='thumbnail'
		//                 type='button'
		//                 variant='light'
		//                 onClick={() => setSelectedImage(x)}>
		//                   <Card.Img
		//                   variant='top'
		//                   src={x}
		//                   alt='custom'/>
		//                 </Button>
		//               </Card>
		//             </Col>
		//           ))
		//         }

		<div>
			<Row style={{ paddingTop: "2rem" }}>
				<div
					style={{
						display: "flex",
						flexDirection: "row-reverse",
						gap: "0",
					}}
				>
					<Col md={6} style={{ paddingTop: "30px" }}>
						<img
							className="img-large"
							src={selectedImage || custom.image}
							alt=""
						/>
					</Col>

					<Col md={3}>
						<ListGroup variant="flush">
							<ListGroup.Item>
								<Helmet>
									<title>{custom.id}</title>
								</Helmet>
								<div
									style={{
										display: "flex",
										justifyContent: "flex-end",
									}}
								>
									<h1>Customize Request #{custom.id}</h1>
								</div>
							</ListGroup.Item>

							<ListGroup.Item>
								<Row xs={1} md={2} className="g-2">
									{[custom.image, ...custom.images].map(
										(x) => (
											<Col key={x}>
												<Card>
													<Button
														className="thumbnail"
														type="button"
														variant="light"
														onClick={() =>
															setSelectedImage(x)
														}
													>
														<Card.Img
															variant="top"
															src={x}
															alt="product"
														/>
													</Button>
												</Card>
											</Col>
										)
									)}
								</Row>
							</ListGroup.Item>
							<ListGroup.Item>
								<div
									style={{
										display: "flex",
										justifyContent: "flex-end",
									}}
								>
									Name: {custom.name} {custom.lastname}
								</div>
								<div
									style={{
										display: "flex",
										justifyContent: "flex-end",
									}}
								>
									Contact: {custom.phoneNum}
								</div>
								<div
									style={{
										display: "flex",
										justifyContent: "flex-end",
									}}
								>
									Description:
								</div>
								<div
									style={{
										display: "flex",
										justifyContent: "flex-end",
									}}
								>
									<p>{custom.description}</p>
								</div>
							</ListGroup.Item>
						</ListGroup>
					</Col>
				</div>
			</Row>
		</div>
	);
};

export default CustomizeScreen;
