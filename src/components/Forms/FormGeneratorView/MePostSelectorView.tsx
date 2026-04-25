import React, { useEffect, useState } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";
import projectService from "../../../services/api.services";

interface MePostSelectorProps {
  data?: {
    DisplayName?: string;
    PersianName?: string;
  };
  isFaMode?: boolean;
}

const MePostSelector: React.FC<MePostSelectorProps> = ({
  data,
  isFaMode = false,
}) => {
  const [posts, setPosts] = useState<Array<{ ID: string; Name: string }>>([]);
  const [selectedValue, setSelectedValue] = useState("");

  const label = isFaMode
    ? data?.PersianName || data?.DisplayName || "انتخاب پست"
    : data?.DisplayName || data?.PersianName || "Select Post";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await projectService.postUser();
        console.log("Fetched posts:", response);
        if (Array.isArray(response)) {
          const validPosts = response.filter(
            (post: any) => post.Name && post.Name.trim() !== ""
          );
          setPosts(
            validPosts.map((post: any) => ({
              ID: post.ID,
              Name: post.Name,
            }))
          );
        } else {
          console.error("Response is not an array:", response);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  const postOptions = posts.map((post) => ({
    value: post.Name,
    label: post.Name,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(e.target.value);
    console.log("Selected Post Name:", e.target.value);
  };

  return (
    <div dir={isFaMode ? "rtl" : "ltr"}>
      <DynamicSelector
        name="posts"
        label={label}
        options={postOptions}
        selectedValue={selectedValue}
        onChange={handleChange}
      />
    </div>
  );
};

export default MePostSelector;
