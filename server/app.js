import express from "express";
import mongoose from "mongoose";
import cors from 'cors';
import dotenv from 'dotenv';
import adminRoutes from './routes/adminRoutes.js';
import session from "express-session";
import ConnectMongoDBSession from "connect-mongodb-session";
import { v4 as uuidv4 } from 'uuid'; // Import the uuid library
dotenv.config();

const app = express();
// middleware for parsing request body
app.use(express.json());
// METHOD 1: Allow All Origins with Default of Cors(*)
app.use(cors({
    origin: ['http://localhost:5173', 'https://batang183.vercel.app'], // Replace with your frontend's origin
    credentials: true,
  }));

// Set up MongoDB session store
const MongoDBStore = ConnectMongoDBSession(session);
const store = new MongoDBStore({
  uri: process.env.MONGODB_CONNECT_URI_ADMIN,
  collection: 'sessions', // Specify the name of the collection for sessions
  expires: 1000 * 60 * 60 * 24, // Set session to expire after 24 hours
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Handle errors with the store
store.on('error', (error) => {
  console.error(error);
});

app.use(session({
    genid: (req) => {
      return uuidv4(); // Generate a new UUID for each session
    },
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: store, // Use the MongoDB session store
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Set the cookie to expire after 24 hours
      httpOnly: true, // Ensures the cookie is only accessible through HTTP(S) requests
      // secure: process.env.NODE_ENV === 'production', // Ensures the cookie is only sent over HTTPS in production
      // sameSite: 'strict', // Prevents the cookie from being sent with cross-site requests
    },
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
