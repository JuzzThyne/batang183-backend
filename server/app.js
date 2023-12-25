import express from "express";
import mongoose from "mongoose";
import cors from 'cors';
import dotenv from 'dotenv';
import adminRoutes from './routes/adminRoutes.js';
import allowCors from "./Auth/allowCors.js";

dotenv.config();

const app = express();

// app.use(allowCors);
// middleware for parsing request body
app.use(express.json());
// METHOD 1: Allow All Origins with Default of Cors(*)
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend's origin
    credentials: true,
  }));

app.get('/', (request, response) => {
    console.log(request)
    return response.status(234).send('Welcome')
});

// admin model and routes
app.use('/admin', adminRoutes)

// connect database
mongoose.connect(process.env.MONGODB_CONNECT_URI_ADMIN, {
})
    .then(() => {
        console.log('connected');
        app.listen(process.env.PORT || 3000 , () => {
            console.log('PORT IS OKAY');
        });
    })
    .catch((error) => {
        console.log(error);
    });
