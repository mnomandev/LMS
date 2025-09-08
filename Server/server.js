import express from "express";
// import cors from "cors";
import "dotenv/config";
import dotenv from "dotenv";
import connectDB from "./configs/mongodb.js";
import  clerkWebhooks  from "./controllers/webhooks.js";

dotenv.config();

const app = express();
// Other APIs (JSON allowed)
app.use(express.json());

// connect DB once
await connectDB();

app.post("/clerk", clerkWebhooks);



app.get("/", (req, res) => res.send("Backend is running 🚀"));

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

