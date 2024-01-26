import express from "express";
import mongoose from "mongoose";
import cors from 'cors';
import dotenv from 'dotenv';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();
const app = express();
app.use(express.json());
// METHOD 1: Allow All Origins with Default of Cors(*)
app.use(cors({
    origin: `${process.env.PRODUCTION}`, // Replace with your frontend's origin
  }));

app.get('/', (request, response) => {
    console.log(request)
    return response.status(234).send('Welcome')
});

// admin model and routes
app.use('/admin', adminRoutes)
app.use('/user', userRoutes)

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
