// src/components/layout/TwoColumnLayout.tsx
import React from "react";

interface TwoColumnLayoutProps {
  children:
    | React.ReactElement<TwoColumnLayoutItemProps>
    | React.ReactElement<TwoColumnLayoutItemProps>[];
}

interface TwoColumnLayoutItemProps {
  span?: 1 | 2; // پیش‌فرض 1 است
  className?: string;
  children: React.ReactNode;
}

const TwoColumnLayout: React.FC<TwoColumnLayoutProps> & {
  Item: React.FC<TwoColumnLayoutItemProps>;
} = ({ children }) => {
  return (
    <div className="px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            const spanClass =
              child.props.span === 2 ? "md:col-span-2" : "md:col-span-1";
            const additionalClass = child.props.className
              ? child.props.className
              : "";
            return React.cloneElement(child, {
              className: `${spanClass} ${additionalClass}`,
            });
          }
          return null;
        })}
      </div>
    </div>
  );
};

const Item: React.FC<TwoColumnLayoutItemProps> = ({ children, ...rest }) => {
  return <div {...rest}>{children}</div>;
};

TwoColumnLayout.Item = Item;

export default TwoColumnLayout;
