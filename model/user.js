const { Schema, model, Types } = require("mongoose");
const mongooseUniqueValidator = require("mongoose-unique-validator");

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: [{ type: Types.ObjectId, required: true, ref: "Place" }]
});

userSchema.plugin(mongooseUniqueValidator);

module.exports = model("User", userSchema);
