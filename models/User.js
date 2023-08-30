const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    default: mongoose.Types.ObjectId,
    unique: true,
  },
  username: {
    type: String,
    required: [true, "Username is required."],
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required."],
  },
  name: {
    type: String,
    required: [true, "Name is required."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
