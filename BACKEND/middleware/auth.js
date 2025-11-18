// BACKEND/middleware/auth.js
const jwt = require('jsonwebtoken');


// CRITICAL FIX: Ensure the fallback key is ONLY used if process.env.JWT_SECRET is truly undefined,
// but for production, this fallback should be removed.
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const auth = (req, res, next) => {
    // 1. Get token from header: Check for the standard 'Authorization' header
    const authHeader = req.header('Authorization');

    // 2. Check if header exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header missing or malformed (Expected: Bearer <token>).' });
    }

    // 3. Extract the token (strip 'Bearer ')
    const token = authHeader.split(' ')[1];

    try {
        // 4. Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Validate token payload integrity
        if (!decoded.id || !decoded.role) {
            return res.status(401).json({
                message: 'Token payload is corrupted or missing essential user data.'
            });
        }

        // 5. Attach user data to request object
        req.user = {
            id: decoded.id,
            role: decoded.role.toLowerCase(),
            email: decoded.email
        };

        next();
    } catch (e) {
        console.error('Token validation error:', e.message);
        // Returns 401 for signature errors or expired tokens
        res.status(401).json({ message: 'Token is not valid or has expired.' });
    }
};

module.exports = auth;
