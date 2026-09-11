import jwt from 'jsonwebtoken';

function generateToken(userId, role) {
  console.log(process.env.JWT_SECRET)
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export default generateToken;