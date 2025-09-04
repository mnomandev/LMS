import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";

// connect DB once
await connectDB();

const app = express();

//middleware
app.use(cors())

// 🚨 Clerk webhook MUST be before express.json()
// test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.post('/clerk', express.json(), clerkWebhooks)



// export for Vercel
export default app;

// local dev only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`Server running locally on port ${PORT}`)
  );
}



