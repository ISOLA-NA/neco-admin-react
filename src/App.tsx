import { useState } from "react";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaPhone,
  FaGlobe,
  FaChevronDown, // اضافه کردن آیکون فلش
} from "react-icons/fa";

const Login = () => {
  const [isOtp, setIsOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState("en");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md relative">
        {/* Language Switcher به صورت Select */}
        <div className="absolute top-6 left-6 w-30">
          <div className="relative">
            <FaGlobe
              size={20}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
            />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="peer w-full border-b-2 border-gray-300 pl-8 pb-2 pr-8 bg-transparent appearance-none focus:outline-none focus:border-blue-500 transition-colors duration-300 relative"
            >
              <option value="en">English</option>
              <option value="fa">فارسی</option>
            </select>
            <FaChevronDown
              size={20} // همسان‌سازی اندازه آیکون
              className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
            />
            <label
              className="
        absolute left-8 transform 
        transition-all duration-300 cursor-text
        top-0 text-sm text-blue-500 -translate-y-full
        peer-placeholder-shown:top-[30%] 
        peer-placeholder-shown:text-base 
        peer-placeholder-shown:text-gray-500 
        peer-placeholder-shown:-translate-y-1/2
        peer-focus:top-0 
        peer-focus:text-sm 
        peer-focus:text-blue-500 
        peer-focus:-translate-y-full
      "
            ></label>
          </div>
        </div>

        {/* Profile Placeholder */}
        <div className="absolute top-6 right-6">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-500">+</span>
          </div>
        </div>

        {/* Toggle Switcher */}
        <div className="flex justify-center items-center mt-20">
          <div className="flex items-center gap-6">
            <span className="text-gray-700">Username / Password</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={isOtp}
              onChange={() => setIsOtp(!isOtp)}
            />
            <span className="text-gray-700">OTP</span>
          </div>
        </div>

        {/* فرم */}
        <form className="mt-12">
          {!isOtp ? (
            <>
              {/* فیلد Username */}
              <div className="mb-8 relative">
                <FaUser
                  size={20}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder=" "
                  className="peer w-full border-b-2 border-gray-300 pl-8 pb-2 focus:outline-none focus:border-blue-500 transition-colors duration-300"
                />
                <label
                  className="
                    absolute left-8 transform 
                    transition-all duration-300 cursor-text
                    top-0 text-sm text-blue-500 -translate-y-full
                    peer-placeholder-shown:top-[30%] 
                    peer-placeholder-shown:text-base 
                    peer-placeholder-shown:text-gray-500 
                    peer-placeholder-shown:-translate-y-1/2
                    peer-focus:top-0 
                    peer-focus:text-sm 
                    peer-focus:text-blue-500 
                    peer-focus:-translate-y-full
                  "
                >
                  Username
                </label>
              </div>

              {/* فیلد Password */}
              <div className="mb-8 mt-12 relative">
                <FaLock
                  size={20}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  className="peer w-full border-b-2 border-gray-300 pl-8 pr-8 pb-2 focus:outline-none focus:border-blue-500 transition-colors duration-300"
                />
                <label
                  className="
                    absolute left-8 transform 
                    transition-all duration-300 cursor-text
                    top-0 text-sm text-blue-500 -translate-y-full
                    peer-placeholder-shown:top-[30%] 
                    peer-placeholder-shown:text-base 
                    peer-placeholder-shown:text-gray-500 
                    peer-placeholder-shown:-translate-y-1/2
                    peer-focus:top-0 
                    peer-focus:text-sm 
                    peer-focus:text-blue-500 
                    peer-focus:-translate-y-full
                  "
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-300 focus:outline-none"
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>

              {/* دکمه Login */}
              <button className="btn btn-primary w-full mt-8 transition-colors duration-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Login
              </button>
            </>
          ) : (
            <>
              {/* فیلد Phone Number */}
              <div className="mb-8 relative">
                <FaPhone
                  size={20}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                />
                <input
                  type="number"
                  placeholder=" "
                  className="peer w-full border-b-2 border-gray-300 pl-8 pb-2 focus:outline-none focus:border-blue-500 transition-colors duration-300"
                />
                <label
                  className="
                    absolute left-8 transform 
                    transition-all duration-300 cursor-text
                    top-0 text-sm text-blue-500 -translate-y-full
                    peer-placeholder-shown:top-[30%] 
                    peer-placeholder-shown:text-base 
                    peer-placeholder-shown:text-gray-500 
                    peer-placeholder-shown:-translate-y-1/2
                    peer-focus:top-0 
                    peer-focus:text-sm 
                    peer-focus:text-blue-500 
                    peer-focus:-translate-y-full
                  "
                >
                  Phone Number
                </label>
              </div>

              {/* دکمه Send Code */}
              <button className="btn btn-primary w-full flex items-center justify-center gap-2 mt-12 transition-colors duration-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
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
