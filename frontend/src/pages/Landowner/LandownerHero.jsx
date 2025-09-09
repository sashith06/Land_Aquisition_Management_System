import React, { useState, useEffect } from 'react';
import { requestOtp, verifyOtp } from '../../api';

const LandownerHero = () => {
  const [nic, setNic] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const requestOtpHandler = async () => {
    if (!/^\d{12}$/.test(nic)) {
      setMessage('NIC must be 12 digits');
      return false;
    }

    if (!/^\+947\d{8}$/.test(mobile)) {
      setMessage('Invalid mobile format (e.g., +947XXXXXXXX)');
      return false;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await requestOtp(nic, mobile);
      setOtpSent(true);
      setResendCooldown(60);
      setMessage('OTP sent to your mobile number');

      // Show OTP for testing (remove this in production!)
      if (res.data.otp) setOtp(res.data.otp.toString());

      return true;
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to send OTP');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    await requestOtpHandler();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return setMessage('Please enter the OTP');

    setLoading(true);
    setMessage('');
    try {
      const res = await verifyOtp(nic, mobile, otp);
      setMessage(res.data.message);

      // Save token and user data, then redirect
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: res.data.ownerId,
        name: res.data.owner.name,
        nic: res.data.owner.nic,
        phone: res.data.owner.phone,
        email: res.data.owner.email,
        type: 'landowner'
      }));
      window.location.href = '/landowner-dashboard';
    } catch (err) {
      setMessage(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    await requestOtpHandler();
  };

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Track Your <span className="text-orange-600">Land</span> <br />
            Stay Informed at <span className="text-orange-500">Every</span> Step!
          </h1>

          <p className="text-lg text-gray-700 mb-10 max-w-xl">
            Welcome to the Track Your Land feature! This tool is designed to help landowners stay
            informed about the acquisition process with real-time updates, document access, and
            notifications.
          </p>

          {/* Login Form */}
          <div className="bg-white rounded-3xl p-8 max-w-md shadow-xl border border-gray-200 transition duration-300 hover:shadow-2xl w-full">
            <form className="w-full" onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp}>
              <div className="mb-6">
                <label htmlFor="nic" className="block text-gray-800 font-medium mb-2">
                  NIC Number:
                </label>
                <input
                  type="text"
                  id="nic"
                  name="nic"
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  pattern="\d{12}"
                  minLength={12}
                  maxLength={12}
                  required
                  placeholder="Enter 12-digit NIC"
                  disabled={otpSent}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="mobile" className="block text-gray-800 font-medium mb-2">
                  Mobile Number:
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  pattern="\+947\d{8}"
                  required
                  placeholder="+947XXXXXXXX"
                  disabled={otpSent}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {otpSent && (
                <div className="mb-6">
                  <label htmlFor="otp" className="block text-gray-800 font-medium mb-2">
                    OTP:
                  </label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md font-semibold transition duration-300"
              >
                {loading ? 'Please wait...' : otpSent ? 'Verify OTP & Login' : 'Request OTP'}
              </button>

              {otpSent && (
                <div className="mt-4 text-center">
                  {resendCooldown > 0 ? (
                    <p className="text-sm text-gray-500">Resend OTP in {resendCooldown}s</p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              )}
            </form>

            {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
          </div>
        </div>

        {/* Right Image */}
        <div>
          <img
            src="/image1.png"
            alt="Curved highway through forest"
            className="rounded-3xl shadow-2xl w-full h-auto object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

export default LandownerHero;
