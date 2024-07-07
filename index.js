import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import bookRouter from './routes/booksRoutes.js'


const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 2000;

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



// Middleware for checking password (for example)
let isUserAuthorized = false;

function passwordCheck(req, res, next) {
    const password = req.body["password"];
    if (password === "secret") {
        isUserAuthorized = true;
    }
    next();
}

app.use(passwordCheck);


// Routes

app.use('/books',bookRouter)
// Start server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
