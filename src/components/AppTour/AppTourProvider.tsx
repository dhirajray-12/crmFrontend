import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  Compass,
  MoveLeft,
  MoveRight,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { getTourForPath, getTourShortcutLabel } from "./tours";

interface AppTourContextValue {
  startCurrentTour: () => void;
  stopCurrentTour: () => void;
  toggleToursDisabled: () => void;
  currentRouteKey: string | null;
  hasTour: boolean;
  toursDisabled: boolean;
  showLauncher: boolean;
}

const AppTourContext = createContext<AppTourContextValue | null>(null);

const TOUR_COMPLETED_STORAGE_KEY = "crm-tour-completed";
const TOUR_DISMISSED_STORAGE_KEY = "crm-tour-dismissed";
const TOUR_DISABLED_STORAGE_KEY = "crm-tour-disabled";
const TOUR_LAYOUT_SEEN_STORAGE_KEY = "crm-tour-layout-seen";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TourScrollSnapshot {
  pageScrollTop: number;
  pageScrollLeft: number;
  windowScrollX: number;
  windowScrollY: number;
}

function isInteractiveElement(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  if (!element) {
    return false;
  }

  const tagName = element.tagName.toLowerCase();
  return (
    ["input", "textarea", "select"].includes(tagName) ||
    element.isContentEditable
  );
}

