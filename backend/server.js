
import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import connectDB from './config/mongodb.js'

import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'

const app = express()
const port = process.env.PORT || 4000

const allowedOrigins = [
    'https://full-stack-e-commerce-website-ruddy.vercel.app',
    'https://full-stack-e-commerce-website-ogic-kgt1p0je3-manisha-rawat.vercel.app'
]

app.use(cors({
    origin: (origin, callback) => {
        if (
            !origin ||
            allowedOrigins.includes(origin) ||
            /^https:\/\/full-stack-e-commerce-website-[a-z0-9-]+\.vercel\.app$/.test(origin)
        ) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token']
}))

app.use(express.json())

app.get('/', (req, res) => {
    res.send('API Working')
})

app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)

connectDB()

app.listen(port, () => {
    console.log('Server started on PORT : ' + port)
})
