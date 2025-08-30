// src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams(); // token from URL
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/auth/reset-password/${token}`, {
        password
      });
      alert('Password reset successful!');
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <div className="relative min-h-screen bg-cover bg-center" style={{ backgroundImage: 'url("/image5.png")' }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-20 text-white text-3xl font-bold hover:text-orange-400">←Back</button>
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">Reset Password</h2>
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium">
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
