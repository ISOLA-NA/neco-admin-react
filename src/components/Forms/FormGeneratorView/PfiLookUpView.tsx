// src/components/PfiLookupView.tsx
import React, { useState } from 'react'
import DynamicInput from '../../utilities/DynamicInput'
import { FaTrash, FaEye } from 'react-icons/fa'

interface PfiLookupViewProps {
  data?: {
    DisplayName?: string
  }
}

const PfiLookupView: React.FC<PfiLookupViewProps> = ({ data }) => {
  const [displayName, setDisplayName] = useState<string>(
    data?.DisplayName || ''
  )

  const handleReset = () => {
    setDisplayName('')
  }

  return (
    <div className='flex flex-col items-center w-full mt-10'>
      {/* ردیف بالا: دکمه Reset، ورودی نمایش DisplayName و دکمه View */}
      <div className='flex items-center gap-2 w-full'>
        {displayName && (
          <button
            type='button'
            onClick={handleReset}
            title='Reset display name'
            className='bg-red-500 text-white p-1 rounded hover:bg-red-700 transition duration-300'
          >
            <FaTrash size={16} />
          </button>
        )}
        <DynamicInput
          name={displayName}
          type='text'
          placeholder='No display name'
          disabled
          className='flex-grow -mt-6'
        />
        <button
          type='button'
          className='flex items-center px-2 py-1 bg-purple-500 text-white font-semibold rounded transition duration-300 cursor-not-allowed'
          disabled
        >
          <FaEye size={16} className='mr-1' />
          View
        </button>
      </div>
    </div>
  )
}

export default PfiLookupView
