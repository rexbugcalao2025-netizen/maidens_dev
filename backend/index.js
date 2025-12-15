const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

/*
    TODO: Add routes here
*/ 
const userRoutes = require('./routes/user');
const employeeRoutes = require('./routes/employee');
const clientRoutes = require('./routes/client');

require('dotenv').config();
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


/*
     Start server only if not imported by tests

*/ 
if (require.main === module) {
    app.listen(port, () => {
        console.log(`API is now online on port ${port}`);
    })
    .on("error", (err) => {
        console.error("Failed to start server:", err);
    });
}

module.exports = app;
