import express from "express";
import mongoose from "mongoose";
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js'
dotenv.config();

const app = express();
// middleware for parsing request body
app.use(express.json());
// METHOD 1: Allow All Origins with Default of Cors(*)
app.use(cors());

app.get('/', (request, response) => {
    console.log(request)
    return response.status(234).send('Welcome')
});

// user model and routes
app.use('/user', userRoutes)

// connect database
mongoose.connect(process.env.MONGODB_CONNECT_URI, {
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
