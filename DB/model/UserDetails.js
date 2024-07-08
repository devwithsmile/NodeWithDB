// models/BookDetails.js
import mongoose from 'mongoose';

const UserDetailsSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
});

const userDetails = mongoose.model('UserDetails', UserDetailsSchema);

export default userDetails;
