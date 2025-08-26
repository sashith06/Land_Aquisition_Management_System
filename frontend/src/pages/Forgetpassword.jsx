
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleReset = (e) => {
    e.preventDefault();

    // Simulate password reset logic
    if (email) {
      alert(`Password reset link sent to ${email}`);
      navigate('/login'); // Redirect to login after sending link
    } else {
      alert('Please enter your email');
    }
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: 'url("/image5.png")' }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Back arrow button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-20 text-white text-3xl font-bold hover:text-orange-400"
        aria-label="Go back"
      >
        ←Back
      </button>

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
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium"
            >
              Send Reset Link
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
