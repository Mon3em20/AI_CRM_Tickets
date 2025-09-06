const jwt = require("jsonwebtoken");
const config = require('../config/env');

module.exports = function authentication(req, res, next) {
    const cookie = req.cookies;// if not working then last option req.headers.cookie then extract token
    console.log('inside auth middleware')
    // console.log(cookie);

    if (!cookie) {
        return res.status(401).json({ message: "No Cookie provided" });
    }
    console.log("after cookie")

    const token = cookie.token;
    console.log("before token")

    if (!token) {
        return res.status(405).json({ message: "No token provided" });
    }
    console.log("after token")

    jwt.verify(token, config.SECRET_KEY, (error, decoded) => {
        if (error) {
            return res.status(403).json({ message: "Invalid token" });
        }
        console.log("after jwt")

        // Attach the decoded user ID to the request object for further use
        //console.log(decoded.user)

        req.user = decoded.user;
        console.log(decoded.user)
        next();
    });
};