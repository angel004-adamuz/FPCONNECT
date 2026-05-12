import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import config from './index.js';

const prisma = new PrismaClient();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const firstName = profile.name.givenName || profile.displayName;
    const lastName = profile.name.familyName || '';

    // Buscar si ya existe el usuario
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Crear usuario nuevo con rol ALUMNO por defecto
      user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: 'GOOGLE_AUTH',
          role: 'ALUMNO',
          status: 'ACTIVO',
          isVerified: true,
        }
      });

      // Crear perfil de alumno por defecto
      await prisma.studentProfile.create({
        data: { userId: user.id }
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;