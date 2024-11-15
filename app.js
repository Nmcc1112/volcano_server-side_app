var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require('cors');

const options = require("./knexfile.js");
const knex = require("knex")(options);

var countryRouter = require("./routes/country.js");
var volcanoesRouter = require("./routes/volcanoes.js");
var volcanoInstanceRouter = require("./routes/volcanoInstance.js");
var volcanoCommentsRouter = require("./routes/volcanoComments.js");
var userAuthRouter = require("./routes/user.js");
var adminRouter = require("./routes/admin.js");
var documentRouter = require("./routes/document.js");
// var usersRouter = require("./routes/userAuth.js");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
req.db = knex;
next();
});

app.use(cors());
app.use("/", documentRouter);
app.use("/countries", countryRouter);
app.use("/volcanoes", volcanoesRouter);
app.use("/volcano", volcanoInstanceRouter);
app.use("/volcano_comments", volcanoCommentsRouter);
app.use("/user", userAuthRouter);
app.use("/me", adminRouter);

app.get("/knex", function (req, res, next) {
  req.db.raw("SELECT VERSION()")
    .then((version) => console.log(version[0][0]))
    .catch((err) => {
      console.log(err);
      throw err;
    });

  res.send("Version Logged successfully");
});

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