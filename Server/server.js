import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";
import usersRoute from "./routes/users.js";

// connect DB once
await connectDB();

const app = express();

// CORS middleware
app.use(cors());

// 🚨 Clerk webhook route comes BEFORE express.json()
// This ensures raw body is available for signature verification
app.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);

// Normal body parser for all other routes
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// export for Vercel
export default app;

// local dev only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`Server running locally on port ${PORT}`)
  );
}
