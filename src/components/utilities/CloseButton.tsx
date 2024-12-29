// CloseButton.tsx
import React from "react";

interface CloseButtonProps {
  closeToast?: () => void; // کتابخانه این را پاس می‌دهد
  // بقیه پراپ‌های دلخواه
}

const CloseButton: React.FC<CloseButtonProps> = ({ closeToast }) => {
  return (
    <button
      className="absolute top-1 left-1 text-white opacity-80 hover:opacity-100"
      onClick={closeToast} // از تابعی که کتابخانه پاس داده استفاده کنید
      type="button"
      aria-label="بستن توست"
    >
      ✕
    </button>
  );
};

export default CloseButton;
