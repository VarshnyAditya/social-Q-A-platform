import Navbar from "@/components/Navbar";
import RightSideBar from "@/components/RightSideBar";
import Sidebar from "@/components/Sidebar";
import React, { ReactNode, useEffect, useState } from "react";

interface MainlayoutProps {
  children: ReactNode;
}

// Breakpoints: below MD (768px) sidebars behave as overlay drawers.
// Between MD and LG (1024px) the right sidebar defaults closed.
const MD_BREAKPOINT = 768;
const LG_BREAKPOINT = 1024;

const Mainlayout = ({ children }: MainlayoutProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  useEffect(() => {
    const applyForWidth = (width: number) => {
      const mobile = width < MD_BREAKPOINT;
      setIsMobile(mobile);
      setLeftOpen(!mobile);
      setRightOpen(width >= LG_BREAKPOINT);
    };

    applyForWidth(window.innerWidth);

    // Only react to resize crossing the mobile breakpoint automatically —
    // once a user has manually toggled a sidebar on desktop, we don't want
    // every resize to stomp on their choice, so we just handle the
    // mobile/desktop mode switch here.
    let lastWasMobile = window.innerWidth < MD_BREAKPOINT;
    const handleResize = () => {
      const nowMobile = window.innerWidth < MD_BREAKPOINT;
      if (nowMobile !== lastWasMobile) {
        applyForWidth(window.innerWidth);
        lastWasMobile = nowMobile;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleLeft = () => setLeftOpen((s) => !s);
  const toggleRight = () => setRightOpen((s) => !s);
  const closeMobileDrawers = () => {
    if (isMobile) {
      setLeftOpen(false);
      setRightOpen(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] text-[#3a3a3a] min-h-screen">
      <Navbar onToggleLeft={toggleLeft} onToggleRight={toggleRight} />
      <div className="flex max-w-full relative" style={{ height: "calc(100vh - 53px)" }}>

        {/* Mobile backdrop — tapping outside a drawer closes it */}
        {isMobile && (leftOpen || rightOpen) && (
          <div
            className="fixed inset-0 top-[53px] bg-black/40 z-30"
            onClick={closeMobileDrawers}
            aria-hidden="true"
          />
        )}

        {/* Left Sidebar — collapses to width 0 on desktop, slides off-canvas on mobile */}
        <div className={isMobile ? "" : "sticky top-[53px] h-[calc(100vh-53px)] flex-shrink-0"}>
          <Sidebar isopen={leftOpen} isMobile={isMobile} onClose={closeMobileDrawers} />
        </div>

        {/* Main content — scrolls independently, resizes as sidebars toggle */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-white p-4 lg:p-6">
          {children}
        </main>

        {/* Right Sidebar — collapses to width 0 on desktop, slides off-canvas on mobile */}
        <div className={isMobile ? "" : "sticky top-[53px] h-[calc(100vh-53px)] flex-shrink-0"}>
          <RightSideBar isopen={rightOpen} isMobile={isMobile} />
        </div>

      </div>
    </div>
  );
};

export default Mainlayout;