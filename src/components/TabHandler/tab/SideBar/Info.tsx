import React from 'react';

const Info: React.FC = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white p-4 rounded-md shadow space-y-4">
          <h2 className="text-lg font-bold border-b pb-2">Information</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-semibold">Licensed To :</span>
              <div className="mt-2">
                <img
                  src="../images/Neco/bandaremam.jpg"
                  alt="PGPIC Logo"
                  className="h-64 w-64"
                />
              </div>
            </div>
            <div>
              <span className="font-semibold">Address :</span>
              <span className="ml-2"></span>
            </div>
            <div>
              <span className="font-semibold">Website :</span>
              <span className="ml-2"></span>
            </div>
          </div>
          <div className="pt-4">
            <h3 className="font-semibold text-md mb-2">About Product</h3>
            <h4 className="text-base font-bold mb-2">Organization Project Management System</h4>
            <p className="text-sm leading-6 mb-4">
              This Collaborative platform is a Project Processes Management System
              which defines, executes and control all processes dynamically based on
              Rolling wave planning of project activities. This platform is
              methodology independent and can support any project management
              approaches such as conventional or agile ones.
            </p>
            <div className="flex flex-col md:flex-row items-start gap-4">
              <img
                src="../images/Neco/nejabat.png"
                alt="Gh. Nejabat"
                className="w-36 h-40 object-cover rounded-md"
              />
              <div className="text-sm leading-6">
                <h5 className="font-bold mb-1">Gh. Nejabat</h5>
                <p>
                  Gh. Nejabat Having been conferred a national award from the
                  president appreciation of his efforts to help reconstruct the
                  country in 1996 and also ranked 24 by ICIS in the Top Power Players
                  in global petrochemical industry in 2007, have positioned
                  Mr. Gholam Hossein Nejabat among the most honorable managers who
                  has played significant role in the development of the
                  petrochemical projects in the country. His thoughts and approaches
                  for successful management of projects are adopted in this product.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-[35%] bg-white p-4 rounded-md shadow space-y-4">
          <h2 className="text-lg font-bold border-b pb-2">Product Information:</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <img src="../images/Neco/logoNeco.jpg" alt="Neco Logo" className="w-16 h-16 object-contain" />
              <span className="font-semibold">Organizational Project Management System</span>
            </div>
            <div className='text-center'>Neco industries Management Co .</div>
            <div className="text-center text-blue-600 hover:underline">www.necopm.com</div>
            <hr className="my-2" />
            <div>
              <span className="font-semibold">ProductTypeActivated</span>
            </div>
            <div>
              <span className="font-semibold">Activation Date :</span>
              <span className="ml-2"></span>
            </div>
            <div>
              <span className="font-semibold">Latest Version Installed :</span>
              <span className="ml-2">01-02-17</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
