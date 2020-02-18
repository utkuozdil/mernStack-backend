const HttpError = require("../model/httpError");
const jsonwebtoken = require("jsonwebtoken");

const checkAuth = (request, response, next) => {
  if (request.method === "OPTIONS") return next();
  try {
    const token = request.headers.authorization.split(" ")[1];
    if (!token) throw new Error("authentication failed");
    const decodedToken = jsonwebtoken.verify(
      token,
      process.env.JSONWEBTOKEN_KEY
    );
    request.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    return next(new HttpError("authentication failed", 403));
  }
};

module.exports = checkAuth;
