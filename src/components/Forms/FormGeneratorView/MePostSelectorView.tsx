import React, { useEffect, useState } from "react";
import DynamicSelector from "../../utilities/DynamicSelector"; // مسیر صحیح ایمپورت را مطابق پروژه تنظیم کنید
import projectService from "../../../services/api.services"; // مسیر صحیح را تنظیم کنید

interface MePostSelectorProps {
  data?: {
    DisplayName?: string;
  };
}

const MePostSelector: React.FC<MePostSelectorProps> = ({ data }) => {
  // state برای ذخیره آرایه پست‌ها (فقط ID و Name)
  const [posts, setPosts] = useState<Array<{ ID: string; Name: string }>>([]);
  // state برای نگهداری مقدار انتخاب‌شده از سلکتور
  const [selectedValue, setSelectedValue] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // فراخوانی متد postUser از projectService
        const response = await projectService.postUser();
        console.log("Fetched posts:", response);
        if (Array.isArray(response)) {
          // فقط پست‌هایی که Name معتبر دارند انتخاب می‌شوند
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

  // تبدیل پست‌ها به فرمت گزینه‌های مورد نیاز DynamicSelector
  const postOptions = posts.map((post) => ({
    value: post.Name,
    label: post.Name,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(e.target.value);
    console.log("Selected Post Name:", e.target.value);
  };

  return (
    <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg">
      <DynamicSelector
        name="posts"
        label={data?.DisplayName ? data.DisplayName : "Select Post"}
        options={postOptions}
        selectedValue={selectedValue}
        onChange={handleChange}
      />
    </div>
  );
};

export default MePostSelector;
