const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const path = require("path");
const bodyParser = require("body-parser");

const expressAsyncHandler = require("express-async-handler");

const { sequelize } = require("./models");
const {
	userRouter,
	chatRouter,
	reqRouter,
	servRouter,
	appointmentRouter,
} = require("./routers.js");

class App {
	constructor() {
		this.app = express();
		this.router = express.Router();
		this.DEVELOPMENT = false;

		this.setupMiddleware();
		this.setupRoutes();
	}

	setupMiddleware() {
		if (this.DEVELOPMENT) {
			this.app.use(
				cors({
					origin: "http://localhost:3000",
					credentials: true,
					optionSuccessStatus: 200,
				})
			);
		} else {
			this.app.use(cors());
		}

		this.app.use(bodyParser.json());
		this.app.use(express.json());
		this.app.use(express.static(path.join(__dirname, "../client/build")));
	}

	setupRoutes() {
		this.router.use("/users", userRouter);
		this.router.use("/chats", chatRouter);
		this.router.use("/request", reqRouter);
		this.router.use("/service", servRouter);
		this.router.use("/appointment", appointmentRouter);

		this.router.get("/reset", expressAsyncHandler(this.reset));
		this.router.post("/request_account", this.requestAccount);
		this.router.get("*", this.handleCatchAll);

		this.app.use("/.netlify/functions/api", this.router);
	}

	requestAccount(req, res) {
		console.log("REQUEST TO ADMIN");
		res.json("REQUEST TO ADMIN IS SUCCESS");
	}

	handleCatchAll(req, res) {
		res.sendFile(path.join(__dirname, "../client/build", "index.html"));
	}

	async reset(req, res) {
		await sequelize.sync({ force: true });
		res.send("RESET DATABASE");
	}

	start() {
		return serverless(this.app);
	}
}

const appInstance = new App();
module.exports.handler = appInstance.start();
