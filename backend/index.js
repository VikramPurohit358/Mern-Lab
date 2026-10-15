import 'dotenv/config';
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from 'cors'
import dns from 'dns'

import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";

const app = express()

// Render injects PORT automatically; fall back to 8082 for local dev
const port = process.env.PORT || 8082

dns.setServers(["8.8.8.8", "1.1.1.1"]);

mongoose.connect(process.env.dbURL, {
    tlsAllowInvalidCertificates: true
}).then(() => {
    console.log('DB Connected')
}).catch((err) => {
    console.log(err)
})

// Build allowed origins from FRONTEND_URL env var (comma-separated) + localhost fallback
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    ...(process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
        : [])
]

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (Postman, mobile apps, curl)
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin)) return callback(null, true)
        callback(new Error(`CORS: origin ${origin} not allowed`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(cookieParser())

// Health check — useful for Render uptime ping
app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.use('/customers', customerRoutes)
app.use('/products', productRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', orderRoutes)

app.listen(port, () => {
    console.log(`Server Started at ${port}`)
})