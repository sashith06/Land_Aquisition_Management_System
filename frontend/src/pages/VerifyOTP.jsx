import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { resetPasswordWithOTP } from '../api'; // use the new combined function
import { validatePassword } from '../utils/passwordValidator';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setPasswordError('');
    
    if (!otp || !newPassword) {
      setPasswordError('Please enter both OTP and new password');
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setPasswordError('Password does not meet security requirements. Please check the requirements below.');
      return;
    }

    try {
      setLoading(true);

      // Use the new combined function that verifies OTP and resets password in one call
      await resetPasswordWithOTP({ 
        email, 
        otp, 
        newPassword 
      });

      alert('Password reset successful!');
      navigate('/login');
    } catch (err) {
      console.error(err);
      let errorMessage = 'Password reset failed';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        
        // Handle password validation errors from backend
        if (err.response.data.passwordErrors) {
          setPasswordError(err.response.data.passwordErrors.join(", "));
          return;
        }
      }
      
      setPasswordError(errorMessage);
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
            to="/forget-password" 
            className="text-white/80 hover:text-white transition-colors duration-200"
          >
            Forgot Password
          </Link>
          <span className="text-white/60">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
          <span className="text-orange-400 font-medium">Verify OTP</span>
        </nav>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">Verify OTP & Reset Password</h2>
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter the OTP"
                maxLength="6"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  required
                  className={`w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    passwordError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Exact 8 chars (e.g., Abc123@!)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg 
                    className="w-5 h-5 text-gray-500 hover:text-gray-700" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    {showPassword ? (
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21m-7.625-7.125L21 21" 
                      />
                    ) : (
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  required
                  className={`w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    passwordError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg 
                    className="w-5 h-5 text-gray-500 hover:text-gray-700" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    {showConfirmPassword ? (
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21m-7.625-7.125L21 21" 
                      />
                    ) : (
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Password Error */}
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}

            <button
              type="submit"
              disabled={loading || !otp || !newPassword || !confirmPassword}
              className={`w-full text-white py-2 rounded-lg font-medium ${
                loading || !otp || !newPassword || !confirmPassword
                  ? 'bg-orange-300 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {loading ? 'Verifying...' : 'Verify & Reset'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
