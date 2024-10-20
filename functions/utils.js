const jwt = require("jsonwebtoken");

const generateToken = (user) => {
	return jwt.sign(
		{
			_id: user._id,
			name: user.name,
			email: user.email,
			isAdmin: user.isAdmin,
		},
		"somethingsecret",
		{
			expiresIn: "30d",
		}
	);
};

const isAuth = (req, res, next) => {
	const authorization = req.headers.authorization;

	if (authorization) {
		const token = authorization.slice(7, authorization.length); // Remove "Bearer " prefix
		jwt.verify(token, "somethingsecret", (err, decode) => {
			if (err) {
				return res.status(401).send({ message: "Invalid Token" });
			}
			req.user = decode; // Attach decoded user info to req object
			next();
		});
	} else {
		res.status(401).send({ message: "No Token Provided" });
	}
};

const isAdmin = (req, res, next) => {
	if (req.user && req.user.isAdmin) {
		next();
	} else {
		res.status(401).send({ message: "Invalid Admin Token" });
	}
};

module.exports = { generateToken, isAdmin, isAuth };
