const jwt = require('jsonwebtoken');
const User = require('./models/User');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SKEY;
const REFRESH_SECRET = process.env.JWT_REFRESH_SKEY;

if (!JWT_SECRET) {
    throw new Error('Missing JWT_SKEY in .env');
}

if (!REFRESH_SECRET){
    throw new Error('Missing JWT_REFRESH_KEY in .env');
}

/*
   Create Access Token
*/ 
module.exports.createAccessToken = (user) => {
    const payload = {
        id      : user._id,
        email   : user.email,
        isAdmin : user.is_admin
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '15m'     
    });
};

/*
   Create Refresh Token
*/ 
module.exports.createRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        REFRESH_SECRET,
        { expiresIn: '14d' }
    );
}

/*
   /auth/refresh endpoint
*/ 
module.exports.refreshToken = async (req, res) => {
    try {

        const token = req.cookies?.refreshToken;

        if (!token) {
            return res.status(401)
                .json({ message: "No refresh token" });
        }

        
        // ✅ Verify refresh token (PROMISIFIED)
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, REFRESH_SECRET, (err, decoded) => {
                if (err) reject(err);
                else resolve(decoded);
            });
        });

        // 🔑 ALWAYS reload full user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401)
                .json({ message: 'User no longer exists' });
        }

        // ✅ Issue NEW access token
        // const accessToken = createAccessToken({ _id: decoded.id });
        const accessToken = module.exports.createAccessToken(user);
        res.json({ accessToken });


    } catch (err) {
        console.error('Refresh token error:', err);
        return res.status(500)
            .json({ message: 'Failed to refresh token' });
    }
    
}


/*
    Middleware: Verify Token
*/ 
module.exports.verify = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Validate header exists and has proper format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            auth: "Failed",
            message: "Missing or invalid Authorization header"
        });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                auth: "Failed",
                message: "Invalid or expired token"
            });
        }

        req.user = decoded;
        next();
    });
};

/*
    Middleware: Verify Admin
*/ 
module.exports.verifyAdmin = (req, res, next) => {
    if (req.user?.isAdmin) {
        return next();
    }

    return res.status(403).json({
        auth: "Failed",
        message: "Admin access only"
    });
};
/*
    Middleware: Check if logged in
*/ 
module.exports.isLoggedIn = (req, res, next) => {
    if (req.user) return next();
    return res.status(401).json({ message: "Not logged in" });
};

/*
    Centralized Error Handler
*/ 
module.exports.errorHandler = (err, req, res, next) => {
    console.error("Error:", err);

    const status = err.status || 500;

    return res.status(status).json({
        error: {
            message   : err.safeMessage || "Internal Server Error",
            code      : err.code || "SERVER_ERROR",
            details   : err.details || null,
        }
    });
};