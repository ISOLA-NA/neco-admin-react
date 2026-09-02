import React from "react";
import { useTranslation } from "react-i18next";
import { FaAward } from "react-icons/fa";

const Info: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      {/* =========================
          Information Title
      ========================== */}
      <h1 className="text-2xl font-bold text-gray-800 mb-8">
        {t("info.Titles.Information")}
      </h1>

      {/* =====================================================
          TOP INFORMATION SECTION
      ====================================================== */}
      <div className="w-full mb-10">
        <div className="w-full max-w-[1000px]">

          {/* =================================================
              ROW 1 - Titles
          ================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-16 mb-6">
            <h2 className="text-blue-500 font-semibold">
              {t("info.Labels.LicensedTo")}
            </h2>

            <h2 className="text-blue-500 font-semibold">
              {t("info.Titles.ProductInformation")}
            </h2>
          </div>

          {/* =================================================
              ROW 2 - Company / Product
          ================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-16">

            {/* LEFT */}
            <div className="flex items-start gap-4">
              <img
                src="/images/Neco/logoNeco.jpg"
                alt="Neco"
                className="w-11 h-11 object-contain flex-shrink-0"
              />

              <div className="pt-1">
                <p className="font-semibold text-gray-800">
                  {t("info.Company.Name")}
                </p>

                <p className="text-gray-500 text-sm mt-3">
                  Tehran-Iran
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-start gap-4">
              <img
                src="/images/Neco/logoNeco.jpg"
                alt="Product"
                className="w-11 h-11 object-contain flex-shrink-0"
              />

              <div className="min-w-0 pt-1">
                <p className="text-gray-800 leading-5">
                  {t("info.Company.Product")}
                </p>

                <p className="text-gray-700 text-sm mt-3">
                  {t("info.Company.Name")}
                </p>

                <a
                  href="https://www.necopm.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-600 underline text-sm mt-1"
                >
                  {t("info.Company.Website")}
                </a>
              </div>
            </div>
          </div>

          {/* =================================================
              LEFT compact information
              Tehran-Iran
              ProductTypeActivated
              Activation Date

              RIGHT:
              Latest Version هم‌تراز ProductTypeActivated
          ================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-16 mt-1">

            {/* LEFT */}
            <div className="pl-[60px]">
              {/* ProductTypeActivated */}
              <div>
                <p className="font-semibold text-gray-700 text-sm leading-5">
                  {t("info.Labels.ProductTypeActivated")}
                </p>
              </div>

              {/* Activation Date */}
              <div className="mt-1">
                <p className="font-semibold text-gray-700 text-sm leading-5">
                  {t("info.Labels.ActivationDate")}
                </p>

                <p className="text-gray-600 text-sm leading-5">
                  02/02/2025
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="pl-[60px]">
              <p className="font-semibold text-gray-700 text-sm leading-5">
                {t("info.Labels.LatestVersionInstalled")}
              </p>

              <p className="text-gray-600 text-sm leading-5">
                2026.07.27
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          ABOUT PRODUCT
      ====================================================== */}
      <div className="flex items-start gap-3">

        {/* About Product Icon */}
        <div className="flex flex-col items-center flex-shrink-0 w-14">
          <FaAward size={22} className="text-gray-800" />

          <span className="text-[10px] text-gray-500 text-center mt-1 leading-tight">
            {t("info.Titles.AboutProduct")}
          </span>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-600 mb-2">
            {t("info.Product.MainTitle")}
          </h3>

          {/* Product Description */}
          <div
            className="
              bg-blue-50
              rounded-md
              p-4
              mb-3
              text-sm
              leading-6
              text-gray-800
            "
          >
            {t("info.Product.Description")}
          </div>

          {/* Gh. Nejabat */}
          <div
            className="
              bg-blue-50
              rounded-md
              p-4
              flex
              flex-col
              md:flex-row
              gap-4
            "
          >
            <img
              src="/images/Neco/nejabat1.png"
              alt={t("info.Nejabat.Name") as string}
              className="
                w-full
                md:w-52
                h-40
                md:h-28
                object-cover
                object-top
                rounded-md
                flex-shrink-0
              "
            />

            <div className="text-sm leading-6 text-gray-800">
              <h5 className="font-bold mb-1">
                {t("info.Nejabat.Name")}
              </h5>

              <p>
                {t("info.Nejabat.Description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;