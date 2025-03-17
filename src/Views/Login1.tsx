import Login2 from "./Login2";

const UpdateCard = () => {
  return (
    <>
      <div className='flex min-h-screen bg-white relative'>
        {/* Sidebar */}
        <div className='w-3/6 bg-[#f2f2f2] min-h-screen'></div>

        {/* Main Content */}
        <div className='flex justify-center items-center w-full'>
          <div className='bg-[#ffe16e] rounded-2xl shadow-lg p-6 w-96 h-[48rem] flex flex-col justify-center ml-[15rem]'>
            <h2 className='text-gray-800 font-bold text-lg mb-8 text-center'>
              Updates of version 2.09
            </h2>
            <ul className='text-gray-700 space-y-6 list-disc pl-5'>
              <li className='flex flex-wrap items-start gap-1'>
                <strong>New Features:</strong>
                <span>Highlights of the new version.</span>
              </li>
              <li className='flex flex-wrap items-start gap-1'>
                <strong>Bug Fixes:</strong>
                <span>Corrections of previous errors or issues.</span>
              </li>
              <li className='flex flex-wrap items-start gap-1'>
                <strong>Performance Improvements:</strong>
                <span>
                  Enhancements to make the software run more efficiently.
                </span>
              </li>
              <li className='flex flex-wrap items-start gap-1'>
                <strong>User Interface Updates:</strong>
                <span>
                  Changes to the design and layout for better usability.
                </span>
              </li>
              <li className='flex flex-wrap items-start gap-1'>
                <strong>Security Enhancements:</strong>
                <span>
                  Upgrades to ensure better protection against threats.
                </span>
              </li>
              <li className='flex flex-wrap items-start gap-1'>
                <strong>Compatibility:</strong>
                <span>
                  Information about compatibility with different devices or
                  software.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Image Centered in the Page */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <img
            src='/images/Neco/bandaremam.jpg'
            alt='Update Preview'
            className='w-80 h-80 object-cover rounded-lg'
          />
        </div>

        {/* Login2 Component */}
        <div className="absolute bottom-[5rem] left-[35rem]">
          <Login2 />
        </div>
      </div>
    </>
  );
};

export default UpdateCard;