import express from 'express';
import bodyParser from 'body-parser';
import BookDetails from '../DB/model/bookDetails.js';
import connectDB from '../DB/db.js';


const bookRouter = express.Router();
bookRouter.use(bodyParser.json());


let db = connectDB("Books");

bookRouter.get("/", async (req, res) => {
    try {
        const books = await BookDetails.find();
        res.json(books);
    } catch (err) {
        console.error("Failed to fetch books:", err);
        res.status(500).send("Failed to fetch books");
    }
});

bookRouter.get("/:bookName", async (req, res) => {
    const bookName = req.params.bookName;
    try {
        const book = await BookDetails.findOne({ title: bookName });
        if (!book) {
            return res.status(404).send("Book not found");
        }
        res.json(book);
    } catch (err) {
        console.error("Error fetching book:", err);
        res.status(500).send("Error fetching book");
    }
});

bookRouter.post("/", async (req, res) => {
    try {
        const newBook = new BookDetails({
            title: req.body.title,
            author: req.body.author,
            date: req.body.date // Save date as formatted string
        });

        await newBook.save();
        res.send("Book saved successfully!");
    } catch (err) {
        console.error("Failed to save book:", err);
        res.status(500).send("Failed to save book");
    }
});

bookRouter.put("/:bookName", async (req, res) => {
    const bookName = req.params.bookName;
    const updateFields = {};

    if (req.body.title) {
        updateFields.title = req.body.title;
    }

    if (req.body.author) {
        updateFields.author = req.body.author;
    }

    if (req.body.date) {
        updateFields.date = req.body.date; // Update date as formatted string
    }

    try {
        const updatedBook = await BookDetails.findOneAndUpdate(
            { title: bookName },
            updateFields,
            { new: true }
        );

        if (!updatedBook) {
            return res.status(404).send("Book not found");
        }

        res.json(updatedBook);
    } catch (err) {
        console.error("Error updating book:", err);
        res.status(500).send("Error updating book");
    }
});

bookRouter.delete("/:bookName", async (req, res) => {
    const bookName = req.params.bookName;

    try {
        const deletedBook = await BookDetails.deleteOne({ title: bookName });

        if (!deletedBook) {
            return res.status(404).send("Book not found");
        }

        res.send("Book deleted successfully!");
    } catch (err) {
        console.error("Error deleting book:", err);
        res.status(500).send("Error deleting book");
    }
});

export default bookRouter;