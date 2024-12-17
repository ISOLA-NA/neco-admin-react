import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaLock, FaPhone, FaEye, FaEyeSlash } from 'react-icons/fa'
import DynamicInput from '../utilities/DynamicInput'
import DynamicSelector from '../utilities/DynamicSelector'
import DynamicSwitcher from '../utilities/DynamicSwitcher'
import { showAlert } from '../utilities/Alert/DynamicAlert' // اطمینان از مسیر صحیح

interface LoginProps {
  onLogin: () => void
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isOtp, setIsOtp] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [language, setLanguage] = useState<string>('en')
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [languageError, setLanguageError] = useState<string>('')

  const navigate = useNavigate()

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'fa', label: 'فارسی' }
  ]

  const handleToggleOtp = () => {
    setIsOtp(!isOtp)
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value)
    if (e.target.value === '') {
      setLanguageError('لطفاً زبان را انتخاب کنید.')
    } else {
      setLanguageError('')
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (language === '') {
      setLanguageError('لطفاً زبان را انتخاب کنید.')
      return
    }

    if (!isOtp) {
      // لاگین با نام کاربری و پسورد
      if (username === 'hasanzade' && password === '123') {
        onLogin() // به روز رسانی وضعیت احراز هویت در App
        showAlert('success', null, 'موفقیت', 'شما با موفقیت وارد شدید.')
        navigate('/') // هدایت به صفحه اصلی
      } else {
        showAlert('error', null, 'خطا', 'نام کاربری یا پسورد اشتباه است.')
      }
    } else {
      // لاگین با OTP
      // منطق OTP را اینجا اضافه کنید
      console.log('OTP Login')
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

        {/* Profile Placeholder */}
        <div className='absolute top-6 right-6'>
          <div className='w-12 h-12 flex items-center justify-center'>
            <img
              src='./images/Neco/logoNeco.jpg'
              alt='Company Logo'
              className='rounded-lg shadow-lg border border-gray-200 bg-white  transition-transform transform hover:scale-105 hover:shadow-xl'
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
          {!isOtp ? (
            <>
              <DynamicInput
                name='Username'
                type='text'
                value={username}
                onChange={e => setUsername(e.target.value)}
                leftElement={<FaUser size={20} className='text-indigo-500' />}
                required
                className='mb-6'
              />
              <DynamicInput
                name='Password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                leftElement={<FaLock size={20} className='text-indigo-500' />}
                rightElement={
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
                className='mt-12'
              />
              <button
                type='submit'
                className='w-full mt-4 bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 text-sm sm:text-base'
              >
                Login
              </button>
            </>
          ) : (
            <>
              <DynamicInput
                name='Phone Number'
                type='number'
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                leftElement={<FaPhone size={20} className='text-indigo-500' />}
                required
                className='mb-6'
              />
              <button
                type='submit'
                className='w-full flex items-center justify-center gap-2 mt-4 bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300 text-sm sm:text-base'
              >
                Send Code
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

export default Login
