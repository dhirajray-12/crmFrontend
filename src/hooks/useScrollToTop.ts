import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export function useScrollToTop<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    ref.current?.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return ref;
}
