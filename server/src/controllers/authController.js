import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// Never send password back to the client
const sanitize = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  createdAt: user.createdAt,
});

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Name, email, and password are required');
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409);
      throw new Error('Email already registered');
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({ user: sanitize(user), token });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    // Same generic message for "no user" and "wrong password"
    // so attackers can't enumerate emails
    if (!user || !(await user.comparePassword(password))) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user._id);
    res.json({ user: sanitize(user), token });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me  (protected)
export const me = async (req, res) => {
  res.json({ user: sanitize(req.user) });
};