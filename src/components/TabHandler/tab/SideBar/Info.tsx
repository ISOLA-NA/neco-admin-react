import React from 'react';
import { useTranslation } from "react-i18next";

const Info: React.FC = () => {
    const { t } = useTranslation();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white p-4 rounded-md shadow space-y-4">
          <h2 className="text-lg font-bold border-b pb-2">{t("info.Titles.Information")}</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-semibold">{t("info.Labels.LicensedTo")}</span>
              <div className="mt-2">
                <img
                  src="../images/Neco/bandaremam.jpg"
                  alt="PGPIC Logo"
                  className="h-64 w-64"
                />
              </div>
            </div>
            <div>
              <span className="font-semibold">{t("info.Labels.Address")}</span>
              <span className="ml-2"></span>
            </div>
            <div>
              <span className="font-semibold">{t("info.Labels.Website")}</span>
              <span className="ml-2"></span>
            </div>
          </div>
          <div className="pt-4">
            <h3 className="font-semibold text-md mb-2">{t("info.Titles.AboutProduct")}</h3>
            <h4 className="text-base font-bold mb-2">{t("info.Product.MainTitle")}</h4>
            <p className="text-sm leading-6 mb-4">
              {t("info.Product.Description")}
            </p>
            <div className="flex flex-col md:flex-row items-start gap-4">
              <img
                src="../images/Neco/nejabat.png"
                alt="Gh. Nejabat"
                className="w-36 h-40 object-cover rounded-md"
              />
              <div className="text-sm leading-6">
                <h5 className="font-bold mb-1">{t("info.Nejabat.Name")}</h5>
                <p>
                  {t("info.Nejabat.Description")}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-[35%] bg-white p-4 rounded-md shadow space-y-4">
          <h2 className="text-lg font-bold border-b pb-2">{t("info.Titles.ProductInformation")}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <img src="../images/Neco/logoNeco.jpg" alt="Neco Logo" className="w-16 h-16 object-contain" />
              <span className="font-semibold">{t("info.Company.Product")}</span>
            </div>
            <div className='text-center'>{t("info.Company.Name")}</div>
            <div className="text-center text-blue-600 hover:underline">{t("info.Company.Website")}</div>
            <hr className="my-2" />
            <div>
              <span className="font-semibold">{t("info.Labels.ProductTypeActivated")}</span>
            </div>
            <div>
              <span className="font-semibold">{t("info.Labels.ActivationDate")}</span>
              <span className="ml-2"></span>
            </div>
            <div>
              <span className="font-semibold">{t("info.Labels.LatestVersionInstalled")}</span>
              <span className="ml-2">01-02-17</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
