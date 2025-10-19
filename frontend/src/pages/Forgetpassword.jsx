import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { generateOTP } from '../api'; // import from your api.js

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) return alert('Please enter your email');

    try {
      setLoading(true);
      const response = await generateOTP({ email }); // use API layer
      alert(response.data.message);
      navigate('/verify-otp', { state: { email } }); // pass email to OTP page
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-cover bg-center" style={{ backgroundImage: 'url("/image5.png")' }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      {/* Breadcrumb Navigation */}
      <div className="relative z-10 pt-4 px-4">
        <nav className="flex items-center space-x-2 text-sm">
          <Link 
            to="/" 
            className="flex items-center text-white/80 hover:text-white transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          <span className="text-white/60">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
          <Link 
            to="/login" 
            className="text-white/80 hover:text-white transition-colors duration-200"
          >
            Login
          </Link>
          <span className="text-white/60">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
          <span className="text-orange-400 font-medium">Forgot Password</span>
        </nav>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">Forget Password</h2>
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
                loading ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm">
            Remembered your password?{' '}
            <Link to="/login" className="text-orange-500 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
