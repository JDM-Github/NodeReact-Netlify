"use strict";

const bcrypt = require("bcryptjs"); // Ensure you have bcrypt installed

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const hashedAdminPassword = await bcrypt.hash("admin", 10);
		const hashedClientPassword = await bcrypt.hash("client", 10);
		const hashDriverPassword = await bcrypt.hash("rider", 10);

		await queryInterface.bulkInsert("Users", [
			{
				name: "Admin",
				middlename: "A.",
				lastname: "User",
				suffix: "Jr.",
				email: "admin@example.com",
				password: hashedAdminPassword,
				isAdmin: true,
				isRider: false,
				isCustomer: false,
				isVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				name: "Client",
				middlename: "B.",
				lastname: "User",
				suffix: "",
				email: "client@example.com",
				password: hashedClientPassword,
				isAdmin: false,
				isRider: false,
				isCustomer: true,
				isVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				name: "Driver",
				middlename: "C.",
				lastname: "User",
				suffix: "",
				email: "rider@example.com",
				password: hashDriverPassword,
				isAdmin: false,
				isRider: true,
				isCustomer: false,
				isVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete("Users", null, {});
	},
};
