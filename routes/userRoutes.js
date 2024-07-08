import express from 'express';
import bodyParser from 'body-parser';
import UserDetails from '../DB/model/UserDetails.js';
import connectDB from '../DB/db.js';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../config.js';

const userRouter = express.Router();
userRouter.use(bodyParser.json());

let db = connectDB("Books");
const saltRound = 12;

let isLogin = false;

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:2000/user/saveFromGoogle",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
}, async (accessToken, refreshToken, profile, done) => {
    // console.log("Google profile:", profile);

    try {
        const email = profile.emails[0].value;
        const hashedPassword = await bcrypt.hash('google', saltRound);

        let user = await UserDetails.findOne({ username: email });

        if (!user) {
            user = new UserDetails({
                username: email,
                password: hashedPassword
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
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// login with google
userRouter.get("/", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

userRouter.get("/saveFromGoogle", passport.authenticate("google", { failureRedirect: "/failGoogle" }), (req, res) => {
    // Set a cookie with isLoggedIn as true
    isLogin = true;
    res.cookie('isLoggedIn', isLogin, { httpOnly: false, secure: false });
    res.redirect("http://localhost:5173/");
});

userRouter.get("/failGoogle", (req, res) => {
    res.status(401).send("Error in saving profile");
})

userRouter.get("/allUsers", async (req, res) => {
    try {
        const users = await UserDetails.find();
        res.json(users);
    } catch (err) {
        console.error("Failed to fetch users:", err);
        res.status(500).send("Failed to fetch users");
    }
});

userRouter.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const user = await UserDetails.findOne({ username: username });
        if (!user) {
            return res.status(404).send("User not found");
        }
        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.status(200).send("Login successful");
        } else {
            res.status(401).send("Incorrect password");
        }
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).send("Error fetching user");
    }
});


userRouter.post("/register", async (req, res) => {
    try {
        const existingUser = await UserDetails.findOne({ username: req.body.username });

        if (existingUser) {
            return res.status(400).send("Username already registered");
        }

        const hashedPassword = await bcrypt.hash(req.body.password, saltRound);

        const newUser = new UserDetails({
            username: req.body.username,
            password: hashedPassword
        });

        await newUser.save();
        res.status(200).send("User saved successfully!");
    } catch (err) {
        console.error("Failed to save user:", err);
        res.status(500).send("Failed to save user");
    }
});

userRouter.put("/:username", async (req, res) => {
    const username = req.params.username;
    const updateFields = {};

    if (req.body.username) {
        updateFields.username = req.body.username;
    }

    if (req.body.password) {
        updateFields.password = await bcrypt.hash(req.body.password, saltRound);
    }

    try {
        const updatedUser = await UserDetails.findOneAndUpdate(
            { username: username },
            updateFields,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send("User not found");
        }

        res.status(200).send("Operation Successful");
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).send("Error updating user");
    }
});

userRouter.delete("/:username", async (req, res) => {
    const username = req.params.username;

    try {
        const deletedUser = await UserDetails.deleteOne({ username: username });

        if (!deletedUser) {
            return res.status(404).send("User not found");
        }

        res.send("User deleted successfully!");
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).send("Error deleting user");
    }
});

export default userRouter;
