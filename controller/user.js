const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");

const User = require("../model/user");
const HttpError = require("../model/httpError");

exports.getUser = async (request, response, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (error) {
    return next(new HttpError("error while fetching users", 500));
  }
  response.json({
    users: users.map(user => user.toObject({ getters: true }))
  });
};

exports.signup = async (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) return next(new HttpError("invalid input", 422));

  const { name, email, password } = request.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (error) {
    return next(
      new HttpError("error while fetching user with given mail", 500)
    );
  }

  if (existingUser)
    return next(
      new HttpError("there is a existing user with given email", 422)
    );

  let hashedPassword;
  try {
    hashedPassword = await bcryptjs.hash(password, 12);
  } catch (error) {
    return next(new HttpError("creating user failed", 500));
  }

  const user = new User({
    name,
    email,
    password: hashedPassword,
    image: request.file.path.replace("\\", "/"),
    places: []
  });

  try {
    await user.save();
  } catch (error) {
    return next(new HttpError("creating user failed", 500));
  }

  const token = getToken(user);

  response.status(201).json({ userId: user.id, email: user.email, token });
};

exports.login = async (request, response, next) => {
  const { email, password } = request.body;

  let user;
  try {
    user = await User.findOne({ email });
  } catch (error) {
    return next(
      new HttpError("error while fetching user with given mail", 500)
    );
  }

  if (!user) return next(new HttpError("invalid input", 403));

  let passwordValidity = false;
  try {
    passwordValidity = await bcryptjs.compare(password, user.password);
  } catch (error) {
    return next(new HttpError("invalid input", 500));
  }

  if (!passwordValidity) return next(new HttpError("invalid input", 403));

  const token = getToken(user);

  response.status(201).json({ userId: user.id, email: user.email, token });
};

const getToken = user => {
  let token;
  try {
    token = jsonwebtoken.sign(
      { userId: user.id, email: user.email },
      process.env.JSONWEBTOKEN_KEY,
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(new HttpError("signin/login user failed", 500));
  }
  return token;
};
