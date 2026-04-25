import React from "react";
import { useTranslation } from "react-i18next";

const Info: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto py-3 px-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* ستون چپ: اطلاعات محصول */}
        <div className="flex-1 bg-white p-4 rounded-md shadow space-y-3">
          <h2 className="text-lg font-bold border-b pb-2">
            {t("info.Titles.Information")}
          </h2>

          <div className="space-y-3 text-sm">
            <div>
              <h3 className="font-semibold text-md mb-1">
                {t("info.Titles.AboutProduct")}
              </h3>
              <h4 className="text-base font-bold mb-1">
                {t("info.Product.MainTitle")}
              </h4>
              <p className="text-sm leading-6 mb-3">
                {t("info.Product.Description")}
              </p>

              {/* بخش نجابت با عکس در کنار متن */}
              <div className="flex flex-col md:flex-row items-start gap-4">
                <img
                  src="../images/Neco/nejabat.png"
                  alt="Gh. Nejabat"
                  className="w-36 h-40 object-cover rounded-md flex-shrink-0"
                />
                <div className="text-sm leading-6">
                  <h5 className="font-bold mb-1">{t("info.Nejabat.Name")}</h5>
                  <p>{t("info.Nejabat.Description")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ستون راست: اطلاعات شرکت */}
        <div className="w-full md:w-[35%] bg-white p-4 rounded-md shadow space-y-3">
          <h2 className="text-lg font-bold border-b pb-2">
            {t("info.Titles.ProductInformation")}
          </h2>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{t("info.Company.Product")}</span>
            </div>

            {/* نام شرکت */}
            <div className="text-center font-semibold">مدیریت صنعت نکو</div>

            {/* وب‌سایت شرکت نکو */}
            <div className="text-center text-blue-600 hover:underline">
              www.necoware.com
            </div>

            <hr className="my-2" />

            {/* نوع محصول */}
            {/* <div>
              <span className="font-semibold">
                {t("info.Labels.ProductTypeActivated")}
              </span>
            </div> */}

            {/* تاریخ فعال‌سازی */}
            <div>
              <span className="font-semibold">
                {t("info.Labels.ActivationDate")}
              </span>
              <p>02/02/2025</p>
            </div>

            {/* آخرین نسخه نصب شده */}
            <div>
              <span className="font-semibold">
                {t("info.Labels.LatestVersionInstalled")}
              </span>
              <p>2026.04.20</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
