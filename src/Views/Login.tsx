// src/components/Autentications/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaPhone, FaEye, FaEyeSlash } from "react-icons/fa";

import DynamicInput from "../components/utilities/DynamicInput";
import DynamicSelector from "../components/utilities/DynamicSelector";
import DynamicSwitcher from "../components/utilities/DynamicSwitcher";
import { showAlert } from "../components/utilities/Alert/DynamicAlert";

import AppServices, {
  WebLoginRequest,
  WebLoginResponse,
  SendOtpRequest,
  SendOtpResponse,
} from "../services/api.services";

import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import { useTranslation } from "react-i18next";

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t, i18n } = useTranslation();
  const [isOtp, setIsOtp] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const isRtl = i18n.dir(i18n.language) === "rtl";

  const navigate = useNavigate();

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "fa", label: "فارسی" },
  ];

  const handleLanguageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const lng = e.target.value;
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng); // حفظ انتخاب کاربر
  };

  const handleToggleOtp = () => setIsOtp(!isOtp);
  const handleTogglePasswordVisibility = () => setShowPassword(!showPassword);

  const generateSeqKey = (): string => {
    const weekDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const d = new Date();
    const seq = `${d.getUTCFullYear()}-${
      d.getUTCMonth() + 1
    }-${d.getUTCDate()}-${d.getUTCHours()}-${weekDays[d.getUTCDay()]}`;
    return CryptoJS.SHA512(CryptoJS.enc.Utf8.parse(seq)).toString(
      CryptoJS.enc.Hex
    );
  };

  const defaultTokenHours = 8;

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isOtp) {
        if (!username || !password) {
          showAlert(
            "error",
            null,
            t("alert.errorTitle"),
            t("alert.enterCredentials")
          );
          return;
        }

        const loginData: WebLoginRequest = {
          UserName: username,
          Password: CryptoJS.SHA512(CryptoJS.enc.Utf8.parse(password)).toString(
            CryptoJS.enc.Hex
          ),
          SeqKey: generateSeqKey(),
        };

        const response: WebLoginResponse = await AppServices.webLogin(
          loginData
        );

        if (!response || !response.MyUser) {
          throw new Error(t("alert.invalidApiResponse"));
        }

        const { MyUser } = response;
        Cookies.set("token", `${MyUser.TTKK}:${MyUser.Username}`, {
          expires: defaultTokenHours / 24,
        });
        Cookies.set("userId", MyUser.ID.toString(), {
          expires: defaultTokenHours / 24,
        });

        if (MyUser.userType === 6 || MyUser.userType === 8) {
          Cookies.set("authenticated", "true", {
            expires: defaultTokenHours / 24,
          });
          onLogin();
          showAlert(
            "success",
            null,
            t("alert.successTitle"),
            t("alert.loginSuccess")
          );
          navigate("/");
        } else {
          showAlert(
            "error",
            null,
            t("alert.errorTitle"),
            t("alert.userCannotLogin")
          );
        }
      } else {
        if (!phoneNumber) {
          showAlert(
            "error",
            null,
            t("alert.errorTitle"),
            t("alert.enterPhone")
          );
          return;
        }

        const otpData: SendOtpRequest = {
          UserName: phoneNumber,
          Password: "",
          SeqKey: generateSeqKey(),
        };

        const response: SendOtpResponse = await AppServices.sendOtp(otpData);
        if (response.success) {
          showAlert(
            "success",
            null,
            t("alert.successTitle"),
            t("alert.otpSent")
          );
        } else {
          showAlert(
            "error",
            null,
            t("alert.errorTitle"),
            response.message || t("alert.otpFailed")
          );
        }
      }
    } catch (error: any) {
      const message =
        typeof error?.response?.data === "string"
          ? error.response.data
          : error?.response?.data?.value?.message ||
            error?.response?.data?.message ||
            error.message ||
            t("alert.genericError");
      showAlert("error", null, t("alert.errorTitle"), message);
    } finally {
      setLoading(false);
    }
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
        <div className="absolute top-6">
          <DynamicSelector
            options={languageOptions}
            selectedValue={i18n.language}
            onChange={handleLanguageChange}
            label=""
          />
        </div>

        {/* Logo */}
        <div className={`absolute top-6 ${isRtl ? "left-6" : "right-6"}`}>
          <div className="w-12 h-12 flex items-center justify-center">
            <img
              src="./images/Neco/logoNeco.jpg"
              alt={t("logoAlt")}
              className="rounded-lg shadow-lg border border-gray-200 bg-white transition-transform transform hover:scale-105 hover:shadow-xl"
            />
          </div>
        </div>
        <div>
          <span>ورژن 1</span>
        </div>
        {/* Toggle Switcher */}
        <div className="flex justify-center items-center mt-20">
          <DynamicSwitcher
            isChecked={isOtp}
            onChange={handleToggleOtp}
            leftLabel={t("switch.usernamePassword")}
            rightLabel={t("switch.otp")}
          />
        </div>

        {/* Form */}
        <form className="mt-12" onSubmit={handleFormSubmit}>
          {!isOtp ? (
            <>
              <DynamicInput
                name={t("labelInput.username")}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                leftIcon={<FaUser size={20} className="text-indigo-500" />}
                required
              />

              <DynamicInput
                name={t("labelInput.password")}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<FaLock size={20} className="text-indigo-500" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={handleTogglePasswordVisibility}
                    className="text-indigo-500 hover:text-purple-500 transition-colors duration-300 focus:outline-none pointer-events-auto"
                  >
                    {showPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                }
                required
                className="mt-9"
              />

              <button
                type="submit"
                className={`w-full mt-9 bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 text-sm sm:text-base flex items-center justify-center ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading && (
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                )}
                {t("button.login")}
              </button>
            </>
          ) : (
            <>
              <DynamicInput
                name={t("labelInput.phoneNumber")}
                type="number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                leftIcon={<FaPhone size={20} className="text-indigo-500" />}
                required
                className="mt-9"
              />

              <button
                type="submit"
                className={`w-full flex items-center justify-center gap-2 mt-9 bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 text-sm sm:text-base ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading && (
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                )}
                {t("button.sendOtp")}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
