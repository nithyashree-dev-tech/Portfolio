const jwt = require('jsonwebtoken');

const getToken = (req) => {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7);

  const cookies = (req.headers.cookie || '').split(';').map((cookie) => cookie.trim());
  const tokenCookie = cookies.find((cookie) => cookie.startsWith('portfolio_admin_token='));
  return tokenCookie ? decodeURIComponent(tokenCookie.split('=').slice(1).join('=')) : null;
};

const authMiddleware = (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: 'Authentication is not configured', data: {} });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
module.exports.requireAuth = authMiddleware;
module.exports.requireAdmin = authMiddleware;
