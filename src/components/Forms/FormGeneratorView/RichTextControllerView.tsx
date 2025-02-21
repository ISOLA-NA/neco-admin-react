import React from "react";
import CustomTextarea from "../../utilities/DynamicTextArea";

interface RichTextControllerViewProps {}

const RichTextControllerView: React.FC<RichTextControllerViewProps> = () => {
  return (
    <div className="mt-10">
      <CustomTextarea
        name="RichTextView"
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
