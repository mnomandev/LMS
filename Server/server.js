import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";
import bodyParser from "body-parser";

// connect DB once
await connectDB();
const app = express();

app.use(cors());

// webhook route FIRST
app.post("/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

// normal routes AFTER
app.use(express.json());
app.get("/", (req, res) => res.send("API is running 🚀"));


// export for Vercel
export default app;

// local dev only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`Server running locally on port ${PORT}`)
  );
}



