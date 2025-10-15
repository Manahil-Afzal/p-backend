
import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

export const registerController = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return next(errorHandler(400, "All fields are required"));
  }
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
try {
  const user = await User.create({ username, email, password: hashedPassword });
  res.status(201).json({ message: "User created successfully" });
} catch (error) {
  if (error.code === 11000) {
    return res.status(400).json({ message: "Email already exists" });
  }
  res.status(500).json({ message: "Server error" });
}

};


export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found!'));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Wrong credentials!'));

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = validUser._doc;

    res
      .cookie('access_token', token, { httpOnly: true })
      .status(200)
      .json(rest); 
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res) => {
  try {
    const { name, email, photo } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ username: name, email, photo });
    }

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      photo: user.photo,
    });
  } catch (err) {
    console.error("Google login failed:", err);
    res.status(500).json({ message: "Google login failed", error: err.message });
  }
};

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie('access_token');
    res.status(200).json('User has been logged out!');
  } catch (error) {
    next(error);
  }
};