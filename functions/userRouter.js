const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const express = require("express");
const nodemailer = require("nodemailer");
const expressAsyncHandler = require("express-async-handler");

const { generateToken, isAuth } = require("./utils.js");
const { User } = require("./models2");
const { where } = require("sequelize");

dotenv.config();
const userRouter = express.Router();

const generateVerificationToken = (email) => {
	return jwt.sign({ email }, "somethingsecret", { expiresIn: "1h" });
};
userRouter.get(
	"/verify-email",
	expressAsyncHandler(async (req, res) => {
		const token = req.query.token;
		console.log("Received Token:", token);

		if (!token) {
			return res.status(400).json({ message: "No tokenn" });
		}
		try {
			const decoded = jwt.verify(token, "somethingsecret");
			const user = await User.findOne({
				where: { email: decoded.email },
			});
			if (!user) {
				return res
					.status(400)
					.json({ message: "Invalid token or user not found" });
			}

			user.isVerified = true;
			await user.save();
			const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verified</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f9;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                    }
                    .container {
                        background-color: white;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        text-align: center;
                        max-width: 400px;
                        width: 100%;
                    }
                    .container h1 {
                        color: #4CAF50;
                        font-size: 24px;
                    }
                    .container p {
                        color: #333;
                        font-size: 16px;
                    }
                    .button {
                        background-color: #4CAF50;
                        color: white;
                        padding: 10px 20px;
                        text-decoration: none;
                        border-radius: 5px;
                        display: inline-block;
                        margin-top: 20px;
                    }
                    .button:hover {
                        background-color: #45a049;
                    }
                </style>
            </head>
            <body>

                <div class="container">
                    <h1>Email Verified</h1>
                    <p>Your email has been successfully verified!</p>
                    <a href="https://kca-test-website.netlify.app/signin" class="button">Sign in</a>
                </div>

            </body>
            </html>

            `;
			res.status(200).send(htmlContent);
		} catch (error) {
			return res
				.status(400)
				.json({ message: "Invalid or expired token." });
		}
	})
);

userRouter.post(
	"/forgot-password",
	expressAsyncHandler(async (req, res) => {
		const { email } = req.body;
		const user = await User.findOne({ where: { email } });

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Generate reset token
		const resetToken = jwt.sign({ email: user.email }, "somethingsecret", {
			expiresIn: "1h",
		});

		const resetUrl = `https://kca-test-website.netlify.app/reset-password?token=${resetToken}`;
		const mailOptions = {
			from: "kcaligam@ccc.edu.ph",
			to: user.email,
			subject: "Password Reset",
			html: `
              <h2>Password Reset Request</h2>
              <p>Click the link below to reset your password:</p>
              <a href="${resetUrl}">Reset Password</a>
            `,
		};

		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: "kcaligam@ccc.edu.ph",
				pass: "qmcm hhlk pohs vyrh",
			},
		});
		await transporter.sendMail(mailOptions);

		res.status(200).json({ message: "Password reset email sent!" });
	})
);
userRouter.post(
	"/reset-password",
	expressAsyncHandler(async (req, res) => {
		const { token, password } = req.body;

		// Verify the token
		try {
			const decoded = jwt.verify(token, "somethingsecret");
			const user = await User.findOne({
				where: { email: decoded.email },
			});

			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			user.password = bcrypt.hashSync(password, 8);
			await user.save();

			res.status(200).json({ message: "Password updated successfully!" });
		} catch (error) {
			res.status(400).json({ message: "Invalid or expired token" });
		}
	})
);

userRouter.get("/check-verification-status", async (req, res) => {
	const { email } = req.query;
	try {
		const user = await User.findOne({ where: { email } });
		if (!user) {
			return res.status(404).send("User not found");
		}
		if (user.isVerified) {
			return res.json({ isVerified: true });
		}
		res.json({ isVerified: false });
	} catch (error) {
		res.status(500).send("Internaal server error");
	}
});
userRouter.get(
	"/",
	expressAsyncHandler(async (req, res) => {
		const users = await User.findAll();
		res.send(users);
	})
);

userRouter.put(
	"/:id",
	isAuth,
	expressAsyncHandler(async (req, res) => {
		const user = await User.findByPk(req.params.id);
		if (user) {
			user.name = req.body.name || user.name;
			user.email = req.body.email || user.email;
			user.isAdmin = Boolean(req.body.isAdmin);
			const updatedUser = await user.save();
			res.send({ message: "USER INFO IS UPDATED", user: updatedUser });
		} else {
			res.status(404).send({ message: "USER DO NOT EXIST. ERROR 404" });
		}
	})
);

userRouter.delete(
	"/:id",
	isAuth,
	expressAsyncHandler(async (req, res) => {
		const user = await User.findByPk(req.params.id);
		if (user && !user.isAdmin) {
			await user.destroy();
			res.send({ message: "Account Has Been Deleted" });
		} else if (user && user.isAdmin) {
			res.status(403).send({
				message: "Admin Account Cannot Be Deleted",
			});
		} else {
			res.status(404).send({ message: "USER DO NOT EXIST. ERROR 404" });
		}
	})
);

