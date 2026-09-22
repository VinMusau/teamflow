import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { generateRawToken, hashToken} from '../utils/token.js';
import { sendVerificationEmail } from '../utils/email.js';

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

    const rawToken = generateRawToken();
    const verificationTokenHash = hashToken(rawToken);
    const verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );
    const user = await User.create({
      name,
      email,
      password,
      verificationTokenHash,
      verificationTokenExpiresAt,
    });

    await sendVerificationEmail(user.email, rawToken);

    res.status(201).json({
      message: 'Account created. Check your email to verify.',
      user: sanitize(user),
    });
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

    if (!user.emailVerified) {
      res.status(403);
      throw new Error(
        'Please verify your email before logging in. Check your inbox for the verification link.'
      );
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

// POST /api/auth/verify-email
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400);
      throw new Error('Token is required');
    }

    const incomingHash = hashToken(token);

    const user = await User.findOne({
      verificationTokenHash: incomingHash,
      verificationTokenExpiresAt: { $gt: new Date() },
    }).select('+verificationTokenHash +verificationTokenExpiresAt');

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired verification link');
    }

    user.emailVerified = true;
    user.verificationTokenHash = null;
    user.verificationTokenExpiresAt = null;
    await user.save();

    res.json({ message: 'Email verified. You can now log in.', user: sanitize(user) });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/resend-verification
export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error('Email is required');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal whether the email exists
      return res.json({ message: 'If that email exists, a link has been sent.' });
    }

    if (user.emailVerified) {
      res.status(400);
      throw new Error('Email is already verified');
    }

    const rawToken = generateRawToken();
    user.verificationTokenHash = hashToken(rawToken);
    user.verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, rawToken);

    res.json({ message: 'If that email exists, a link has been sent.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error('Email is required');
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return 200 — don't leak which emails exist
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const rawToken = generateRawToken();
    user.passwordResetTokenHash = hashToken(rawToken);
    user.passwordResetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail(user.email, rawToken);

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400);
      throw new Error('Token and new password are required');
    }
    if (newPassword.length < 8) {
      res.status(400);
      throw new Error('Password must be at least 8 characters');
    }

    const incomingHash = hashToken(token);

    const user = await User.findOne({
      passwordResetTokenHash: incomingHash,
      passwordResetTokenExpiresAt: { $gt: new Date() },
    }).select('+passwordResetTokenHash +passwordResetTokenExpiresAt');

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired reset link');
    }

    user.password = newPassword; // pre-save hook hashes it
    user.passwordResetTokenHash = null;
    user.passwordResetTokenExpiresAt = null;
    await user.save();

    res.json({ message: 'Password reset. You can now log in.' });
  } catch (err) {
    next(err);
  }
};