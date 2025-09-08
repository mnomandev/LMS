import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";

dotenv.config();

// Connect to database
await connectDB();

const app = express();

// CORS middleware
app.use(cors());

// 🚨 Clerk webhook route comes BEFORE express.json()
// This ensures raw body is available for signature verification
app.post(
  '/clerk', 
  bodyParser.raw({ type: 'application/json' }), 
  clerkWebhooks
);

// Normal body parser for all other routes
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// Other routes would go here...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;