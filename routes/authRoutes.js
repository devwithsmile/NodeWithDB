import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import UserDetails from '../DB/model/UserDetails.js';
import { JWT_SECRET_KEY } from '../config.js';

const authRouter = express.Router();
authRouter.use(bodyParser.json());

// create token with user id
const createToken = (_id) => {
    // expiresIn is set to 1 day
    // JWT_SECRET is a secret string that is used to sign the token
    return jwt.sign({ _id }, JWT_SECRET_KEY, { expiresIn: '1d' });
};

// Register route
authRouter.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        console.log('Inside Registration Functionality');
        const existingUser = await UserDetails.findOne({
            username: username,
        });

        if (!username || !password) {
            throw Error('Please fill all the fields');
        }

        if (existingUser) {
            return res.status(400).send('Username already registered');
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new UserDetails({
            username: username,
            password: hashedPassword,
        });

        const newentry = await newUser.save();

        const token = createToken(newentry._id);

        res.status(201).json({
            username: newentry.username,
            token: token,
        });

        // res.status(201).json(newUser);
    } catch (error) {
        // Check if it's a validation error
        if (error instanceof Error) {
            res.status(400).json({
                status: '400 Bad Request',
                message: error.message,
            });
        } else {
            // Handle internal server errors
            console.error('Internal Server Error:', error);

            res.status(500).json({
                status: '500 Internal Server Error',
                message: '500 Internal Server Error, User not created',
            });
        }
    }
});

// Login route
authRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        console.log('Inside Login Functionality');

        const user = await UserDetails.findOne({ username: username });
        if (!user)
            return res.status(404).json({
                message: 'User not found',
                status: '404 Not Found',
            });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({
                message: 'Invalid password',
                status: '400 Bad Request',
            });

        const token = createToken(user._id);

        // console.log('Logged In \n Token --> ', token);

        res.status(200).json({
            username: user.username,
            token: token,
        });
    } catch (error) {
        // Handle internal server errors
        console.error('Internal Server Error:', error);
        res.status(500).json({
            status: '500 Internal Server Error',
            message: '500 Internal Server Error, User not logged in',
        });
    }
});

export default authRouter;
