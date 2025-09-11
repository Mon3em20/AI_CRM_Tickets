const jwt = require("jsonwebtoken");
const config = require('../config/env');

module.exports = function authentication(req, res, next) {
    let token = null;
    
    // Try to get token from Authorization header first (for API testing)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log('Token found in Authorization header');
    } 
    // Fallback to cookies (for web app)
    else {
        const cookie = req.cookies;
        console.log('inside auth middleware');
        
        if (!cookie) {
            return res.status(401).json({ 
                status: 'error',
                message: "No authentication provided. Please provide token in Authorization header or cookie." 
            });
        }
        
        token = cookie.token;
        console.log('Token found in cookie');
    }

    if (!token) {
        return res.status(401).json({ 
            status: 'error',
            message: "No token provided. Please login first." 
        });
    }

    jwt.verify(token, config.SECRET_KEY, (error, decoded) => {
        if (error) {
            console.error('JWT verification error:', error.message);
            return res.status(403).json({ 
                status: 'error',
                message: "Invalid or expired token. Please login again." 
            });
        }

        // Attach the decoded user to the request object
        req.user = decoded.user;
        console.log('Authenticated user:', { userId: decoded.user.userId, role: decoded.user.role });
        next();
    });
};