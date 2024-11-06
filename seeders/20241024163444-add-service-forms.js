"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert("Services", [
			{
				serviceName: "DTI REGISTRATION",
				serviceURL:
					"https://d20ohkaloyme4g.cloudfront.net/img/document_thumbnails/cb2db0aa4c92fb8991768c3cf6b974d0/thumb_1200_1697.png",
				serviceImg:
					"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnOU0iPrhLJH7CQPgYM3Q-x7umeizS7holgw&s",
				serviceDescription: "This is a DTI description",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				serviceName: "SSS",
				serviceURL:
					"https://www.pdffiller.com/preview/465/308/465308941/large.png",
				serviceImg:
					"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-JYXALwOtzTc34YlgNgGmNvpab4oxo0lfGQ&s",
				serviceDescription: "This is a SSS description",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				serviceName: "PAG IBIG",
				serviceURL:
					"https://www.pdffiller.com/preview/42/93/42093052/large.png",
				serviceImg:
					"https://25174313.fs1.hubspotusercontent-eu1.net/hubfs/25174313/assets_moneymax/PagIBIG_Salary_Loan_1.jpg",
				serviceDescription: "This is a PAG IBIG description",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				serviceName: "PHILHEALTH",
				serviceURL: "https://www.pdffiller.com/preview/1/6/1006565.png",
				serviceImg:
					"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbJiXsPX6y6fLA9TFLh6aREMYVZK1yDmazDQ&s",
				serviceDescription: "This is a PHILHEALTH description",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				serviceName: "BIR",
				serviceURL:
					"https://www.pdffiller.com/preview/6/961/6961871/large.png",
				serviceImg:
					"https://i.pinimg.com/736x/f7/ac/88/f7ac88a1963942fe198262445a200595.jpg",
				serviceDescription: "This is a BIR description",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				serviceName: "SEC",
				serviceURL:
					"https://www.pdffiller.com/preview/33/900/33900017.png",
				serviceImg: "https://cdn.worldvectorlogo.com/logos/sec-1.svg",
				serviceDescription: "This is a SEC description",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("Services", null, {});
	},
};
