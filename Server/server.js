import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";

const app = express();

// CORS middleware
app.use(cors());

// 🚨 Webhook route with raw body parsing
app.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Connect to DB for each serverless request
    await connectDB();
    // Call the webhook handler
    return clerkWebhooks(req, res);
  } catch (error) {
    console.error("❌ Database connection error:", error);
    return res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

// Normal body parser for all other routes
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ 
    message: "API is running 🚀", 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Health check for webhook
app.get("/clerk", (req, res) => {
  res.json({ 
    status: "Clerk webhook endpoint is ready",
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel serverless
export default app;

// Remove the local dev server code - not needed for Vercel

// import express from "express";
// import cors from "cors";
// import "dotenv/config";
// import connectDB from "./configs/mongodb.js";
// import { clerkWebhooks } from "./controllers/webhooks.js";

// // connect DB once
// await connectDB();

// const app = express();

// // CORS middleware
// app.use(cors());

// // 🚨 Clerk webhook route comes BEFORE express.json()
// // This ensures raw body is available for signature verification

// // Normal body parser for all other routes
// app.use(express.json());

// // test route
// app.get("/", (req, res) => {
//   res.send("API is running 🚀");
// });
// app.post('/clerk', express.json(), clerkWebhooks);

// // export for Vercel
// export default app;

// // local dev only
// if (process.env.NODE_ENV !== "production") {
//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () =>
//     console.log(`Server running locally on port ${PORT}`)
//   );
// }
