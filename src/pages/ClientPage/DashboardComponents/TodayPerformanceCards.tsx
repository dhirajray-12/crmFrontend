import { PerformanceCardsGrid } from "@/components/TodayPerformanceCard/PerformanceCardsGrid";
import { PerformanceHeader } from "@/components/TodayPerformanceCard/PerformanceHeader";
import { usePerformanceStore } from "@/Store/performanceStore";
import { useEffect, useRef } from "react";
import { Panel } from "./ui/Panel";

export default function TodayPerformanceCards() {
  const { setOpen } = usePerformanceStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setOpen]);

  return (
    <Panel ref={containerRef}>
      <PerformanceHeader />
      <div className="p-4 sm:p-5">
        <PerformanceCardsGrid />
      </div>
    </Panel>
  );
}
