const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		messages: [
			{
				text: { type: String, required: true },
				sender: { type: String, required: true },
				user: { type: String, required: true },
				createdAt: { type: Date, default: Date.now },
			},
		],
	},
	{
		timestamps: true,
	}
);

const customizeSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, unique: true },
		lastname: { type: String, required: true },
		image: { type: String, required: true },
		images: [String],
		phoneNum: { type: Number, required: true },
		description: { type: String, required: true },
	},
	{ timestamps: true }
);

const orderSchema = new mongoose.Schema(
	{
		orderItems: [
			{
				slug: { type: String, required: true },
				name: { type: String, required: true },
				quantity: { type: Number, required: true },
				image: { type: String, required: true },
				price: { type: Number, required: true },
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
			},
		],
		shippingAddress: {
			LastName: { type: String, required: true },
			fullName: { type: String, required: true },
			address: { type: String, required: true },
			city: { type: String, required: true },
			postalCode: { type: Number, required: true },
		},
		paymentMethodName: { type: String, required: true },
		referenceNumber: { type: String, required: true },
		paymentImage: { type: String, required: true },
		paymentResult: {
			id: String,
			status: String,
			update_time: String,
			email_address: String,
		},
		itemsPrice: { type: Number, required: true },
		shippingPrice: { type: Number, required: true },
		taxPrice: { type: Number, required: true },
		totalPrice: { type: Number, required: true },
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		isPaid: { type: Boolean, default: false },
		paidAt: { type: Date },
		proofOfDeliveryImage: { type: String },
		isDelivered: { type: Boolean, default: false },
		deliveredAt: { type: Date },
	},
	{
		timestamps: true,
	}
);

const paymentSchema = new mongoose.Schema(
	{
		paymentMethod: { type: String, required: true },
		referenceNumber: { type: String, required: true },
		paymentImage: { type: String, required: true },
	},
	{ timestamps: true }
);

const reviewSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		comment: { type: String, requried: true },
		rating: { type: Number, required: true },
	},
	{
		timestamps: true,
	}
);

const productSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, unique: true },
		slug: { type: String, requred: true, unique: true },
		image: { type: String, required: true },
		images: [String],
		brand: { type: String, required: true },
		category: { type: String, required: true },
		description: { type: String, required: true },
		price: { type: Number, required: true },
		countInStock: { type: Number, required: true },
		rating: { type: Number, required: true },
		numReviews: { type: Number, required: true },
		isArchived: { type: Boolean, default: false },
		archivedAt: { type: Date },
		reviews: [reviewSchema],
	},
	{ timestamps: true }
);

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		middlename: { type: String, required: false },
		lastname: { type: String, required: true },
		suffix: { type: String, required: false },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		isAdmin: { type: Boolean, default: false, required: true },
		isRider: { type: Boolean, default: false, required: true },
		isCustomer: { type: Boolean, default: false, required: true },
		isVerified: { type: Boolean, default: false },
		verificationToken: { type: String },
		passwordResetToken: String,
		passwordResetExpires: Date,
	},
	{ timestamps: true }
);

const imageSchema = new mongoose.Schema(
	{
		imageUrl: { type: String, required: true },
		paymentMethod: { type: String, required: true },
		referenceNumber: { type: String, required: true },
	},
	{
		timestamps: true,
	}
);

const UploadedImage = mongoose.model("UploadedImage", imageSchema);
const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Payment = mongoose.model("Payment", paymentSchema);
const Order = mongoose.model("Order", orderSchema);
const Customize = mongoose.model("Customize", customizeSchema);
const Chat = mongoose.model("Chat", chatSchema);
module.exports = {
	Chat,
	Customize,
	Order,
	Payment,
	Product,
	User,
	UploadedImage,
};
