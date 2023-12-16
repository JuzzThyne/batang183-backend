import express from "express";
import { User } from "../models/userModel.js";
const router = express.Router();

// get all users
router.get('/', async (request, response)=>{
    try{
        const users = await User.find({});
        return response.status(200).json({
            count: users.length,
            data: users
        });
    }catch(error){
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});


export default router;