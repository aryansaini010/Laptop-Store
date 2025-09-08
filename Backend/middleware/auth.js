// middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'yourSecretKeyHere'; // Make sure this matches the one in app.js or your config file

const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // IMPORTANT: Adjust this line based on your JWT payload structure.
    // If your JWT payload is like { user: { id: '...', name: '...', email: '...' } }, use:
    req.user = decoded.user; // Assign the entire user object from the token payload

    // If your JWT payload is directly { id: '...', name: '...', email: '...' }, use:
    // req.user = decoded;

    // In your backend routes, you would then access req.user.id for the user's ID.

    next(); // Move to the next middleware/route handler
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
