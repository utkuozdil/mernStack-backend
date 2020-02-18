const multer = require("multer");
const uuid = require("uuid/v1");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg"
};

const fileUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (request, file, callback) => {
      callback(null, "uploads/images");
    },
    filename: (request, file, callback) => {
      const extension = MIME_TYPE_MAP[file.mimetype];
      callback(null, uuid() + "." + extension);
    },
    fileFilter: (request, file, callback) => {
      const isValid = !!MIME_TYPE_MAP[file.mimetype];
      let error = isValid ? null : new Error("invalid mime type");
      callback(error, isValid);
    }
  })
});

module.exports = fileUpload;
