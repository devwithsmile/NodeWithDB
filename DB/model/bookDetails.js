// models/BookDetails.js
import mongoose from 'mongoose';

const bookDetailsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: String, required: true },
    // Add more fields as needed
});

const BookDetails = mongoose.model('BookDetails', bookDetailsSchema);

export default BookDetails;
