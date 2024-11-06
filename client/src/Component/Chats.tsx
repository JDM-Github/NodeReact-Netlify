import React, { ReactElement, useEffect, useRef, useState } from "react";
import "./Chats.scss";

import RequestHandler from "../Functions/RequestHandler.js";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faReply,
	faHeart,
	faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import FormMaker from "./FormMaker.tsx";

function Message({
	text,
	isSent,
	replyText,
	replyTo,
	onReply,
	onDelete,
	chatPartner,
	openForm,
}) {
	const isOffer =
		text.startsWith("::service::") && text.includes("::price::");
	const offerDetails = isOffer
		? text.match(/::service::"(.+?)",::price::"(\d+?)"/)
		: null;

	const service = offerDetails ? offerDetails[1] : null;
	const price = offerDetails ? offerDetails[2] : null;
	const id = offerDetails ? offerDetails[3] : 1;
	const serviceUrl = offerDetails
		? offerDetails[4]
		: "https://i.pinimg.com/736x/f7/ac/88/f7ac88a1963942fe198262445a200595.jpg";

	return (
		<>
			{replyText && replyText !== "" ? (
				<>
					<div className={`reply-to ${isSent ? "sent" : "received"}`}>
						{isSent ? "You" : chatPartner} replied to {replyTo}
					</div>
					<div
						className={`reply-message ${
							isSent ? "sent" : "received"
						}`}
					>
						{replyText}
					</div>
				</>
			) : null}
			<div
				className={`message ${isSent ? "sent" : "received"} ${
					isOffer ? "offer-message" : ""
				}`}
			>
				{/* Display formatted offer if it is an offer message */}
				{isOffer ? (
					<>
						<div className="offer-details">
							<strong>Service:</strong> {service} <br />
							<strong>Price:</strong> ${price}
						</div>
						<button
							className="take-offer-button"
							onClick={() => {
								openForm(service, id, serviceUrl);
							}}
						>
							Take Offer
						</button>
					</>
				) : (
					<>{text}</>
				)}
				<div className="message-buttons">
					<button onClick={onReply}>
						<FontAwesomeIcon icon={faReply} />
					</button>
					<button onClick={onDelete}>
						<FontAwesomeIcon icon={faTrashAlt} />
					</button>
				</div>
			</div>
		</>
	);
}

