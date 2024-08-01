import dotenv from 'dotenv';

dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI;

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const USER_PROFILE_URL = process.env.USER_PROFILE_URL;

export const SECRET_SESSION_KEY = process.env.SECRET_SESSION_KEY;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

export const BASE_URL = process.env.BASE_URL;
export const REDIRECT_URL = process.env.REDIRECT_URL;
