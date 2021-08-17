const express = require("express");
const path = require("path");
const morgan = require("morgan");
const json = require("morgan-json");
const favicon = require("serve-favicon");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");

const app = express();

// Config
dotenv.config();
const { MONGO_URI_REMOTE } = process.env;

// Logged Requests
const format = json({
	info: ":method :url :status",
	length: ":res[content-length]",
	"response-time": ":response-time ms",
});

// Loggin server requests
app.use(morgan(format));

// Utils
const log = require("./utils/logger");

// Passport Config
require("./config/passportGoogle")(passport);
require("./config/passport")(passport);

// DB Config
const db = require("./config/keys").mongoURI;

// Views | EJS
const viewsPath = path.join(__dirname, "views");
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("view options", { layout: false });
app.set("views", viewsPath);

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files | Public folder
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

// Express session
// const sessionStore = MongoStore.create({
// 	mongoUrl: process.env.MONGO_URI,
// 	databaseName: "mens-book-breakfast",
// 	collection: "auth_sessions",
// });

// // Catch errors
// sessionStore.on("error", (error) => {
// 	console.log(`Session error: ${error}`);
// });

app.use(
	session({
		secret: "SESSION_SECRET" || process.env.TOKEN_SECRET,
		resave: false,
		saveUninitialized: true,
		//store: sessionStore,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
		},
	}),
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// // Error Handling MIddleware
// const logger = require("./utils/loggers/logger");
// const httpLogger = require("./utils/loggers/httpLogger");
// const {
// 	logError,
// 	returnError,
// 	isOperationalError,
// 	logErrorMiddleware,
// } = require("./middleware/errorHandler");

// app.use(logError);
// app.use(returnError);

// app.use(httpLogger);

// // if the Promise is rejected this will catch it
// process.on("unhandledRejection", (error) => {
// 	throw error;
// });

// process.on("uncaughtException", (error) => {
// 	logError(error);

// 	if (!isOperationalError(error)) {
// 		console.log(`Uncaught Exception> ${error}`);
// 		process.exit(1);
// 	}
// });

// Global variables
app.use(function (req, res, next) {
	res.locals.success_msg = req.flash("success_msg");
	res.locals.error_msg = req.flash("error_msg");
	res.locals.error = req.flash("error");
	next();
});

// Response Headers
app.use((req, res, next) => {
	res.append("Access-Control-Allow-Origin", ["*"]);
	res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
	res.append("Access-Control-Allow-Headers", "Content-Type");
	next();
});

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000;

// Connect to database then server starts...
mongoose
	.connect(MONGO_URI_REMOTE, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => log.info(`Database connected initiated...`))
	.then(() => {
		app.listen(PORT, log.info(`Backend services initiated: ${PORT}`));
	})
	.catch((err) => log.error(`Backend services failed to initialize> ${err}`));
