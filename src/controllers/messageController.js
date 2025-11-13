// src/controllers/messageController.js
// Simple demo endpoints for public and validated submissions.

const submissions = [];

export const getHealthMessage = (req, res) => {
  return res.status(200).json({ message: 'Backend working' });
};

export const submitMessage = (req, res) => {
  const { name, email, message } = req.body;
  const payload = {
    name,
    email,
    message,
    receivedAt: new Date().toISOString(),
  };

  submissions.push(payload);
  console.log('📨 Submission received:', payload);

  return res.status(201).json({
    message: 'Submission stored successfully.',
    data: payload,
    totalSubmissions: submissions.length,
  });
};

export default {
  getHealthMessage,
  submitMessage,
};

