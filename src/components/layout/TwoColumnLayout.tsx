// src/components/layout/TwoColumnLayout.tsx

import React from "react";

interface TwoColumnLayoutProps {
  children: React.ReactNode;
}

const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({ children }) => {
  return (
    <div className="px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{children}</div>
    </div>
  );
};

export default TwoColumnLayout;
