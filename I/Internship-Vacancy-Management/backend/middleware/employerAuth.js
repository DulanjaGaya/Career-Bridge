// This middleware assumes the authentication system adds employer info to the request
// Your teammate's authentication should add req.user with userId and role

const checkEmployerRole = (req, res, next) => {
  // Assuming req.user is populated by the authentication middleware
  // with user information including role
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Check if user has employer role
  if (req.user.role !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only employers can perform this action.'
    });
  }

  next();
};

module.exports = { checkEmployerRole };