// middleware/adminAuth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'yourSecretKeyHere'; // Use the same secret as in app.js

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.id; // User ID from token

    // Check if user is admin (this will be done after fetching user from DB in app.js)
    // For now, we'll just pass the user ID. The actual admin check will happen in the route handler.
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
