import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="w-full min-h-screen">
      <main className="w-full min-h-screen p-4">
        <Outlet />
      </main>
    </div>
  );
}
