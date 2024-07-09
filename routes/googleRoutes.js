import express from "express";
import bodyParser from "body-parser";
import UserDetails from "../DB/model/UserDetails.js";
import connectDB from "../DB/db.js";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../config.js";

const googleRouter = express.Router();
googleRouter.use(bodyParser.json());

let db = connectDB("Books");
const saltRound = 12;

let isLogin = false;

// Configure Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:2000/google/saveFromGoogle",
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
        },
        async (accessToken, refreshToken, profile, done) => {
            // console.log("Google profile:", profile);

            try {
                const email = profile.emails[0].value;
                const hashedPassword = await bcrypt.hash("google", saltRound);

                let user = await UserDetails.findOne({ username: email });

                if (!user) {
                    user = new UserDetails({
                        username: email,
                        password: hashedPassword,
                    });

                    await user.save();
                    // console.log("New user saved:", user);
                } else {
                    console.log("User already exists:", user);
                }

                return done(null, user);
            } catch (err) {
                console.error("Error during Google authentication:", err);
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// login with google
googleRouter.get(
    "/auth",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

// Successful google login
googleRouter.get(
    "/saveFromGoogle",
    passport.authenticate("google", { failureRedirect: "/failGoogle" }),
    (req, res) => {
        // Set a cookie with isLoggedIn as true
        isLogin = true;
        res.cookie("isLoggedIn", isLogin, { httpOnly: false, secure: false });
        res.redirect("http://localhost:5173/");
    }
);

// Google login failed
googleRouter.get("/failGoogle", (req, res) => {
    res.status(401).send("Error in saving profile");
});

export default googleRouter;
