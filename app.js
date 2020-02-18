const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const HttpError = require("./model/httpError");
const placeRoute = require("./route/place");
const userRoute = require("./route/user");
const { getMongoDB_URI } = require("./util/mongoDB");

const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((request, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/places", placeRoute);
app.use("/api/users", userRoute);

app.use((request, response, next) => {
  throw new HttpError("couldn't find this route", 404);
});

app.use((error, request, response, next) => {
  if (request.file) fs.unlink(request.file.path, error => console.log(error));
  if (response.headerSent) return next(error);
  response
    .status(error.code || 500)
    .json({ message: error.message || "error" });
});

mongoose
  .connect(getMongoDB_URI(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => app.listen(process.env.NODEJS_PORT))
  .catch(error => console.log(error));
