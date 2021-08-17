const express = require("express");
const router = express.Router();
const {
	ensureAuthenticated,
	forwardAuthenticated,
} = require("../middleware/auth");

// Welcome Page
router.get("/", forwardAuthenticated, (req, res) =>
	res.render("index", {
		title: "Mens Book Breakfast",
		layout: "./layouts/mainLayout",
	}),
);

// Dashboard
router.get("/home", ensureAuthenticated, (req, res) => {
	res.render("homepage", {
		user: req.user,
		title: "Home | Mens Book Breakfast",
		layout: "./layouts/layout",
	});
});

module.exports = router;
