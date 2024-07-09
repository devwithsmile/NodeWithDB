import express from "express";
import bodyParser from "body-parser";
import UserDetails from "../DB/model/UserDetails.js";
import connectDB from "../DB/db.js";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

const userRouter = express.Router();
userRouter.use(bodyParser.json());

let db = connectDB("Books");
const saltRound = 12;

let isLogin = false;

// Check whether user is authenticated or not
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send({ message: "Unauthorized" });
}

// Configure Local Auth Strategy
passport.use(
    new LocalStrategy(
        {
            passReqToCallback: true,
        },
        async (req, username, password, done) => {
            try {
                console.log(
                    "Local Username and Password: ",
                    username,
                    password
                );
                const user = await UserDetails.findOne({ username: username });

                if (!user) {
                    return done(null, false, {
                        message: "User not found / Incorrect username",
                    });
                }

                const isMatch = await bcrypt.compare(password, user.password);

                if (!isMatch) {
                    return done(null, false, {
                        message: "Incorrect password.",
                    });
                }

                return done(null, user);
            } catch (err) {
                // return done(err);
                console.error("Error fetching user:", err);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserDetails.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Get all the User list
userRouter.get("/allUsers", async (req, res) => {
    try {
        const users = await UserDetails.find();
        res.json(users);
    } catch (err) {
        console.error("Failed to fetch users:", err);
        res.status(500).send("Failed to fetch users");
    }
});

// User Login
userRouter.post("/login", passport.authenticate("local"), async (req, res) => {
    console.log("isAuthenticated ------->", req.isAuthenticated());
    res.send({ message: "Login successful!" });
});

// User Logout
userRouter.post("/logout", (req, res) => {
    // console.log("isAuthenticated ------->", req.isAuthenticated());
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.send({ message: "Logout successful!" });
    });
    console.log("isAuthenticated ------->", req.isAuthenticated());
});

// User Registration/Sign Up
userRouter.post("/register", async (req, res) => {
    try {
        const existingUser = await UserDetails.findOne({
            username: req.body.username,
        });

        if (existingUser) {
            return res.status(400).send("Username already registered");
        }

        const hashedPassword = await bcrypt.hash(req.body.password, saltRound);

        const newUser = new UserDetails({
            username: req.body.username,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(200).send("User saved successfully!");
    } catch (err) {
        console.error("Failed to save user:", err);
        res.status(500).send("Failed to save user");
    }
});

// Edit Username for User
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

// Delete the account + only authenticated user can delete is
userRouter.delete("/:username", isAuthenticated, async (req, res) => {
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
