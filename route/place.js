const { Router } = require("express");
const { check } = require("express-validator");

const checkAuth = require("../middleware/checkAuth");
const fileUpload = require("../middleware/fileUpload");
const placeController = require("../controller/place");

const router = Router();

router.get("/user/:id", placeController.getPlaceByUser);

router.get("/:id", placeController.getPlaceById);

router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title")
      .not()
      .isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address")
      .not()
      .isEmpty()
  ],
  placeController.createPlace
);

router.patch(
  "/:id",
  [
    check("title")
      .not()
      .isEmpty(),
    check("description").isLength({ min: 5 })
  ],
  placeController.updatePlace
);

router.delete("/:id", placeController.deletePlace);

module.exports = router;
