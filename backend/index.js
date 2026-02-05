import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

/*
    TODO: Add routes here
*/ 
import userRoutes from './routes/user.js';
import employeeRoutes from './routes/employee.js';
import clientRoutes from './routes/client.js';
import productRoutes from './routes/product.js';
import productCategoryRoutes from './routes/productCategory.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/order.js';
import serviceRoutes from './routes/service.js';
import serviceCategoryRoutes from './routes/serviceCategory.js';
import clientServiceRoutes from './routes/clientService.js';
import inventoryRoutes from './routes/inventory.js';


dotenv.config();
const hostOrigin = process.env.ORIGIN;
const port = process.env.PORT || 3000;



const app = express();

/*
    Middlewares
*/ 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
    origin: hostOrigin,
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// health check (optional)
app.get('/health',(_, res) => res.json({ ok: true}));


/*
    Connect to Database
*/ 
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

mongoose.connection.once('open', () => {
    console.log(`Database connection is established.`);
});

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});


/*
    TO DO: app.use("/api/...", routes)
*/ 
app.use('/users', userRoutes);
app.use('/employees', employeeRoutes);
app.use('/clients', clientRoutes);
app.use('/products', productRoutes);
app.use('/product-categories', productCategoryRoutes);
app.use('/carts', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/services', serviceRoutes);
app.use('/service-categories', serviceCategoryRoutes);
app.use('/client-services',clientServiceRoutes);
app.use('/api/inventory', inventoryRoutes);

/*
     Start server only if not imported by tests

*/ 


// import path from 'path';

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename){
    app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
    }).on('error', (err) => {
        console.error('Failed to start server:', err);
    });
}

// if (require.main === module) {
//     app.listen(port, () => {
//         console.log(`🚀 Server running on port ${port}`);
//     })
//     .on("error", (err) => {
//         console.error("Failed to start server:", err);
//     });
// }

// module.exports = app;

export default app;
