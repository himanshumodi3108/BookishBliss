const { verifyToken } = require('../utils/jwt');

// Verify JWT token middleware
const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decoded = verifyToken(token);
      req.user = {
        uid: decoded.userId,
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        admin: decoded.isAdmin || false
      };
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  } catch (error) {
    console.error('JWT Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  verifyJWT
};



