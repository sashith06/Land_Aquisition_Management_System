import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api.js';

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email) {
      alert('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPassword({ email });
      alert(response.data.message || `Password reset link sent to ${email}`);
      setEmail('');
      navigate('/login'); // Redirect after successful request
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || 'Failed to send reset link. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: 'url("/image5.png")' }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Centered form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">
            Forget Password
          </h2>
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-2 rounded-lg font-medium ${
                loading
                  ? 'bg-orange-300 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm">
            Remembered your password?{' '}
            <Link to="/login" className="text-orange-500 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
