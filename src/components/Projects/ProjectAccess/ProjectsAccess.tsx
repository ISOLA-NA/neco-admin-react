import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import LeftProjectAccess from "./Panel/LeftProjectAccess";
import RightProjectAccess from "./Panel/RightProjectAccess";
import { AccessProject } from "../../../services/api.services";

// تعریف اینترفیس متدهایی که از بیرون می‌خواهیم صدا بزنیم
export interface ProjectAccessHandle {
  save: () => Promise<void>;
  // ... هر متد دیگری که نیاز دارید
}

// پراپرتی‌هایی که این والد ممکن است بگیرد:
interface ProjectAccessProps {
  selectedProject?: any; // یا number | string ، بسته به نوع ID پروژه
}

const ProjectAccess = forwardRef<ProjectAccessHandle, ProjectAccessProps>(
  ({ selectedProject }, ref) => {
    const [selectedPostAccess, setSelectedPostAccess] =
      useState<AccessProject | null>(null);

    // برای مثال، اگر قرار است این والد داده‌ای لود کند یا هر کار دیگری.
    // ... می‌توانید از اینجا هم یک fetchData بنویسید

    // این متدها را بیرون در اختیار TabContent قرار می‌دهیم:
    useImperativeHandle(ref, () => ({
      async save() {
        // اینجا می‌توانید منطق ذخیره نهایی را بنویسید
        // مثلاً اگر قرار است با متد handleSaveProjectAccess از AddEditDeleteContext کار کنید
        // یا اگر می‌خواهید داده‌ی selectedPostAccess را در سرور آپدیت کنید
        console.log("ProjectAccess: save called.");
      },
      // ... متدهای دیگر
    }));

    // این تابع هنگامی فراخوانی می‌شود که کاربر در LeftProjectAccess
    // روی یک آیتم دابل کلیک کند و بخواهیم Right را نشان بدهیم
    const handleLeftDoubleClick = (data: AccessProject) => {
      setSelectedPostAccess(data);
    };

    return (
      <div className="flex h-full w-full gap-4">
        {/* نصف صفحه چپ */}
        <div className="w-1/2 bg-white rounded-lg shadow-lg">
          <LeftProjectAccess
            selectedRow={selectedProject}
            onDoubleClickSubItem={handleLeftDoubleClick}
          />
        </div>

        {/* نصف صفحه راست */}
        <div className="w-1/2 bg-white rounded-lg shadow-lg">
          {selectedPostAccess ? (
            <RightProjectAccess selectedRow={selectedPostAccess} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a post to view access settings
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default ProjectAccess;
