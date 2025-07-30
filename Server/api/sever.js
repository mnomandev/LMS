import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB from '../configs/mongodb.js';
import { clerkWebhooks } from '../controllers/webhooks.js';
import serverless from 'serverless-http';

const app = express();

await connectDB();
console.log("✅ MongoDB connected");

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  console.log("✅ GET / hit");
  res.send("API is running");
});

app.post('/clerk', clerkWebhooks);

export const handler = serverless(app); // 👈 this is crucial
