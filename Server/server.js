import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";
import morgan from "morgan";
import bodyParser from "body-parser";

// connect DB once
await connectDB();

const app = express();

// 🚨 Clerk webhook MUST be before express.json()
app.post("/clerk", bodyParser.raw({ type: "application/json" }), clerkWebhooks);

// other middlewares for normal routes
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

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
