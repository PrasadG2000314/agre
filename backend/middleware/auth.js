const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'agri_super_secure_secret_2026';

// Middleware to extract user from Authorization header if present
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (e) {
      // Token expired or invalid
    }
  }
  next();
};

// Strict Middleware: Only Admin accounts can approve or perform mutations in logistics
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication required. Admita witharai logistic ake wena deewal approve / modify karanna puluwan.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    if (decoded.role && decoded.role.toLowerCase() === 'admin') {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access Denied: Only Administrator accounts have permission to approve, assign, or modify logistics operations. Regular users have view-only access.'
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in as an Admin.'
    });
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  JWT_SECRET
};
