import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import bookRouter from './routes/booksRoutes.js';
import userRouter from './routes/userRoutes.js';
import passport from 'passport';
import session from 'express-session';
import {SECRET_SESSION_KEY} from './config.js'

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 2000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session middleware for Passport
app.use(session({
    secret: SECRET_SESSION_KEY, // replace with a secure key
    resave: false,
    saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/books', bookRouter);
app.use('/user', userRouter);

// Start server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
