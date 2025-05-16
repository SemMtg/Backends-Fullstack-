const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET_KEY || 'my-secret-key';

// Middleware to check if the request has a valid JWT token
function authenticate(req, res, next) {
    const token = req.headers['authorization'];
    console.log('Authorization Header in middleware:', token);

    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token has expired' });
            }
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.userName = decoded.userName;
        req.userLevel = decoded.userLevel;

        next();
    });
}

module.exports = authenticate;
