import { useMemo, useRef, useState } from "react";
import JoditEditor from "jodit-react";
import HTMLReactParser from "html-react-parser";

function RichTextController(){
  const editor = useRef(null)
  const [content, setContent] = useState('')
  return (
    <div>
      <JoditEditor 
        // ref={editor}
        value={content}
        onChange={(newContent) => {}}
      />
      <div>
        {HTMLReactParser(content)}
      </div>
    </div>
  );
}

export default RichTextController;
// CSS لازم برای Jodit (مسیرِ es2021 مطابق د