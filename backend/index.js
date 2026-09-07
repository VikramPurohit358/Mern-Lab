import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv'
import cookieParser from "cookie-parser";
import cors from 'cors'
import dns from 'dns'

import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";

dotenv.config()
const app = express()

const port = 8082

dns.setServers(["8.8.8.8", "1.1.1.1"]);

mongoose.connect(process.env.dbURL, {
    tlsAllowInvalidCertificates: true
}).then(() => {
    console.log('DB Connected')
}).catch((err) => {
    console.log(err)
})

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(cookieParser())




app.use('/customers', customerRoutes)
app.use('/products', productRoutes)






app.listen(port, () => {
    console.log(`Server Started at ${port}`)
})