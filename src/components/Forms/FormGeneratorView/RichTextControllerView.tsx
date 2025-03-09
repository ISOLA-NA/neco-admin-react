import React from "react";
import CustomTextarea from "../../utilities/DynamicTextArea";

interface RichTextControllerViewProps {
  data?: {
    DisplayName?: string;
  };
}

const RichTextControllerView: React.FC<RichTextControllerViewProps> = ({ data }) => {
  return (
    <div className="mt-10">
      <CustomTextarea
        name={data?.DisplayName || "RichTextView"}
        value=""
        placeholder=" "
        rows={3}
        disabled={true}
        className="w-full"
      />
    </div>
  );
};

export default RichTextControllerView;
