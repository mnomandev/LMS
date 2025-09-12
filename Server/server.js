import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { clerkWebhooks } from "./controllers/webhooks.js";
import mongoose, { connect } from "mongoose";
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from "@clerk/express";
import connectCloudinary  from "./configs/cloudinary.js";
import courseRouter from "./routes/courseRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { stripeWebhooks } from "./controllers/webhooks.js";


dotenv.config();
// Connect to database
 await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "lms", // <-- sets your DB name explicitly
 }).then(() => {
      console.log("MongoDB connected");
 }).catch((err) => {
      console.error("MongoDB connection error:", err);
 });
 await connectCloudinary();

const app = express();

// CORS middleware
app.use(cors());
app.use(clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  }));

// Routes
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});
app.post('/clerk', bodyParser.raw({ type: 'application/json' }), clerkWebhooks);
app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);
app.use('/stripe', bodyParser.raw({ type: 'application/json' }), stripeWebhooks);


// Start the server /port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;