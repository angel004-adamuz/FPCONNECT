import { Router } from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

const router = Router();

// Iniciar login con Google
router.get('/', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
}));

// Callback de Google
router.get('/callback',
  passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173?error=google_auth_failed' }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
    );

    // Redirigir al frontend con los tokens
    res.redirect(`http://localhost:5173?token=${token}&refreshToken=${refreshToken}&role=${user.role}`);
  }
);

export default router;