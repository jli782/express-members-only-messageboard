const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
});

const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
require("dotenv").config();

const db_connection_str = process.env.DB_URL;
async function main() {
  await mongoose.connect(db_connection_str);
}
main().catch((err) => {
  console.log(err);
});

const sessionStore = MongoStore.create({
  mongoUrl: db_connection_str,
  collection: "sessions",
});

// require the passport middleware so app knows and uses it
require("./passport/auth");

const app = express();

// helmet to set CSP headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self", "cdn.jsdelivr.net", "'nonce-rAnd0m'"],
    },
  })
);
// compression middleware
app.use(compression());
// express-rate-limit middleware
app.use(limiter);

// routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const messageRouter = require("./routes/message");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/message", messageRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
