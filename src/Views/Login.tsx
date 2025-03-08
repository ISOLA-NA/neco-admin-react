// src/components/Autentications/Login.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaLock, FaPhone, FaEye, FaEyeSlash } from 'react-icons/fa'

import DynamicInput from '../components/utilities/DynamicInput'
import DynamicSelector from '../components/utilities/DynamicSelector'
import DynamicSwitcher from '../components/utilities/DynamicSwitcher'
import { showAlert } from '../components/utilities/Alert/DynamicAlert'

import AppServices, {
  WebLoginRequest,
  WebLoginResponse,
  SendOtpRequest,
  SendOtpResponse
} from '../services/api.services'

import Cookies from 'js-cookie'
import CryptoJS from 'crypto-js'

interface LoginProps {
  onLogin: () => void
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isOtp, setIsOtp] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  // زبان انتخابی کاربر
  const [language, setLanguage] = useState<string>('en')
  const [languageError, setLanguageError] = useState<string>('')

  // مقادیر ورودی‌ها
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [phoneNumber, setPhoneNumber] = useState<string>('')

  const [loading, setLoading] = useState<boolean>(false)

  const navigate = useNavigate()

  // گزینه‌های انتخاب زبان
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'fa', label: 'فارسی' }
  ]

  // توابع هندل کردن سوییچر و نمایش رمز عبور
  const handleToggleOtp = () => {
    setIsOtp(!isOtp)
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // تغییر زبان
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value)
    if (e.target.value === '') {
      setLanguageError('لطفاً زبان را انتخاب کنید.')
    } else {
      setLanguageError('')
    }
  }

  // تابع تولید seqKey برای امنیت بیشتر
  const generateSeqKey = (): string => {
    const weekDays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ]
    const d = new Date()
    const year = d.getUTCFullYear()
    const month = d.getUTCMonth() + 1
    const dayOfMonth = d.getUTCDate()
    const hour = d.getUTCHours()
    const dayOfWeek = d.getUTCDay()

    const myKey = `${year}-${month}-${dayOfMonth}-${hour}-${weekDays[dayOfWeek]}`
    return CryptoJS.SHA512(CryptoJS.enc.Utf8.parse(myKey)).toString(
      CryptoJS.enc.Hex
    )
  }

  // زمان پیش‌فرض (ساعتی) برای اعتبار توکن
  const defaultTokenHours = 8

  // رویداد سابمیت فرم
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // بررسی اینکه زبان انتخاب شده باشد
    if (language === '') {
      setLanguageError('لطفاً زبان را انتخاب کنید.')
      return
    }

    setLoading(true)

    try {
      // اگر حالت OTP خاموش است => لاگین با Username/Password
      if (!isOtp) {
        if (!username || !password) {
          showAlert(
            'error',
            null,
            'خطا',
            'لطفاً نام کاربری و پسورد را وارد کنید.'
          )
          return
        }

        const seqKey = generateSeqKey()
        const passwordHash = CryptoJS.SHA512(
          CryptoJS.enc.Utf8.parse(password)
        ).toString(CryptoJS.enc.Hex)

        const loginData: WebLoginRequest = {
          UserName: username,
          Password: passwordHash,
          SeqKey: seqKey
        }

        const response: WebLoginResponse = await AppServices.webLogin(loginData)

        // بررسی پاسخ API
        if (!response || !response.MyUser) {
          throw new Error('ساختار پاسخ API نامعتبر است یا MyUser وجود ندارد.')
        }

        const { MyUser } = response

        // ساخت توکن مثالی
        const token = `${MyUser.TTKK}:${MyUser.Username}`
        Cookies.set('token', token, { expires: defaultTokenHours / 24 })

        // ثبت userId در کوکی
        Cookies.set('userId', MyUser.ID.toString(), {
          expires: defaultTokenHours / 24
        })

        // بررسی نوع کاربر
        if (MyUser.userType === 6 || MyUser.userType === 8) {
          Cookies.set('authenticated', 'true', {
            expires: defaultTokenHours / 24
          })
          onLogin() // اطلاع به والد که کاربر لاگین کرده
          showAlert('success', null, 'موفقیت', 'شما با موفقیت وارد شدید.')
          navigate('/home')
        } else {
          showAlert('error', null, 'خطا', 'کاربر معمولی نمی‌تواند لاگین کند.')
        }
      } else {
        // حالت OTP
        if (!phoneNumber) {
          showAlert('error', null, 'خطا', 'لطفاً شماره تلفن را وارد کنید.')
          return
        }

        const seqKey = generateSeqKey()

        const otpData: SendOtpRequest = {
          UserName: phoneNumber,
          Password: '',
          SeqKey: seqKey
        }

        // درخواست ارسال کد OTP
        const response: SendOtpResponse = await AppServices.sendOtp(otpData)
        console.log('OTP Response:', response)
        if (response.success) {
          showAlert('success', null, 'موفقیت', 'کد OTP ارسال شد.')
          // اینجا می‌توانید منطق لازم برای تایید کد OTP را پیاده کنید
        } else {
          showAlert(
            'error',
            null,
            'خطا',
            response.message || 'ارسال OTP ناموفق بود.'
          )
        }
      }
    } catch (error: any) {
      console.error('Login/OTP Error:', error)
      const message =
        error.response?.data?.message ||
        error.message ||
        'خطایی در فرآیند لاگین رخ داده است.'
      showAlert('error', null, 'خطا', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'>
      {/* Wave Background */}
      <svg
        className='absolute inset-0 w-full h-full'
        xmlns='http://www.w3.org/2000/svg'
        preserveAspectRatio='none'
        viewBox='0 0 1440 320'
      >
        <path
          fill='rgba(255, 255, 255, 0.3)'
          d='M0,224L48,213.3C96,203,192,181,288,170.7C384,160,480,160,576,165.3C672,171,768,181,864,192C960,203,1056,213,1152,202.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'
        ></path>
      </svg>

      <div className='relative z-10 w-full max-w-md p-8 bg-white bg-opacity-90 rounded-lg shadow-xl mx-4 sm:mx-0'>
        {/* Language Switcher */}
        <div className='absolute top-6'>
          <DynamicSelector
            options={languageOptions}
            selectedValue={language}
            onChange={handleLanguageChange}
            label=''
            error={!!languageError}
            errorMessage={languageError}
          />
        </div>

        {/* Logo */}
        <div className='absolute top-6 right-6'>
          <div className='w-12 h-12 flex items-center justify-center'>
            <img
              src='./images/Neco/logoNeco.jpg'
              alt='Company Logo'
              className='rounded-lg shadow-lg border border-gray-200 bg-white transition-transform transform hover:scale-105 hover:shadow-xl'
            />
          </div>
        </div>

        {/* Toggle Switcher */}
        <div className='flex justify-center items-center mt-20'>
          <DynamicSwitcher
            isChecked={isOtp}
            onChange={handleToggleOtp}
            leftLabel='Username / Password'
            rightLabel='OTP'
          />
        </div>

        {/* Form */}
        <form className='mt-12' onSubmit={handleFormSubmit}>
          {/* اگر isOtp غیرفعال است => لاگین با نام کاربری و پسورد */}
          {!isOtp ? (
            <>
              {/* فاصله‌ی بین یوزرنیم و پسورد را نصف مقدار قبلی کردیم */}
              <DynamicInput
                name='Username'
                type='text'
                value={username}
                onChange={e => setUsername(e.target.value)}
                leftIcon={<FaUser size={20} className='text-indigo-500' />}
                required
                // حذف mb-6 (فاصله اضافی قبل)
                // اینپوت یوزرنیم بدون margin-bottom
              />

              <DynamicInput
                name='Password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                leftIcon={<FaLock size={20} className='text-indigo-500' />}
                rightIcon={
                  <button
                    type='button'
                    onClick={handleTogglePasswordVisibility}
                    className='text-indigo-500 hover:text-purple-500 transition-colors duration-300 focus:outline-none'
                  >
                    {showPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                }
                required
                className='mt-9'
              />

              {/* فاصله دکمه از اینپوت پسورد نیز برابر فاصله جدید (۹) */}
              <button
                type='submit'
                className={`w-full mt-9 bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 text-sm sm:text-base flex items-center justify-center ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? (
                  <svg
                    className='animate-spin h-5 w-5 mr-3 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8v8H4z'
                    ></path>
                  </svg>
                ) : null}
                ورود
              </button>
            </>
          ) : (
            <>
              {/* در حالت OTP فقط شماره تلفن را می‌گیریم */}
              <DynamicInput
                name='PhoneNumber'
                type='number'
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                leftIcon={<FaPhone size={20} className='text-indigo-500' />}
                required
                // فاصله در حالت OTP هم به همان شکل کاهش دهیم
                className='mt-9'
              />

              <button
                type='submit'
                className={`w-full flex items-center justify-center gap-2 mt-9 bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 text-sm sm:text-base ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? (
                  <svg
                    className='animate-spin h-5 w-5 mr-3 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8v8H4z'
                    ></path>
                  </svg>
                ) : null}
                ارسال کد
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

export default Login
