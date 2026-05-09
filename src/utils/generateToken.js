const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET || 'matchcota_dev_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};

module.exports = generateToken;
