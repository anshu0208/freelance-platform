import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

 export const register = async (req,res) => {
   try {
     const {name, email, password, role} = req.body;
    
     const existingUser = await User.findOne({email});
     if(existingUser){
      return  res.status(400).json({message: "User already exists!"})
     }
    const newUser = await User.create({
        name,
        email,
        password,
        role
    });

    const token = jwt.sign(
        {id: newUser._id},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN}
    )

      // HIDE PASSWORD
     newUser.password = undefined;

     res.json({
        token,
        user: newUser
     });
   } catch (error) {
    res.status(500).json({message: error.message});
   }
}

export const login = async(req, res) => {
    try {
        const {email,password} = req.body;
          if(!email || !password){
            return res.status(400).json({message: "Invalid credentials"})
        }
        const user = await User.findOne({email});

      
        if(!user){
            return res.status(400).json({message: "Invalid credentials"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid credentials"})
        }

        const token = jwt.sign(
          { id: user._id},
           process.env.JWT_SECRET,
           {expiresIn: process.env.JWT_EXPIRES_IN}
        )
 
        user.password = undefined
        return res.json({
             token,
            user
        })
    } catch (error) {
       res.status(500).json({message: error.message}) 
    }
}

export const getMe = async (req, res) => {
  res.json({
    user: req.user,
  });
};

