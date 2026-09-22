import api from './axios';

export const verifyEmail = async (token) => {
  const res = await api.post('/auth/verify-email', { token });
  return res.data;
};

export const resendVerification = async (email) => {
  const res = await api.post('/auth/resend-verification', { email });
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
};

export const resetPassword = async (token, newPassword) => {
  const res = await api.post('/auth/reset-password', { token, newPassword });
  return res.data;
};