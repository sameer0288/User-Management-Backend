const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const auth = require("../middlewares/auth");
const User = require("../models/User");

// Register route
router.post("/register", async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    if (!username || !name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Please enter all the required fields." });
    }

    if (username.length > 25) {
      return res
        .status(400)
        .json({ error: "Username can only be less than 25 characters." });
    }

    const emailReg =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!emailReg.test(email)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid email address." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long." });
    }

    const doesUserAlreadyExist = await User.findOne({ email });

    if (doesUserAlreadyExist) {
      return res.status(400).json({
        error: `A user with that email [${email}] already exists. Please try another one.`,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      username,
      name,
      email,
      password: hashedPassword,
    });

    const result = await newUser.save();

    result.password = undefined;

    return res.status(201).json({ user: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred." });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please enter all the required fields." });
    }

    const emailReg =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!emailReg.test(email)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid email address." });
    }

    const doesUserExist = await User.findOne({ email });

    if (!doesUserExist) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const doesPasswordMatch = await bcrypt.compare(
      password,
      doesUserExist.password
    );

    if (!doesPasswordMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const payload = { _id: doesUserExist._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const user = { ...doesUserExist.toJSON() };
    delete user.password;

    return res.status(200).json({ token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred." });
  }
});

// Get the currently authenticated user's information
router.get("/me", auth, async (req, res) => {
  try {
    const user = { ...req.user.toJSON() };
    delete user.password;
    return res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred." });
  }
});

module.exports = router;
