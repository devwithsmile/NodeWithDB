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
        async (request, accessToken, refreshToken, profile, done) => {
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

                // console.log("User profile:", user);
                return done(null, profile);
            } catch (err) {
                console.error("Error during Google authentication:", err);
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    console.log(`\n--------> Serialize User:`);
    console.log(user);
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    console.log("\n--------- Deserialized User:");
    console.log(obj);
    done(null, obj);
});

//console.log() values of "req.session" and "req.user" so we can see what is happening during Google Authentication
let count = 1;
const showlogs = (req, res, next) => {
    console.log("\n==============================");
    console.log(`------------>  ${count++}`);

    console.log(`\n req.session.passport -------> `);
    console.log(req.session.passport);

    console.log(`\n req.user -------> `);
    console.log(req.user);

    console.log("\n Session and Cookie");
    console.log(`req.session.id -------> ${req.session.id}`);
    console.log(`req.session.cookie -------> `);
    console.log(req.session.cookie);

    console.log("===========================================\n");

    next();
};

googleRouter.use(showlogs);

// Google login
googleRouter.get(
    "/auth",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

// Successful Google login
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
    const expiresIn24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    isLogin = false;
    res.cookie("isLoggedIn", isLogin, { httpOnly: false, secure: false ,expires:expiresIn24Hours});
    res.status(401).send("Error in saving profile");
});

// Google logout
googleRouter.get("/logout", (req, res) => {
    if (req.isAuthenticated()) {
        req.logOut(req.user, (err) => {
            if (err) return next(err);
            isLogin =false;
            res.cookie("isLoggedIn", isLogin, { httpOnly: false, secure: false });
            res.redirect("http://localhost:5173/");
            // If React needs error message
            // return res.status(500).json({ message: "Error during logout." });
        });
        console.log(`-------> User Logged out`);
    } else {
        console.log(`-------> User hasn't logged in`);
        // Instead of redirecting we can send a success message
        // res.status(200).json({ message: "Logout successful." });
        res.redirect("http://localhost:5173/");
    }
});

export default googleRouter;
