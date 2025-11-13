// src/controllers/userController.js
// User-specific handlers for protected resources.

export const getProfile = async (req, res) => {
  const { user } = req;
  return res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  });
};

export default {
  getProfile,
};

