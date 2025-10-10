// src/components/Forms/FORMGENERATORVIEW/FieldDirection.tsx
import React from "react";

type Props = {
  rtl?: boolean;
  className?: string;
  children: React.ReactNode;
};

/**
 * فقط جهت همین بلاک رو RTL/LTR می‌کنه، روی بقیه‌ی UI اثری نداره.
 * unicodeBidi: "plaintext" برای متن‌های ترکیبی بهتره.
 */
const FieldDirection: React.FC<Props> = ({ rtl, className, children }) => {
  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className={`field-dir ${className || ""}`}
      style={{ unicodeBidi: "plaintext" }}
    >
      {children}
    </div>
  );
};

export default FieldDirection;
