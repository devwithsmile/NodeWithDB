import dotenv from "dotenv"

dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

export const SECRET_SESSION_KEY = process.env.SECRET_SESSION_KEY