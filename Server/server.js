import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";
import morgan from "morgan";

// Connect MongoDB once (cold start)
await connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev")); // logs requests in console

// Routes
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.post("/clerk", clerkWebhooks);

// ✅ Vercel serverless export
export default app;

// ✅ Local development (only runs when not on Vercel)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}
