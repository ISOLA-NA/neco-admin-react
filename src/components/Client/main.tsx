import SideBar from "./SideBar";

// export default function Client({ children }: { childre: React.ReactNode }) {
export default function Client() {
  return (
    <div className={"h-screen w-screen grid grid-cols-9"}>
      <div className="col-span-2 bg-slate-100 border-r-2 border-slate-200 pt-12 pl-2">
        <SideBar />
      </div>
      <div className="col-span-7"></div>
    </div>
  );
}
