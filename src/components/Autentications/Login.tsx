import React, { useState } from "react";
import { FaUser, FaLock, FaPhone, FaEye, FaEyeSlash } from "react-icons/fa";
import DynamicInput from "../utilities/DynamicInput";
import DynamicSelector from "../utilities/DynamicSelector";
import DynamicModal from "../utilities/DynamicModal";

const Login: React.FC = () => {
  const [isOtp, setIsOtp] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>("en");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const [selectedName, setSelectedName] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  const [nameOptions, setNameOptions] = useState([
    { value: "", label: "Select Item" },
    { value: "Predefined", label: "Predefined Example" },
  ]);

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "fa", label: "فارسی" },
  ];

  const handleToggleOtp = () => {
    setIsOtp(!isOtp);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRowData(null);
  };

  const handleSelectFromModal = (nameValue: string) => {
    const exists = nameOptions.find((opt) => opt.value === nameValue);
    if (!exists) {
      setNameOptions((prev) => [
        ...prev,
        { value: nameValue, label: nameValue },
      ]);
    }
    setSelectedName(nameValue);
    handleCloseModal();
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      {/* Wave Background */}
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

      <div className="relative z-10 w-full max-w-md p-8 bg-white bg-opacity-90 rounded-lg shadow-xl mx-4 sm:mx-0">
        {/* Language Switcher */}
        <div className="absolute top-6 left-6 w-30">
          <DynamicSelector
            options={languageOptions}
            selectedValue={language}
            onChange={handleLanguageChange}
            label="Language"
          />
        </div>

        {/* Profile Placeholder */}
        <div className="absolute top-6 right-6">
          <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
            <span className="text-purple-500 text-lg">+</span>
          </div>
        </div>

        {/* Toggle Switcher */}
        <div className="flex justify-center items-center mt-20">
          <div className="flex items-center gap-6">
            <span className="text-black text-sm sm:text-base">
              Username / Password
            </span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="hidden"
                checked={isOtp}
                onChange={handleToggleOtp}
                aria-label="Toggle OTP"
              />
              <div
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                  !isOtp ? "bg-indigo-400" : "bg-purple-400"
                }`}
              >
                <span
                  className={`absolute w-6 h-6 bg-white rounded-full shadow-md top-0 left-0 transform transition-transform duration-300 ${
                    isOtp ? "translate-x-6" : "translate-x-0"
                  }`}
                ></span>
              </div>
            </label>
            <span className="text-black text-sm sm:text-base">OTP</span>
          </div>
        </div>

        {/* Form */}
        <form className="mt-12" onSubmit={handleFormSubmit}>
          {!isOtp ? (
            <>
              <DynamicInput
                name="Username"
                type="string"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                leftElement={<FaUser size={20} className="text-indigo-500" />}
                required
                className="mb-12"
              />
              <DynamicInput
                name="Password"
                type={showPassword ? "string" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftElement={<FaLock size={20} className="text-indigo-500" />}
                rightElement={
                  <button
                    type="button"
                    onClick={handleTogglePasswordVisibility}
                    className="text-indigo-500 hover:text-purple-500 transition-colors duration-300 focus:outline-none"
                  >
                    {showPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                }
                required
                className="mt-12"
              />
              <button
                type="submit"
                className="w-full mt-8 bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 text-sm sm:text-base"
              >
                Login
              </button>
            </>
          ) : (
            <>
              <DynamicInput
                name="Phone Number"
                type="number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                leftElement={<FaPhone size={20} className="text-indigo-500" />}
                required
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 mt-8 bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 text-sm sm:text-base"
              >
                Send Code
              </button>
            </>
          )}
        </form>
      </div>

      {modalOpen && (
        <DynamicModal
          onClose={handleCloseModal}
          onSelect={handleSelectFromModal}
          selectedRowData={selectedRowData}
          setSelectedRowData={setSelectedRowData}
          modalOpen={modalOpen}
        />
      )}
    </div>
  );
};

export default Login;
