import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import connectDB from './config/mongodb.js'



const app = express()

app.use(express.json())
app.use(cookieParser())

app.use(cors({credentials: true}))

const port  = process.env.PORT || 8000
await connectDB()

app.get('/',(req, res)=>{
    res.send('API is running')
})

app.listen(port, ()=>{
    console.log(`Server is running at ${port}`)
})