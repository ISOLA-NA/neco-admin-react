import SideBar from "./SideBar";

// export default function Client({ children }: { childre: React.ReactNode }) {
export default function Client() {
  return (
    <div className={"h-screen w-screen grid grid-cols-5"}>
      <div className="col-span-1 bg-slate-100 border-r-2 border-slate-200 pt-12 pl-8">
        <SideBar />
      </div>
      <div className=""></div>
    </div>
  );
}
