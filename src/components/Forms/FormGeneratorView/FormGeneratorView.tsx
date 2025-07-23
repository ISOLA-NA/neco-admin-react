// src/components/FormGeneratorView.tsx
import React, {
  Suspense,
  useState,
  useRef,
  useEffect,
  MouseEvent as ReactMouseEvent,
} from "react";
import { EntityField } from "../../../services/api.services";
import { FiMaximize, FiMinimize } from "react-icons/fi";

// ---------------- Lazy imports ----------------
const CtrTextBoxView = React.lazy(() => import("./CtrTextBoxView"));
const RichTextControllerView = React.lazy(() => import("./RichTextControllerView"));
const ChoiceControllerView = React.lazy(() => import("./ChoiceControllerView"));
const NumberControllerView = React.lazy(() => import("./NumberControllerView"));
const DateTimeSelectorView = React.lazy(() => import("./DateTimeSelectorView"));
const PersianCalendarPickerView = React.lazy(() => import("./PersianCalendarPickerView"));
const LookUpFormsView = React.lazy(() => import("./LookUpFormsView"));
const LookUpRealValueView = React.lazy(() => import("./LookUpRealValueView"));
const LookUpAdvanceTableView = React.lazy(() => import("./LookUpAdvanceTableView"));
const LookUpImageView = React.lazy(() => import("./LookUpImageView"));
const AdvanceLookupAdvanceTableView = React.lazy(() => import("./AdvanceLookupAdvanceTableView"));
const HyperLinkView = React.lazy(() => import("./HyperLinkView"));
const YesNoView = React.lazy(() => import("./YesNoView"));
const SelectUserInPostView = React.lazy(() => import("./SelectUserInPostView"));
const AttachFileView = React.lazy(() => import("./AttachFileView"));
const PictureBoxView = React.lazy(() => import("./PictureBoxView"));
const PostPickerListView = React.lazy(() => import("./PostPickerListView"));
const TableControllerView = React.lazy(() => import("./TableControllerView"));
const PfiLookUpView = React.lazy(() => import("./PfiLookUpView"));
const SeqenialNumberView = React.lazy(() => import("./SeqenialNumberView"));
const AdvanceTableControllerView = React.lazy(() => import("./AdvanceTableControllerView"));
const WordPanelView = React.lazy(() => import("./WordPanelView"));
const ExcellPanelView = React.lazy(() => import("./ExcellPanelView"));
const CalculatedFieldView = React.lazy(() => import("./CalculatedFieldView"));
const ExcellCalculatorView = React.lazy(() => import("./ExcellCalculatorView"));
const TabView = React.lazy(() => import("./TabView"));
const MapView = React.lazy(() => import("./MapView"));
const TitleView = React.lazy(() => import("./TitleView"));
const SectionView = React.lazy(() => import("./SectionView"));
const SubSectionView = React.lazy(() => import("./SubSectionView"));
const MePostSelectorView = React.lazy(() => import("./MePostSelectorView"));
const AdvanceWfView = React.lazy(() => import("./AdvanceWfView"));

// ---------------- type → component map ----------------
const viewComponentMapping: { [key: number]: React.FC<any> } = {
  15: CtrTextBoxView,
  1: RichTextControllerView,
  2: ChoiceControllerView,
  3: NumberControllerView,
  4: DateTimeSelectorView,
  21: PersianCalendarPickerView,
  5: LookUpFormsView,
  34: LookUpRealValueView,
  35: LookUpAdvanceTableView,
  30: LookUpImageView,
  36: AdvanceLookupAdvanceTableView,
  7: HyperLinkView,
  6: YesNoView,
  8: SelectUserInPostView,
  9: AttachFileView,
  26: PictureBoxView,
  19: PostPickerListView,
  10: TableControllerView,
  16: PfiLookUpView,
  20: SeqenialNumberView,
  22: AdvanceTableControllerView,
  24: WordPanelView,
  25: ExcellPanelView,
  27: CalculatedFieldView,
  29: ExcellCalculatorView,
  32: TabView,
  28: MapView,
  11: TitleView,
  12: SectionView,
  13: SubSectionView,
  18: MePostSelectorView,
  23: AdvanceWfView,
};

interface FormGeneratorViewProps {
  isOpen: boolean;
  onClose: () => void;
  entityFields: EntityField[];
  selectedRow?: any;
}

const FormGeneratorView: React.FC<FormGeneratorViewProps> = ({
  isOpen,
  onClose,
  entityFields,
  selectedRow,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  // Drag state (only when not maximized)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    offX: number;
    offY: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const onHeaderMouseDown = (e: ReactMouseEvent) => {
    if (isMaximized) return;
    // avoid dragging when clicking buttons
    if ((e.target as HTMLElement).closest("button")) return;

    e.preventDefault();
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      offX: dragOffset.x,
      offY: dragOffset.y,
    };
    document.addEventListener("mousemove", onDocMouseMove);
    document.addEventListener("mouseup", onDocMouseUp);
  };

  const onDocMouseMove = (e: MouseEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;
    setDragOffset({
      x: dragStartRef.current.offX + dx,
      y: dragStartRef.current.offY + dy,
    });
  };

  const onDocMouseUp = () => {
    document.removeEventListener("mousemove", onDocMouseMove);
    document.removeEventListener("mouseup", onDocMouseUp);
    dragStartRef.current = null;
  };

  const toggleMaximize = (e: ReactMouseEvent) => {
    e.stopPropagation();
    setIsMaximized((p) => !p);
    if (!isMaximized) setDragOffset({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-lg w-full transition-all duration-200 shadow-xl ${
          isMaximized ? "max-w-7xl h-[90vh]" : "max-w-2xl h-[80vh]"
        }`}
        style={
          isMaximized
            ? {}
            : {
                position: "fixed",
                left: "50%",
                top: "50%",
                transform: `translate(calc(-50% + ${dragOffset.x}px), calc(-50% + ${dragOffset.y}px))`,
              }
        }
      >
        {/* Header */}
        <div
          className="sticky top-0 bg-white z-10 flex justify-between items-center px-6 py-3 border-b cursor-move select-none"
          onMouseDown={onHeaderMouseDown}
        >
          <h2 className="text-2xl font-bold cursor-default select-none">
            View Form
          </h2>

          <div className="flex items-center gap-3 cursor-default select-none">
            {/* Maximize / Minimize button (always visible) */}
            <button
              onClick={toggleMaximize}
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
            </button>

            {/* Close */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-red-500 hover:text-red-700 focus:outline-none"
              title="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100% - 4rem)" }}>
          {entityFields.map((field, index) => {
            const ViewComponent = viewComponentMapping[field.ColumnType];
            if (!ViewComponent) return null;
            return (
              <div key={index} className="mb-4">
                <Suspense fallback={<div>Loading...</div>}>
                  <ViewComponent data={field} selectedRow={selectedRow} />
                </Suspense>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FormGeneratorView;