export default function ChatWindow({ chatPartner, partnerId = "" }) {
	const navigate = useNavigate();
	useEffect(() => {
		if (localStorage.getItem("users") === null) {
			sessionStorage.setItem("error-message", "Invalid User Token");
			navigate("/");
		}
		sessionStorage.removeItem("error-message");
	}, []);
	const user = JSON.parse(localStorage.getItem("users") || "{}");

	const [newMessage, setNewMessage] = useState("");
	const [replyMessage, setReplyMessage] = useState("");
	const [replyUser, setReplyUser] = useState("");

	const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
	const [selectedService, setSelectedService] = useState("");
	const [price, setPrice] = useState("");

	const createOffer = () => {
		setIsOfferModalOpen(true);
	};

	const submitOffer = () => {
		const service = JSON.parse(selectedService);

		const offerString = `::service::"${service.serviceName}",::price::"${price}",::id::"${service.id}",::serviceUrl::"${service.serviceUrl}"`;

		handleSendMessage(offerString);
		setIsOfferModalOpen(false);
		setSelectedService("");
		setPrice("");
	};

	interface Message {
		sender: string;
		text: string;
		replyText: string;
		replyTo: string;
	}
	interface Chat {
		id: string;
		userId: string;
		messages: Message[];
	}
	const [allMessages, setAllMessages] = useState<Chat>();
	const getAllMessage = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"chats/user",
				{ id: partnerId != "" ? partnerId : user.id }
			);

			if (data.success) {
				setAllMessages(data.chat);
			} else {
				toast.error(
					data.message ||
						"Reloading chats failed, please check your credentials."
				);
			}
		} catch (error) {
			toast.error(`An error occurred. ${error}`);
		}
	};

	const updateMessage = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"chats/send-chat",
				{ oldChat: allMessages }
			);
			if (!data.success) {
				toast.error(
					data.message ||
						"Reloading chats failed, please check your credentials."
				);
			}
		} catch (error) {
			toast.error(`An error occurred while logging in. ${error}`);
		}
	};
	const messagesEndRef = useRef<HTMLDivElement | null>(null);
	const scrollDown = (behavior) => {
		if (messagesEndRef.current)
			messagesEndRef.current.scrollIntoView({ behavior: behavior });
	};

	useEffect(() => {
		if (chatPartner !== "") {
			getAllMessage();
			scrollDown("instant");
		}
	}, [chatPartner]);

	useEffect(() => {
		if (allMessages) {
			updateMessage();
			scrollDown("smooth");
		}
	}, [allMessages]);

	const handleSendMessage = async (message = "") => {
		let targetMessage = newMessage;
		if (message !== "") targetMessage = message;

		if (targetMessage.trim()) {
			const newMess = {
				sender: user.id,
				replyText: replyMessage,
				replyTo: replyUser,
				text: targetMessage,
			};
			if (allMessages) {
				const updatedMessages = allMessages.messages
					? [...allMessages.messages, newMess]
					: [newMess];

				const newChat = {
					...allMessages,
					messages: updatedMessages,
				};
				setAllMessages(newChat);
			}

			setNewMessage("");
			setReplyMessage("");
			setReplyUser("");
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			handleSendMessage();
		}
	};

	const handleReply = (index) => {
		if (allMessages) {
			setReplyMessage(allMessages.messages[index].text);
			setReplyUser(allMessages.messages[index].sender);
		}
	};

	const handleDelete = (index) => {
		// setMessages(messages.filter((_, i) => i !== index));
	};

	interface Service {
		id: number;
		serviceName: string;
		serviceURL: string;
		serviceImg: string;
		serviceDescription: string;
	}

	const AllTarget = {
		// "DTI REGISTRATION": <DTIRegistration />,
	};

	const [formname, setFormName] = useState<string>();
	const [showForm, setShowForm] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [targetForm, setTargetForm] = useState<ReactElement | null>(null);
	const [formlink, setFormLink] = useState<string>("");
	const [formid, setFormId] = useState<string>("");
	const [formimg, setFormImg] = useState("");
	const [description, setDescription] = useState("");

	const [services, setServices] = useState<Service[]>();
	const removeForm = () => {
		setShowForm(false);
		setTargetForm(null);
	};

	const getAllService = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"service/get_services"
			);

			if (data.success) {
				setServices(data.services);
			} else {
				toast.error(
					data.message ||
						"Reloading services failed, please check your credentials."
				);
			}
		} catch (error) {
			toast.error(`An error occurred. ${error}`);
		}
	};

	useEffect(() => {
		getAllService();
	}, []);

	const handleShowForm = (target, id, link) => {
		setFormName(target);
		setTargetForm(AllTarget[target] || null);
		setFormLink(link);
		setFormId(id);
		setShowForm(true);
	};

	const handleShowDetailed = (target, image, desc) => {
		setFormName(target);
		setFormImg(image);
		setDescription(desc);
		setShowDetails(true);
	};

	return (
		<>
			<div className="chat-window">
				<div className="chat-header">
					<div>{chatPartner}</div>
				</div>
				<div className="message-container">
					{allMessages &&
						allMessages.messages &&
						allMessages.messages.length > 0 &&
						allMessages.messages?.map((message, index) => (
							<Message
								key={index}
								text={message.text}
								isSent={message.sender == user.id}
								replyText={message.replyText}
								replyTo={
									message.replyTo == user.id
										? message.sender == user.id
											? "yourself"
											: "himself"
										: chatPartner
								}
								onReply={() => handleReply(index)}
								onDelete={() => handleDelete(index)}
								chatPartner={chatPartner}
								openForm={handleShowForm}
							/>
						))}
					<div ref={messagesEndRef} />
				</div>
				{replyMessage && replyMessage !== "" ? (
					<div className="reply-input">
						<b>
							Replying to{" "}
							{replyUser == user.id ? "yourself" : chatPartner}
						</b>
						: {replyMessage}
					</div>
				) : null}
				<div className="message-input">
					<input
						type="text"
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						placeholder="Type a message..."
						onKeyDown={handleKeyDown}
					/>

					{user.id === "ADMIN" && (
						<button className="offer" onClick={createOffer}>
							Create Offer
						</button>
					)}
					<button onClick={() => handleSendMessage()}>Send</button>
				</div>

				{isOfferModalOpen && (
					<div className="chat-offer-modal-overlay">
						<div className="modal">
							<h3>Create Offer</h3>
							<label>
								Service:
								<select
									value={selectedService}
									onChange={(e) =>
										setSelectedService(e.target.value)
									}
								>
									<option value="" disabled>
										Select a service
									</option>
									{services &&
										services.map((service, index) => (
											<option
												key={index}
												value={JSON.stringify(service)}
											>
												{service.serviceName}
											</option>
										))}
								</select>
							</label>
							<label>
								Price:
								<input
									type="number"
									value={price}
									onChange={(e) => setPrice(e.target.value)}
									placeholder="Enter price"
								/>
							</label>
							<div className="modal-buttons">
								<button
									className="submit-button"
									onClick={submitOffer}
								>
									Submit Offer
								</button>
								<button
									className="cancel-button"
									onClick={() => setIsOfferModalOpen(false)}
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
			{showForm && (
				<FormMaker
					removeForm={removeForm}
					formComp={targetForm}
					formName={formname}
					formLink={formlink}
					serviceId={formid}
				/>
			)}
		</>
	);
}
