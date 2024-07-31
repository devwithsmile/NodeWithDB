import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../config.js';

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json('Access denied');

    try {
        const verified = jwt.verify(token, JWT_SECRET_KEY);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json('Invalid token');
    }
};

export default verifyToken;
