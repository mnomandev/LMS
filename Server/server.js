import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";
import morgan from "morgan";
import bodyParser from "body-parser";

// Connect MongoDB
await connectDB();

const app = express();

// ✅ Webhook route FIRST (raw body)
app.post(
  "/clerk",
  bodyParser.raw({ type: "application/json" }),
  clerkWebhooks
);

// Normal middlewares (only after webhooks)
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// Export for Vercel
export default app;

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}
