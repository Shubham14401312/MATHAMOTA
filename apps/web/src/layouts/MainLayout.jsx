import Sidebar from "../components/chat/Sidebar.jsx";
import InstallFooter from "../components/layout/InstallFooter.jsx";
import { useChatStore } from "../store/chatStore.js";
import { Outlet, useLocation } from "react-router-dom";

export default function MainLayout() {
  const mobileChatOpen = useChatStore((state) => state.mobileChatOpen);
  const location = useLocation();
  const hideSidebar = location.pathname === "/chat" && mobileChatOpen;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 overflow-hidden rounded-[32px] bg-white/10 p-2 shadow-2xl shadow-black/20">
        <div className={`${hideSidebar ? "hidden" : "flex"} w-full min-h-0 flex-col lg:flex lg:w-[420px]`}>
          <Sidebar />
        </div>
        <Outlet />
      </div>
      <InstallFooter />
    </div>
  );
}
