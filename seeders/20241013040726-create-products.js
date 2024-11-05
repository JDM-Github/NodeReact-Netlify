// "use strict";

// module.exports = {
// 	up: async (queryInterface, Sequelize) => {
// 		const products = [
// 			{
// 				name: "Sample Product 1",
// 				slug: "sample-product-1",
// 				image: "https://example.com/images/product1.jpg",
// 				images: [
// 					"https://example.com/images/product1-1.jpg",
// 					"https://example.com/images/product1-2.jpg",
// 				],
// 				brand: "Brand A",
// 				category: "Category A",
// 				description: "Description for Sample Product 1",
// 				price: 29.99,
// 				countInStock: 100,
// 				rating: 0,
// 				numReviews: 0,
// 				isArchived: false,
// 				createdAt: new Date(),
// 				updatedAt: new Date(),
// 			},
// 			{
// 				name: "Sample Product 2",
// 				slug: "sample-product-2",
// 				image: "https://example.com/images/product2.jpg",
// 				images: [
// 					"https://example.com/images/product2-1.jpg",
// 					"https://example.com/images/product2-2.jpg",
// 				],
// 				brand: "Brand B",
// 				category: "Category B",
// 				description: "Description for Sample Product 2",
// 				price: 49.99,
// 				countInStock: 50,
// 				rating: 0,
// 				numReviews: 0,
// 				isArchived: false,
// 				createdAt: new Date(),
// 				updatedAt: new Date(),
// 			},
// 			{
// 				name: "Sample Product 3",
// 				slug: "sample-product-3",
// 				image: "https://example.com/images/product3.jpg",
// 				images: [
// 					"https://example.com/images/product3-1.jpg",
// 					"https://example.com/images/product3-2.jpg",
// 				],
// 				brand: "Brand C",
// 				category: "Category C",
// 				description: "Description for Sample Product 3",
// 				price: 19.99,
// 				countInStock: 150,
// 				rating: 0,
// 				numReviews: 0,
// 				isArchived: false,
// 				createdAt: new Date(),
// 				updatedAt: new Date(),
// 			},
// 		];

// 		await queryInterface.bulkInsert("Products", products, {});
// 	},

// 	down: async (queryInterface, Sequelize) => {
// 		await queryInterface.bulkDelete("Products", null, {});
// 	},
// };
