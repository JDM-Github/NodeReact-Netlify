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
				birthday: new Date("1985-08-15"),
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
				birthday: new Date("2000-06-15"),
				isAdmin: false,
				isRider: false,
				isCustomer: true,
				isVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				name: "Rider",
				middlename: "C.",
				lastname: "User",
				suffix: "",
				email: "rider@example.com",
				password: hashDriverPassword,
				birthday: new Date("2004-06-15"),
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
