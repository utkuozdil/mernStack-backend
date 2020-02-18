const { Router } = require("express");
const { check } = require("express-validator");

const fileUpload = require("../middleware/fileUpload");
const userController = require("../controller/user");

const router = Router();

router.get("/", userController.getUser);

router.post("/login", userController.login);

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    (check("name")
      .not()
      .isEmpty(),
    check("email")
      .normalizeEmail()
      .isEmail(),
    check("password").isLength({ min: 6 }))
  ],
  userController.signup
);

module.exports = router;
