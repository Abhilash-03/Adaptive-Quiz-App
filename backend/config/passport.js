import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
      },
      (accessToken, refreshToken, profile, done) => {
        // Pass the profile to the callback
        return done(null, profile);
      }
    )
  );

  // Serialize user for session (not using sessions, but required by passport)
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};

export default configurePassport;
