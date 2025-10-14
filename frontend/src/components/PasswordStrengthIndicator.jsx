// components/PasswordStrengthIndicator.jsx
import React from 'react';
import { calculatePasswordStrength, validatePassword } from '../utils/passwordValidator';

const PasswordStrengthIndicator = ({ password, showRequirements = true, className = '' }) => {
  const strength = calculatePasswordStrength(password);
  const validation = validatePassword(password);
  
  const requirements = [
    {
      test: (pwd) => pwd.length >= 8,
      label: 'At least 8 characters',
      icon: '📏'
    },
    {
      test: (pwd) => /[A-Z]/.test(pwd),
      label: 'One uppercase letter',
      icon: '🔠'
    },
    {
      test: (pwd) => /[a-z]/.test(pwd),
      label: 'One lowercase letter',
      icon: '🔡'
    },
    {
      test: (pwd) => /[0-9]/.test(pwd),
      label: 'One number',
      icon: '🔢'
    },
    {
      test: (pwd) => /[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\;'\/~`]/.test(pwd),
      label: 'One special character',
      icon: '🔣'
    }
  ];

  return (
    <div className={`password-strength-indicator ${className}`}>
      {/* Strength Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Password Strength</span>
          <span 
            className="text-sm font-bold"
            style={{ color: strength.color }}
          >
            {strength.level}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{
              width: `${strength.score}%`,
              backgroundColor: strength.color
            }}
          />
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-700 mb-2">Password must include:</p>
          {requirements.map((req, index) => {
            const passes = req.test(password || '');
            return (
              <div
                key={index}
                className={`flex items-center text-sm transition-colors duration-200 ${
                  passes ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                <span className="mr-2 text-base">
                  {passes ? '✅' : req.icon}
                </span>
                <span className={passes ? 'line-through' : ''}>
                  {req.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Validation Errors */}
      {password && !validation.isValid && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm font-medium text-red-800 mb-1">Issues to fix:</p>
          <ul className="text-sm text-red-700 space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2 text-red-500">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Message */}
      {password && validation.isValid && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <span className="mr-2 text-green-500">✅</span>
            <span className="text-sm font-medium text-green-800">
              Password meets all security requirements!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;