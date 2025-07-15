// src/components/ControllerForms/SelectUserInPost.tsx
import React, { useState, useEffect } from "react";
import { useApi } from "../../../context/ApiContext";
import { PostType } from "../../../services/api.services";

interface SelectUserInPostProps {
  onMetaChange: (meta: { metaType1: string }) => void;
  data?: { metaType1?: string };
  isDisable?: boolean;
}

const SelectUserInPost: React.FC<SelectUserInPostProps> = ({
  onMetaChange,
  data,
  isDisable = false,
}) => {
  const { getAllPostTypes } = useApi();

  /* ---------------- state ---------------- */
  const [postTypes, setPostTypes] = useState<PostType[]>([]);
  const [selectedPostTypeId, setSelectedPostTypeId] = useState<string>(
    data?.metaType1 || ""
  );

  /* -------- fetch post types (only once) -------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllPostTypes();
        setPostTypes(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Error fetching post types:", err);
      }
    })();
  }, []); // ← خالی: فقط یک بار

  /* -------- sync external data (edit mode) -------- */
  useEffect(() => {
    const next = data?.metaType1 ? String(data.metaType1) : "";
    setSelectedPostTypeId((prev) => (prev === next ? prev : next));
  }, [data?.metaType1]);

  /* -------- notify parent when value changes -------- */
  useEffect(() => {
    onMetaChange({ metaType1: selectedPostTypeId });
    // عمداً onMetaChange را در وابستگی نمی‌گذاریم
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPostTypeId]);

  /* -------- handlers -------- */
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedPostTypeId(e.target.value);

  /* -------- UI -------- */
  return (
    <div className="my-4">
      <label className="block font-medium mb-2">Select Post Type</label>
      <select
        value={selectedPostTypeId}
        onChange={handleChange}
        disabled={isDisable}
        className="w-full p-2 border rounded focus:outline-none focus:border-gray-700"
      >
        <option value="">-- Select a post type --</option>
        {postTypes.map((pt) => (
          <option key={pt.ID} value={pt.ID}>
            {pt.Name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectUserInPost;
