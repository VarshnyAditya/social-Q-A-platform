import Navbar from "@/components/Navbar";
import RightSideBar from "@/components/RightSideBar";
import Sidebar from "@/components/Sidebar";
import React, { ReactNode, useEffect, useState } from "react";

interface MainlayoutProps {
  children: ReactNode;
}

const Mainlayout = ({ children }: MainlayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, []);

  const handleslidein = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen((state) => !state);
    }
  };

  return (
    <div className="bg-[#f8f9fa] text-[#3a3a3a] min-h-screen">
      <Navbar handleslidein={handleslidein} />
      <div className="flex max-w-full" style={{ height: "calc(100vh - 53px)" }}>

        {/* Left Sidebar — fixed, does not scroll with page */}
        <div className="sticky top-[53px] h-[calc(100vh-53px)] overflow-y-auto flex-shrink-0">
          <Sidebar isopen={sidebarOpen} />
        </div>

        {/* Main content — scrolls independently */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-white p-4 lg:p-6">
          {children}
        </main>

        {/* Right Sidebar — fixed, does not scroll with page */}
        <div className="hidden lg:block sticky top-[53px] h-[calc(100vh-53px)] overflow-y-auto flex-shrink-0 border-l border-gray-200">
          <RightSideBar />
        </div>

      </div>
    </div>
  );
};

export default Mainlayout;