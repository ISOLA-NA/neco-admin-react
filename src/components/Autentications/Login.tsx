// src/Login.tsx
import React, { useState, ChangeEvent, KeyboardEvent, MouseEvent } from "react";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaPhone,
  FaGlobe,
  FaChevronDown,
} from "react-icons/fa";

const Login: React.FC = () => {
  const [isOtp, setIsOtp] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>("en");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  // Handlers
  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const handleToggleOtp = () => {
    setIsOtp(!isOtp);
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-red-400 via-orange-300 to-red-400">
      {/* Optional: Add a wave SVG for a wave-like effect */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1440 320"
      >
        <path
          fill="rgba(255, 255, 255, 0.3)"
          d="M0,224L48,213.3C96,203,192,181,288,170.7C384,160,480,160,576,165.3C672,171,768,181,864,192C960,203,1056,213,1152,202.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg>

      <div className="relative z-10 w-full max-w-md p-8 bg-white bg-opacity-90 rounded-lg shadow-lg mx-4 sm:mx-0">
        {/* Language Switcher */}
        <div className="absolute top-6 left-6 w-30">
          <div className="relative">
            <FaGlobe
              size={20}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 text-orange-500 pointer-events-none"
            />
            <select
              value={language}
              onChange={handleLanguageChange}
              className="peer w-full border-b-2 border-orange-300 pl-8 pb-2 pr-8 bg-transparent appearance-none focus:outline-none focus:border-red-500 transition-colors duration-300 relative text-black text-sm sm:text-base"
              aria-label="Language"
            >
              <option value="en">English</option>
              <option value="fa">فارسی</option>
            </select>
            <FaChevronDown
              size={20}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 text-orange-500 pointer-events-none"
            />
            <label className="absolute left-8 transform 
              transition-all duration-300 cursor-text
              top-0 text-sm text-black -translate-y-full
              peer-placeholder-shown:top-[30%] 
              peer-placeholder-shown:text-base 
              peer-placeholder-shown:text-black 
              peer-placeholder-shown:-translate-y-1/2
              peer-focus:top-0 
              peer-focus:text-sm 
              peer-focus:text-black 
              peer-focus:-translate-y-full">
              Language
            </label>
          </div>
        </div>

        {/* Profile Placeholder */}
        <div className="absolute top-6 right-6">
          <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
            <span className="text-orange-500 text-lg">+</span>
          </div>
        </div>

        {/* Toggle Switcher */}
        <div className="flex justify-center items-center mt-20">
          <div className="flex items-center gap-6">
            <span className="text-black text-sm sm:text-base">Username / Password</span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="toggle toggle-warning hidden"
                checked={isOtp}
                onChange={handleToggleOtp}
                aria-label="Toggle OTP"
              />
              <span className="relative">
                <span
                  className={`block w-10 h-6 rounded-full transition-transform duration-300 ${
                    isOtp ? "bg-orange-500 translate-x-4" : "bg-gray-300"
                  }`}
                ></span>
                <span
                  className={`absolute top-0 left-0 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    isOtp ? "translate-x-4" : "translate-x-0"
                  }`}
                ></span>
              </span>
            </label>
            <span className="text-black text-sm sm:text-base">OTP</span>
          </div>
        </div>

        {/* Form */}
        <form className="mt-12" onSubmit={handleFormSubmit}>
          {!isOtp ? (
            <>
              {/* Username Field */}
              <div className="mb-6 relative">
                <FaUser
                  size={20}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 text-orange-500 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder=" "
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="peer w-full border-b-2 border-orange-300 pl-8 pb-2 focus:outline-none focus:border-red-500 transition-colors duration-300 text-black text-sm sm:text-base"
                  required
                />
                <label className="absolute left-8 transform 
                  transition-all duration-300 cursor-text
                  top-0 text-sm text-black -translate-y-full
                  peer-placeholder-shown:top-[30%] 
                  peer-placeholder-shown:text-base 
                  peer-placeholder-shown:text-black 
                  peer-placeholder-shown:-translate-y-1/2
                  peer-focus:top-0 
                  peer-focus:text-sm 
                  peer-focus:text-black 
                  peer-focus:-translate-y-full">
                  Username
                </label>
              </div>

              {/* Password Field */}
              <div className="mb-6 relative">
                <FaLock
                  size={20}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 text-orange-500 pointer-events-none"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="peer w-full border-b-2 border-orange-300 pl-8 pr-10 pb-2 focus:outline-none focus:border-red-500 transition-colors duration-300 text-black text-sm sm:text-base"
                  required
                />
                <label className="absolute left-8 transform 
                  transition-all duration-300 cursor-text
                  top-0 text-sm text-black -translate-y-full
                  peer-placeholder-shown:top-[30%] 
                  peer-placeholder-shown:text-base 
                  peer-placeholder-shown:text-black 
                  peer-placeholder-shown:-translate-y-1/2
                  peer-focus:top-0 
                  peer-focus:text-sm 
                  peer-focus:text-black 
                  peer-focus:-translate-y-full">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleShowPassword}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-red-500 transition-colors duration-300 focus:outline-none"
                  aria-label={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full mt-8 bg-red-500 text-black py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-300 text-sm sm:text-base"
              >
                Login
              </button>
            </>
          ) : (
            <>
              {/* Phone Number Field */}
              <div className="mb-6 relative">
                <FaPhone
                  size={20}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 text-orange-500 pointer-events-none"
                />
                <input
                  type="tel"
                  placeholder=" "
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="peer w-full border-b-2 border-orange-300 pl-8 pb-2 focus:outline-none focus:border-red-500 transition-colors duration-300 text-black text-sm sm:text-base"
                  required
                />
                <label className="absolute left-8 transform 
                  transition-all duration-300 cursor-text
                  top-0 text-sm text-black -translate-y-full
                  peer-placeholder-shown:top-[30%] 
                  peer-placeholder-shown:text-base 
                  peer-placeholder-shown:text-black 
                  peer-placeholder-shown:-translate-y-1/2
                  peer-focus:top-0 
                  peer-focus:text-sm 
                  peer-focus:text-black 
                  peer-focus:-translate-y-full">
                  Phone Number
                </label>
              </div>

              {/* Send Code Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 mt-8 bg-red-500 text-black py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-300 text-sm sm:text-base"
              >
                <FaPhone />
                Send Code
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
