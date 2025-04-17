import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import transporter from '../config/nodermailer.js'

export const register = async(req, res) =>{
    
    const {name, email, password} = req.body

    if(!name || !email || !password){
        return res.json({
            success: false,
            message: "Missing details"
        })
    }

    try {

        const existingUser = await userModel.findOne({email})

        if(existingUser){
            return res.json({
                success: false,
                message: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        
        const user = new userModel({name, email, password: hashedPassword})

        await user.save()

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET,{ expiresIn: '7d'})

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        //sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to BLABLABLA',
            text: `Welcome to BLABLABLA website. Your account has been created with email id: ${email}`
        }

        await transporter.sendMail(mailOptions)

        return res.json({
            success: true,
            message: "Registered Successfully"
        })

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

export const login = async(req, res) =>{
    const {email, password} = req.body

    if(!email || !password){
        return res.json({
            success: false,
            message: "Email and Password are required"
        })
    }

    try {
        
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({
                success: false,
                message: "Email not found"
            })
        }

        const isMatched = await bcrypt.compare(password, user.password)

        if(!isMatched){
            return res.json({
                success: false,
                message: 'Password did not match'
            })
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.json({
            success: true,
            message: "Logged In"
        })

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

export const logout = async(req, res) =>{
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        })

        return res.json({
            success: true,
            message: "Logged Out"
        })
    } catch (error) {
        return res.json({
            success: false,
            message : error.message
        })
    }
}

//send verification otp to user's email
export const sendVerifyOtp = async(req, res) =>{
    try {
        const {userId} = req.body

        const user = await userModel.findById(userId)

        if(user.isAccountVerified){
            return res.json({
                success: false, 
                message: "Account already verified"
            })
        }
    } catch (error) {
        res.json({ 
            success: false, message: error.message
        })
    }
}