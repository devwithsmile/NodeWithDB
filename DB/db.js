import mongoose from 'mongoose';

const remainingURI = "?retryWrites=true&w=majority&appName=Cluster0"
const DB_BaseURI = "mongodb+srv://devwithsmile:ConnectToDb1!@cluster0.u0ld7hk.mongodb.net/";


export default function connectDB(params) {
    let URI = DB_BaseURI + params + remainingURI
    return mongoose.connect(URI)
        .then(() => console.log('Connected DB : '+ params))
        .catch(err => console.error('Failed to connect to DB:', err));
}