export function AppTourProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const currentTour = useMemo(() => getTourForPath(location.pathname), [location.pathname]);
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [completedTours, setCompletedTours] = useState<string[]>([]);
  const [dismissedTours, setDismissedTours] = useState<string[]>([]);
  const [toursDisabled, setToursDisabled] = useState(false);
  const [seenLayouts, setSeenLayouts] = useState<string[]>([]);
  const [pinRects, setPinRects] = useState<(SpotlightRect | null)[]>([]);
  const [activeSelector, setActiveSelector] = useState<string | null>(null);
  const scrollSnapshotRef = useRef<TourScrollSnapshot | null>(null);

  useEffect(() => {
    try {
      const savedCompleted = window.localStorage.getItem(
        TOUR_COMPLETED_STORAGE_KEY,
      );
      const savedDismissed = window.localStorage.getItem(
        TOUR_DISMISSED_STORAGE_KEY,
      );
      const savedDisabled = window.localStorage.getItem(TOUR_DISABLED_STORAGE_KEY);
      const savedSeenLayouts = window.localStorage.getItem(
        TOUR_LAYOUT_SEEN_STORAGE_KEY,
      );

      if (savedCompleted) {
        setCompletedTours(JSON.parse(savedCompleted));
      }
      if (savedDismissed) {
        setDismissedTours(JSON.parse(savedDismissed));
      }
      if (savedDisabled) {
        setToursDisabled(savedDisabled === "true");
      }
      if (savedSeenLayouts) {
        setSeenLayouts(JSON.parse(savedSeenLayouts));
      }
    } catch {
      setCompletedTours([]);
      setDismissedTours([]);
      setToursDisabled(false);
      setSeenLayouts([]);
    }
  }, []);

  const activeSteps = useMemo(() => {
    if (!currentTour) {
      return [];
    }

    return currentTour.steps.filter((step) => {
      if (step.isLayoutStep && seenLayouts.includes(currentTour.layout)) {
        return false;
      }

      return (
        typeof document !== "undefined" && Boolean(document.querySelector(step.selector))
      );
    });
  }, [currentTour, location.pathname, isOpen, seenLayouts]);

  const updatePinPositions = useCallback(() => {
    if (!isOpen || activeSteps.length === 0) {
      setPinRects([]);
      return;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const rects = activeSteps.map((step) => {
      const element = document.querySelector(step.selector) as HTMLElement | null;
      if (!element) {
        return null;
      }

      const rect = element.getBoundingClientRect();
      const isVisible =
        rect.bottom > 0 && rect.top < vh && rect.right > 0 && rect.left < vw;

      if (!isVisible) {
        return null;
      }

      return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
    });

    setPinRects(rects);
    setActiveSelector(activeSteps[stepIndex]?.selector ?? null);
  }, [activeSteps, isOpen, stepIndex]);

  useEffect(() => {
    if (!isOpen) {
      setPinRects([]);
      setActiveSelector(null);
      return;
    }

    const timer = window.setTimeout(updatePinPositions, 160);
    window.addEventListener("resize", updatePinPositions);
    window.addEventListener("scroll", updatePinPositions, true);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", updatePinPositions);
      window.removeEventListener("scroll", updatePinPositions, true);
    };
  }, [isOpen, stepIndex, updatePinPositions]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const step = activeSteps[stepIndex];
    if (!step) {
      return;
    }

    const timer = window.setTimeout(() => {
      const element = document.querySelector(step.selector) as HTMLElement | null;
      element?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }, 60);

    return () => window.clearTimeout(timer);
  }, [activeSteps, isOpen, stepIndex]);

  const spotlightRect = pinRects[stepIndex] ?? null;

  useEffect(() => {
    if (!currentTour || isOpen || toursDisabled) {
      return;
    }

    if (
      completedTours.includes(currentTour.key) ||
      dismissedTours.includes(currentTour.key)
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setStepIndex(0);
      setIsOpen(true);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [completedTours, currentTour, dismissedTours, isOpen, toursDisabled]);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardPlacement, setCardPlacement] = useState<
    "top" | "bottom" | "left" | "right" | "center"
  >("center");
  const [cardCoords, setCardCoords] = useState({ top: 0, left: 0 });
  const [cardSize, setCardSize] = useState({ width: 400, height: 300 });

  useLayoutEffect(() => {
    if (!isOpen || !spotlightRect) {
      setCardPlacement("center");
      return;
    }

    const MOBILE_BREAKPOINT = 768;
    const MARGIN = 18;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (vw < MOBILE_BREAKPOINT) {
      setCardPlacement("center");
      return;
    }

    const cardEl = cardRef.current;
    const cardWidth = cardEl?.offsetWidth ?? 400;
    const cardHeight = cardEl?.offsetHeight ?? 300;

    const spaceBelow = vh - (spotlightRect.top + spotlightRect.height);
    const spaceAbove = spotlightRect.top;
    const spaceRight = vw - (spotlightRect.left + spotlightRect.width);
    const spaceLeft = spotlightRect.left;

    let placement: "top" | "bottom" | "left" | "right" = "bottom";
    if (spaceBelow >= cardHeight + MARGIN) {
      placement = "bottom";
    } else if (spaceAbove >= cardHeight + MARGIN) {
      placement = "top";
    } else if (spaceRight >= cardWidth + MARGIN) {
      placement = "right";
    } else if (spaceLeft >= cardWidth + MARGIN) {
      placement = "left";
    } else {
      placement = spaceBelow >= spaceAbove ? "bottom" : "top";
    }

    let top = 0;
    let left = 0;

    if (placement === "bottom") {
      top = spotlightRect.top + spotlightRect.height + MARGIN;
      left = spotlightRect.left + spotlightRect.width / 2 - cardWidth / 2;
    } else if (placement === "top") {
      top = spotlightRect.top - cardHeight - MARGIN;
      left = spotlightRect.left + spotlightRect.width / 2 - cardWidth / 2;
    } else if (placement === "right") {
      top = spotlightRect.top + spotlightRect.height / 2 - cardHeight / 2;
      left = spotlightRect.left + spotlightRect.width + MARGIN;
    } else {
      top = spotlightRect.top + spotlightRect.height / 2 - cardHeight / 2;
      left = spotlightRect.left - cardWidth - MARGIN;
    }

    left = Math.min(Math.max(left, MARGIN), vw - cardWidth - MARGIN);
    top = Math.min(Math.max(top, MARGIN), vh - cardHeight - MARGIN);

    setCardPlacement(placement);
    setCardCoords({ top, left });
    setCardSize({ width: cardWidth, height: cardHeight });
  }, [isOpen, spotlightRect, stepIndex]);

  const arrowOffset = useMemo(() => {
    if (!spotlightRect || cardPlacement === "center") {
      return 0;
    }

    if (cardPlacement === "bottom" || cardPlacement === "top") {
      const centerX = spotlightRect.left + spotlightRect.width / 2;
      return Math.min(
        Math.max(centerX - cardCoords.left, 28),
        cardSize.width - 28,
      );
    }

    const centerY = spotlightRect.top + spotlightRect.height / 2;
    return Math.min(
      Math.max(centerY - cardCoords.top, 24),
      cardSize.height - 24,
    );
  }, [cardCoords, cardPlacement, cardSize, spotlightRect]);

  useEffect(() => {
    setIsOpen(false);
    setStepIndex(0);
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isInteractiveElement(event.target)) {
        return;
      }

      if (event.key === "?") {
        if (currentTour) {
          event.preventDefault();
          setStepIndex(0);
          setIsOpen(true);
        }
        return;
      }

      if (!isOpen) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setStepIndex((prev) => Math.min(prev + 1, activeSteps.length - 1));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setStepIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeSteps.length, currentTour, isOpen]);

  useEffect(() => {
    if (!activeSelector) {
      return;
    }

    const activeElement = document.querySelector(activeSelector);
    if (!(activeElement instanceof HTMLElement)) {
      return;
    }

    activeElement.dataset.tourActive = "true";
    return () => {
      delete activeElement.dataset.tourActive;
    };
  }, [activeSelector]);

  const persistList = (storageKey: string, nextValue: string[]) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextValue));
    } catch {
      // ignore persistence errors
    }
  };

  const getActivePageContainer = useCallback(() => {
    return document.querySelector("[data-tour-page]") as HTMLElement | null;
  }, []);

  const captureScrollSnapshot = useCallback(() => {
    const pageContainer = getActivePageContainer();
    scrollSnapshotRef.current = {
      pageScrollTop: pageContainer?.scrollTop ?? 0,
      pageScrollLeft: pageContainer?.scrollLeft ?? 0,
      windowScrollX: window.scrollX,
      windowScrollY: window.scrollY,
    };
  }, [getActivePageContainer]);

  const closeTour = useCallback(
    (restoreScroll = true) => {
      setIsOpen(false);
      setPinRects([]);
      setActiveSelector(null);

      if (!restoreScroll) {
        scrollSnapshotRef.current = null;
        return;
      }

      const snapshot = scrollSnapshotRef.current;
      scrollSnapshotRef.current = null;

      if (!snapshot) {
        return;
      }

      window.requestAnimationFrame(() => {
        const pageContainer = getActivePageContainer();
        if (pageContainer) {
          pageContainer.scrollTo({
            top: snapshot.pageScrollTop,
            left: snapshot.pageScrollLeft,
            behavior: "auto",
          });
        }

        window.scrollTo({
          top: snapshot.windowScrollY,
          left: snapshot.windowScrollX,
          behavior: "auto",
        });
      });
    },
    [getActivePageContainer],
  );

  const markLayoutSeen = () => {
    if (!currentTour) {
      return;
    }

    const nextValue = Array.from(new Set([...seenLayouts, currentTour.layout]));
    setSeenLayouts(nextValue);
    persistList(TOUR_LAYOUT_SEEN_STORAGE_KEY, nextValue);
  };

  const markCompleted = () => {
    if (!currentTour) {
      return;
    }

    const nextValue = Array.from(new Set([...completedTours, currentTour.key]));
    setCompletedTours(nextValue);
    persistList(TOUR_COMPLETED_STORAGE_KEY, nextValue);
    markLayoutSeen();
  };

  const markDismissed = () => {
    if (!currentTour) {
      return;
    }

    const nextValue = Array.from(new Set([...dismissedTours, currentTour.key]));
    setDismissedTours(nextValue);
    persistList(TOUR_DISMISSED_STORAGE_KEY, nextValue);
    markLayoutSeen();
  };

  const startCurrentTour = () => {
    if (!currentTour || toursDisabled) {
      return;
    }

    captureScrollSnapshot();
    setStepIndex(0);
    setIsOpen(true);
  };

  const stopCurrentTour = () => {
    closeTour();
  };

  const toggleToursDisabled = () => {
    const nextValue = !toursDisabled;
    setToursDisabled(nextValue);
    try {
      window.localStorage.setItem(TOUR_DISABLED_STORAGE_KEY, String(nextValue));
    } catch {
      // ignore persistence errors
    }

    if (nextValue) {
      closeTour(false);
    }
  };

  const currentStep = activeSteps[stepIndex] ?? null;
  const nextStep = activeSteps[stepIndex + 1] ?? null;
  const isLastStep = stepIndex === activeSteps.length - 1;
  const showLauncher = Boolean(currentTour?.showLauncher ?? true) && !toursDisabled;
  const progress = activeSteps.length
    ? ((stepIndex + 1) / activeSteps.length) * 100
    : 0;

  const isUnseenTour = Boolean(
    currentTour &&
      !completedTours.includes(currentTour.key) &&
      !dismissedTours.includes(currentTour.key),
  );

  const accentSolidClass =
    currentTour?.accentFrom === "from-blue-500"
      ? "bg-linear-to-r from-blue-500 to-indigo-400"
      : currentTour?.accentFrom === "from-indigo-500"
        ? "bg-linear-to-r from-indigo-500 to-violet-400"
        : "bg-linear-to-r from-accent to-accent-hover";

  const floatingButton = currentTour && showLauncher ? (
    <button
      type="button"
      onClick={startCurrentTour}
      data-tour-anchor="tour-trigger"
      title="Take a guided tour of this page"
      className="group fixed bottom-5 right-5 z-[95] inline-flex items-center gap-3 rounded-full border border-border bg-surface-strong px-4 py-3 text-sm font-semibold text-heading shadow-[0_18px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-white/25 hover:shadow-[0_22px_48px_rgba(2,6,23,0.55)]"
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-accent to-accent-hover text-accent-foreground">
        {isUnseenTour && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rose-400 ring-2 ring-app">
            <span className="absolute inset-0 animate-ping rounded-full bg-rose-400" />
          </span>
        )}
        <span className="absolute inset-0 rounded-full bg-accent/45 blur-md transition-opacity group-hover:opacity-80" />
        <Compass className="relative h-4 w-4 transition-transform group-hover:rotate-45" />
      </span>
      <span className="hidden sm:block text-left">
        <span className="block">Page Guide</span>
        <span className="block text-xs font-medium text-subtle">
          {getTourShortcutLabel()}
        </span>
      </span>
    </button>
  ) : null;

  return (
    <AppTourContext.Provider
      value={{
        startCurrentTour,
        stopCurrentTour,
        toggleToursDisabled,
        currentRouteKey: currentTour?.key ?? null,
        hasTour: Boolean(currentTour),
        toursDisabled,
        showLauncher,
      }}
    >
      {children}
      {createPortal(
        <>
          {floatingButton}

          {isOpen && currentTour && currentStep && (
            <div className="pointer-events-none fixed inset-0 z-[120]">
              {spotlightRect && (
                <div
                  key={activeSelector}
                  className="pointer-events-none absolute animate-in fade-in zoom-in-95 rounded-2xl border-2 border-accent/70 shadow-[0_0_0_4px_rgba(34,211,238,0.15),0_0_28px_rgba(34,211,238,0.4)] duration-300"
                  style={{
                    top: spotlightRect.top - 6,
                    left: spotlightRect.left - 6,
                    width: spotlightRect.width + 12,
                    height: spotlightRect.height + 12,
                  }}
                />
              )}

              {pinRects.map((rect, index) => {
                if (!rect || index === stepIndex) {
                  return null;
                }

                const step = activeSteps[index];
                const isVisited = index < stepIndex;

                return (
                  <button
                    key={step.selector}
                    type="button"
                    onClick={() => setStepIndex(index)}
                    aria-label={`Go to step ${index + 1}: ${step.title}`}
                    title={step.title}
                    className={`pointer-events-auto absolute flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold shadow-lg transition-all duration-300 hover:scale-110 ${
                      isVisited
                        ? "border-accent/40 bg-surface-strong text-accent"
                        : "border-border bg-surface-strong text-subtle hover:border-white/30 hover:text-heading"
                    }`}
                    style={{ top: rect.top - 11, left: rect.left - 11 }}
                  >
                    {isVisited ? <Check className="h-3 w-3" /> : index + 1}
                  </button>
                );
              })}

              {spotlightRect && (
                <span
                  className="pointer-events-none absolute z-10 flex h-7 w-7 items-center justify-center"
                  style={{
                    top: spotlightRect.top - 12,
                    left: spotlightRect.left - 12,
                  }}
                >
                  <span
                    className={`absolute inset-0 animate-ping rounded-full bg-linear-to-br ${currentTour.accentFrom} ${currentTour.accentTo} opacity-60`}
                  />
                  <span
                    className={`relative flex h-7 w-7 items-center justify-center rounded-full border border-white/40 bg-linear-to-br text-xs font-bold text-accent-foreground ${currentTour.accentFrom} ${currentTour.accentTo}`}
                  >
                    {stepIndex + 1}
                  </span>
                </span>
              )}

              <div
                ref={cardRef}
                key={`${currentTour.key}-${stepIndex}`}
                className={
                  cardPlacement === "center"
                    ? "pointer-events-auto absolute bottom-5 left-1/2 w-[min(92vw,420px)] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 overflow-hidden rounded-[28px] border border-border bg-surface-strong text-heading shadow-[0_30px_80px_rgba(2,6,23,0.55)] duration-250"
                    : "pointer-events-auto fixed w-[min(92vw,400px)] animate-in fade-in zoom-in-95 overflow-hidden rounded-[28px] border border-border bg-surface-strong text-heading shadow-[0_30px_80px_rgba(2,6,23,0.55)] duration-250"
                }
                style={
                  cardPlacement === "center"
                    ? undefined
                    : { top: cardCoords.top, left: cardCoords.left }
                }
              >
                {cardPlacement !== "center" && (
                  <div
                    className="pointer-events-none absolute h-3.5 w-3.5 rotate-45 border border-border bg-surface-strong"
                    style={{
                      ...(cardPlacement === "bottom" && {
                        top: -7,
                        left: arrowOffset - 7,
                        borderRight: "none",
                        borderBottom: "none",
                      }),
                      ...(cardPlacement === "top" && {
                        bottom: -7,
                        left: arrowOffset - 7,
                        borderLeft: "none",
                        borderTop: "none",
                      }),
                      ...(cardPlacement === "right" && {
                        left: -7,
                        top: arrowOffset - 7,
                        borderRight: "none",
                        borderTop: "none",
                      }),
                      ...(cardPlacement === "left" && {
                        right: -7,
                        top: arrowOffset - 7,
                        borderLeft: "none",
                        borderBottom: "none",
                      }),
                    }}
                  />
                )}

                <div className="relative p-5">
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${currentTour.accentFrom} ${currentTour.accentTo}`}
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-heading">
                      <Sparkles className="h-3.5 w-3.5 text-accent" />
                      {currentTour.title}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-border bg-surface-strong/[0.05] px-2.5 py-1 text-[11px] font-semibold text-subtle">
                        {stepIndex + 1} / {activeSteps.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          markDismissed();
                          closeTour();
                        }}
                        aria-label="Close tour"
                        className="rounded-full border border-border bg-surface-strong/[0.05] p-1.5 text-subtle transition-colors hover:bg-surface-strong/[0.08] hover:text-heading"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-start gap-3 rounded-[22px] border border-border bg-surface-strong/[0.04] p-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-subtle">
                        Current stop
                      </p>
                      <h2 className="mt-1 text-lg font-semibold leading-snug">
                        {currentStep.title}
                      </h2>
                      <p className="mt-1.5 text-sm leading-6 text-subtle">
                        {currentStep.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-1.5">
                    {activeSteps.length <= 10 ? (
                      activeSteps.map((step, index) => (
                        <button
                          key={step.selector}
                          type="button"
                          aria-label={`Go to step ${index + 1}: ${step.title}`}
                          onClick={() => setStepIndex(index)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            index === stepIndex
                              ? `w-6 bg-linear-to-r ${currentTour.accentFrom} ${currentTour.accentTo}`
                              : index < stepIndex
                                ? "w-1.5 bg-accent/50"
                                : "w-1.5 bg-surface-strong/15 hover:bg-surface-strong/25"
                          }`}
                        />
                      ))
                    ) : (
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-strong/10">
                        <div
                          className={`h-full rounded-full bg-linear-to-r ${currentTour.accentFrom} ${currentTour.accentTo} transition-all duration-300`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {nextStep && (
                    <p className="mt-3 truncate text-center text-xs text-subtle">
                      Next:{" "}
                      <span className="font-medium text-subtle">
                        {nextStep.title}
                      </span>
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setStepIndex((prev) => Math.max(prev - 1, 0))}
                      disabled={stepIndex === 0}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-surface-strong/[0.05] px-3.5 py-2.5 text-sm font-medium text-heading transition-colors hover:bg-surface-strong/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <MoveLeft className="h-4 w-4" />
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (isLastStep) {
                          markCompleted();
                          closeTour();
                          return;
                        }

                        setStepIndex((prev) =>
                          Math.min(prev + 1, activeSteps.length - 1),
                        );
                      }}
                      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 ${accentSolidClass}`}
                    >
                      {isLastStep ? (
                        <>
                          Finish tour
                          <Check className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Next stop
                          <MoveRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={toggleToursDisabled}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-subtle transition-colors hover:text-subtle"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      Don't show tours again
                    </button>
                    <span className="hidden text-[11px] text-body sm:inline-flex sm:items-center sm:gap-1">
                      <kbd className="rounded border border-border bg-surface-strong/[0.05] px-1.5 py-0.5 font-sans">
                        Esc
                      </kbd>
                      to close ·
                      <kbd className="rounded border border-border bg-surface-strong/[0.05] px-1.5 py-0.5 font-sans">
                        ←
                      </kbd>
                      <kbd className="rounded border border-border bg-surface-strong/[0.05] px-1.5 py-0.5 font-sans">
                        →
                      </kbd>
                      to navigate
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>,
        document.body,
      )}
    </AppTourContext.Provider>
  );
}

export function useAppTour() {
  const context = useContext(AppTourContext);
  if (!context) {
    throw new Error("useAppTour must be used within AppTourProvider");
  }

  return context;
}
