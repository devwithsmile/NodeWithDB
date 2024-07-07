import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import {db} from "./DB/databaseConnection.js"

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 2000;


app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// database connection here
// till here

var isUserAuthorized = false;

function passwordCheck(req, res, next) {
    const password = req.body["password"];
    if (password == "secret") {
        isUserAuthorized = true;
    }
    next();
}

app.use(passwordCheck);

// code from here 
app.get("/", (req, res) => {
    res.send("GET method called");
})
.post("/", (req, res) => {
    res.send("POST method called");
})
.put("/", (req, res) => {
    res.send("PUT method called");
})
.delete("/", (req, res) => {
    res.send("DELETE method called");
});


//till here , not below this 
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
