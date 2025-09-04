import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB  from './configs/mongodb.js';
import { clerkWebhooks } from './controllers/webhooks.js';



await connectDB();

const app = express();

//middleware
app.use(cors())

//Routes
app.get('/', (req, res) => res.send('API is running'));
app.post('/clerk', express.json(), clerkWebhooks)


//port
const PORT = process.env.PORT || 5000;


//start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
});