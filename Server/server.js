import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";

dotenv.config();
// connect DB once
await connectDB();

const app = express();

// CORS middleware
app.use(cors());

// 🚨 Clerk webhook route comes BEFORE express.json()
// This ensures raw body is available for signature verification

// Normal body parser for all other routes
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});
app.post('/clerk', express.json(), clerkWebhooks);

// other routes
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

export default app;