userRouter.post(
	"/signin",
	expressAsyncHandler(async (req, res) => {
		const user = await User.findOne({ where: { email: req.body.email } });
		if (user) {
			if (!user.isVerified) {
				res.status(401).send({
					message: "Please verify your email before sign in.",
				});
				return;
			}
			if (bcrypt.compareSync(req.body.password, user.password)) {
				res.send({
					id: user.id,
					name: user.name,
					middlename: user.middlename,
					lastname: user.lastname,
					suffix: user.suffix,
					birthday: user.birthday,
					location: user.location,
					phoneNum: user.phoneNum,
					email: user.email,
					password: user.password,
					isAdmin: user.isAdmin,
					isRider: user.isRider,
					token: generateToken(user),
				});
				return;
			}
		}
		res.status(401).send({
			message: "Wrong email or password. Please try again.",
		});
	})
);

userRouter.post(
	"/signup",
	expressAsyncHandler(async (req, res) => {
		const existingUser = await User.findOne({
			where: { email: req.body.email },
		});
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}
		const hashedPassword = bcrypt.hashSync(req.body.password, 8);
		const verificationToken = generateVerificationToken(req.body.email);
		const newUser = new User({
			name: req.body.name,
			middlename: req.body.middlename,
			lastname: req.body.lastname,
			suffix: req.body.suffix,
			email: req.body.email,
			bday: new Date(req.body.bday),
			password: hashedPassword,
			isAdmin: req.body.isAdmin || false,
			isCustomer: req.body.isCustomer || false,
			isVerified: false,
			verificationToken: verificationToken,
		});
		const user = await newUser.save();

		const verificationUrl = `https://kca-test-website.netlify.app/.netlify/functions/api/users/verify-email?token=${verificationToken}`;
		const mailOptions = {
			from: `"RYB Officials"<${"kcaligam@ccc.edu.ph"}>`,
			to: user.email,
			subject: "Email Verification",
			html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #979797;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    text-align: center; /* Center all text */
                }
                .header img {
                    max-width: 150px; /* Adjust logo size */
                }
                h1 {
                    font-size: 24px;
                    margin: 10px 0;
                }
                h3 {
                    font-size: 20px;
                    margin: 20px 0 10px;
                }
                p {
                    font-size: 16px;
                    margin: 0 0 20px;
                }
                .button {
                    display: inline-block;
                    background-color: black; /* Red color */
                    color: white;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    text-align: center;
                    font-size: 16px;
                    margin-bottom: 20px; /* Space below button */
                }
                .social-icons {
                    margin: 10px 0;
                }
                .social-icons img {
                    width: 24px; /* Size for icons */
                    margin: 0 5px; /* Space between icons */
                }
                .footer {
                    font-size: 12px;
                    color: #888;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://res.cloudinary.com/dkmfsx77a/image/upload/f_auto,q_auto/eywtbaz7t59z8yjrau7f" alt="RYB Logo"> <!-- Replace with your logo URL -->
                    <h1>RYB Sportswear and Tailoring</h1>
                </div>
                <h3>VERIFY YOUR EMAIL ADDRESS</h3>
                <p>Please confirm that you want to use this as your online account for RYB. Once it's done, you will be able to start purchasing.</p>
                <a href="${verificationUrl}" class="button">Confirm Email</a>
                <div class="social-icons">
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=busalovelyn@gmail.com" target="_blank"><img src="https://res.cloudinary.com/dkmfsx77a/image/upload/f_auto,q_auto/x2pjviwd8by44xbbiqen" alt="Gmail"></a> <!-- Replace with Gmail icon URL -->
                    <a href="https://www.facebook.com/jerseysacalamba" target="_blank"><img src="https://res.cloudinary.com/dkmfsx77a/image/upload/f_auto,q_auto/y7qneelissrmlvf9gzdm" alt="Facebook"></a> <!-- Replace with Facebook icon URL -->
                </div>
                <div class="footer">
                    <p>86 Burgos St. Brg. 6, Calamba, Philippines</p>
                </div>
            </div>
        </body>
        </html>
    `,
		};
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: "kcaligam@ccc.edu.ph",
				pass: "qmcm hhlk pohs vyrh",
			},
		});
		await transporter.sendMail(mailOptions);
		res.status(200).json({
			message:
				"Registration successful! Please check your email to verify your account.",
		});
	})
);

userRouter.post(
	"/profile",
	isAuth,
	expressAsyncHandler(async (req, res) => {
		const user = await User.findByPk(req.body.id);
		if (user) {
			user.name = req.body.name || user.name;
			user.middlename = req.body.middlename || user.middlename;
			user.lastname = req.body.lastname || user.lastname;
			user.suffix = req.body.suffix || user.suffix;

			user.location = req.body.location || user.location;
			user.phoneNum = req.body.phoneNum || user.phoneNum;
			user.birthday = req.body.birthday || user.birthday;

			if (req.body.password) {
				user.password = bcrypt.hashSync(req.body.password, 8);
			}

			const updatedUser = await user.save();

			res.send({
				id: updatedUser.id,
				name: updatedUser.name,
				middlename: updatedUser.middlename,
				lastname: updatedUser.lastname,
				suffix: updatedUser.suffix,
				location: updatedUser.location,
				phoneNum: updatedUser.phoneNum,
				birthday: updatedUser.birthday,
				email: updatedUser.email,
				isRider: updatedUser.isRider,
				isAdmin: updatedUser.isAdmin,
				token: generateToken(updatedUser),
			});
		} else {
			res.status(404).send({ message: "USER DO NOT EXIST. ERROR 404" });
		}
	})
);

userRouter.get(
	"/:id",
	isAuth,
	expressAsyncHandler(async (req, res) => {
		const user = await User.findByPk(req.params.id);
		if (user) {
			res.send(user);
		} else {
			res.status(404).send({ message: "USER DO NOT EXIST. ERROR 404" });
		}
	})
);

module.exports = { userRouter };
