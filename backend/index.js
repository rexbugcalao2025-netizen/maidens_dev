const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

/*
    TODO: Add routes here
*/ 

require('dotenv').config();
const hostOrigin = process.env.ORIGIN;
const dbConnectionString = process.env.DB_CONNECTION;
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
mongoose.connect(dbConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
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
