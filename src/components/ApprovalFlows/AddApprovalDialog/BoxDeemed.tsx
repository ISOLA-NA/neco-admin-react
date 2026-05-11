import React, { useState, useEffect } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";
import DynamicInput from "../../utilities/DynamicInput";
import AppServices, { GetEnumResponse } from "../../../services/api.services";
import { useApi } from "../../../context/ApiContext";
import { useTranslation } from "react-i18next";

interface DeemedSectionProps {
  deemDay: number;
  setDeemDay: (val: number) => void;
  deemCondition: number;
  setDeemCondition: (val: number) => void;
  deemAction: number;
  setDeemAction: (val: number) => void;
  previewsStateId: number | null;
  setPreviewsStateId: (val: number | null) => void;
  goToPreviousStateID: number | null;
  setGoToPreviousStateID: (val: number | null) => void;
  boxTemplates: { ID: number; Name: string }[];
  disableMain?: boolean;
  showAdminSection?: boolean;
  actionBtnID: number | null;
  setActionBtnID: (val: number | null) => void;
}

const DeemedSection: React.FC<DeemedSectionProps> = ({
  deemDay,
  setDeemDay,
  deemCondition,
  setDeemCondition,
  deemAction,
  setDeemAction,
  previewsStateId,
  setPreviewsStateId,
  goToPreviousStateID,
  setGoToPreviousStateID,
  boxTemplates,
  disableMain = false,
  showAdminSection = true,
  actionBtnID,
  setActionBtnID,
}) => {
   const { t, i18n } = useTranslation(); // ← i18n اضافه شد
   // ── تشخیص حالت فارسی از زبان جاری ──
  const isFaMode = i18n.language === "fa";

  const toPersian = (val: string | number): string => {
  if (i18n.language !== "fa") return String(val ?? "");
  return String(val ?? "").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
};

const fromPersian = (val: string): string =>
  val.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));

  const api = useApi();

  const [fromOptions, setFromOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [statusOptions, setStatusOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [loadingEnums, setLoadingEnums] = useState<boolean>(false);
  const [errorEnums, setErrorEnums] = useState<string | null>(null);
  const [localActionBtnOptions, setLocalActionBtnOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const fetchEnums = async () => {
      setLoadingEnums(true);
      setErrorEnums(null);

      try {
        const response1: GetEnumResponse = await AppServices.getEnum({
          str: "DeemCondition",
        });
        const fromOpts = Object.entries(response1).map(([key, val]) => ({
          value: String(val),
          label: key,
        }));
        setFromOptions(fromOpts);
      } catch (error) {
        console.error("Error fetching DeemCondition enums:", error);
        setErrorEnums(t("AddApprovalFlows.ErrFetchingDeemCondition"));
      }

      try {
        const response2: GetEnumResponse = await AppServices.getEnum({
          str: "DeemAction",
        });
        const statusOpts = Object.entries(response2).map(([key, val]) => ({
          value: String(val),
          label: key,
        }));
        setStatusOptions(statusOpts);
      } catch (error) {
        console.error("Error fetching DeemAction enums:", error);
        setErrorEnums(t("AddApprovalFlows.ErrFetchingDeemAction"));
      } finally {
        setLoadingEnums(false);
      }
    };

    fetchEnums();
  }, [t]);

  useEffect(() => {
    const fetchActionBtnOptions = async () => {
      try {
        const res = await api.getAllAfbtn();
        const opts = res.map((btn: any) => ({
          value: String(btn.ID),
          label: btn.Name,
        }));
        setLocalActionBtnOptions(opts);
      } catch (error) {
        console.error("Error fetching action button options:", error);
      }
    };

    fetchActionBtnOptions();
  }, [api]);

  const previousStateOptions = boxTemplates.map((box) => ({
    value: String(box.ID),
    label: box.Name,
  }));

  return (
  <div className="mt-4">
    <div className="bg-gray-200 p-4 rounded mb-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

        {/* ── After (deemDay) ── */}
        <div className="md:col-span-2">
          <DynamicInput
            name={t("AddApprovalFlows.After")}
            type={isFaMode ? "text" : "number"}
            value={
              deemDay === 0
                ? ""
                : toPersian(deemDay)
            }
            onChange={(e) => {
              const raw = fromPersian(e.target.value);
              setDeemDay(raw ? Number(raw) : 0);
            }}
            disabled={disableMain}
          />
        </div>

        {/* ── Condition ── */}
        <div className="md:col-span-4">
          <DynamicSelector
            options={[
              {
                value: "",
                label: t("AddApprovalFlows.SelectCondition"),
              },
              ...fromOptions,
            ]}
            selectedValue={deemCondition ? String(deemCondition) : ""}
            onChange={(e) =>
              setDeemCondition(e.target.value ? Number(e.target.value) : 0)
            }
            label={t("AddApprovalFlows.Condition")}
            disabled={disableMain}
          />
        </div>

        {/* ── TheStatusWillSetTo ── */}
        <div className="md:col-span-6">
          <DynamicSelector
            options={[
              {
                value: "",
                label: t("AddApprovalFlows.SelectStatus"),
              },
              ...statusOptions,
            ]}
            selectedValue={deemAction ? String(deemAction) : ""}
            onChange={(e) =>
              setDeemAction(e.target.value ? Number(e.target.value) : 0)
            }
            label={t("AddApprovalFlows.TheStatusWillSetTo")}
            disabled={disableMain}
          />
        </div>

        {/* ── PreviousState ── */}
        <div className="md:col-span-4">
          <DynamicSelector
            options={[
              {
                value: "",
                label: t("AddApprovalFlows.SelectPreviousState"),
              },
              ...previousStateOptions,
            ]}
            selectedValue={previewsStateId ? String(previewsStateId) : ""}
            onChange={(e) =>
              setPreviewsStateId(
                e.target.value ? Number(e.target.value) : null
              )
            }
            label={t("AddApprovalFlows.PreviousState")}
            disabled={disableMain}
          />
        </div>

        {/* ── ActionButton ── */}
        {showAdminSection && (
          <div className="md:col-span-4">
            <DynamicSelector
              options={[
                {
                  value: "",
                  label: t("AddApprovalFlows.SelectActionButtonPlaceholder"),
                },
                ...localActionBtnOptions,
              ]}
              selectedValue={actionBtnID ? String(actionBtnID) : ""}
              onChange={(e) =>
                setActionBtnID(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              label={t("AddApprovalFlows.SelectActionButton")}
              disabled={disableMain}
            />
          </div>
        )}
      </div>

      {loadingEnums && (
        <p className="text-xs text-gray-600 mt-2">
          {t("AddApprovalFlows.LoadingEnums")}
        </p>
      )}

      {errorEnums && (
        <p className="text-xs text-red-600 mt-2">{errorEnums}</p>
      )}
    </div>

    {/* ── GoToPreviousStateID ── */}
    <div className="bg-gray-100 p-2 rounded">
      <p className="text-sm text-gray-700 mb-2">
        {t("AddApprovalFlows.IfUserClicksAdmin")}
      </p>

      <DynamicSelector
        options={[
          {
            value: "",
            label: t("AddApprovalFlows.SelectPreviousState"),
          },
          ...previousStateOptions,
        ]}
        selectedValue={
          goToPreviousStateID ? String(goToPreviousStateID) : ""
        }
        onChange={(e) =>
          setGoToPreviousStateID(
            e.target.value ? Number(e.target.value) : null
          )
        }
        label=""
        className="w-40"
      />
    </div>
  </div>
);
};

export default DeemedSection;