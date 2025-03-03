import React, { useState } from 'react';
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineArrowRight
} from 'react-icons/ai';

const LoginCard = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className='relative bg-white rounded-2xl shadow-lg p-10 w-[450px] border-4 border-[#17375e]'>
      {/* Top Left Text */}
      <div className='absolute -top-20 left-1'>
        <h1 className='text-[#213f63] text-4xl font-bold'>Log In</h1>
        <p className='text-[#7f9abb] text-2xl'>Welcome Back!</p>
      </div>

      <div className='mt-10 mb-4'>
        <label className='text-gray-400 font-semibold text-sm'>USERNAME</label>
        <input
          type='text'
          value='Stefanie.sh@gmail.com'
          className='w-full border-b-2 border-gray-300 focus:outline-none focus:border-gray-500 p-2 text-gray-500'
          readOnly
        />
      </div>
      <div className='mb-6 relative'>
        <label className='text-gray-400 font-semibold text-sm'>PASSWORD</label>
        <div className='flex items-center border-b-2 border-gray-300 focus-within:border-gray-500'>
          <input
            type={showPassword ? 'text' : 'password'}
            value={showPassword ? 'mypassword' : '********'}
            className='w-full focus:outline-none p-2 text-gray-500'
            readOnly
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className='absolute right-2 text-gray-600'
          >
            {showPassword ? (
              <AiOutlineEyeInvisible size={24} />
            ) : (
              <AiOutlineEye size={24} />
            )}
          </button>
        </div>
      </div>
      <div className='flex justify-center'>
        <button className='bg-[#17375e] hover:bg-blue-700 text-white rounded-lg px-10 py-2 flex items-center justify-center'>
          <AiOutlineArrowRight size={32} className='text-[#fdd964]' />
        </button>
      </div>
      <div className="absolute bottom-5 right-5">
          <img 
            src='/images/Neco/logoNeco.jpg' 
            alt='Update Preview' 
            className='w-20 h-15'
          />
        </div>
    </div>
  );
};

export default LoginCard;
