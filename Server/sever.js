import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB  from './configs/mongodb.js';
import { clerkWebhooks } from './controllers/webhooks.js';
import serverless from 'serverless-http'; // 👈 this is key


//initialize express app
const app = express();

await connectDB();

//middleware
app.use(cors());

//Routes
app.get('/', (req, res) => {
    console.log('GET / called - API is running');
    res.send('API is running')
})
app.post('/clerk', clerkWebhooks)


//port
const PORT = process.env.PORT || 5000;

//start server
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
    
// });
export const handler = serverless(app);