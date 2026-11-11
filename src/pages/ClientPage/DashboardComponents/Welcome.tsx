import { useState, useEffect } from "react";
import { Clock3, Compass } from "lucide-react";
import { useAuthStore } from "@/Store/auth.store";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useAppTour } from "@/components/AppTour/AppTourProvider";
import { getConfiguredTimezone } from "@/utils/timezoneStore";
import { Panel } from "./ui/Panel";
import { Pill } from "./ui/Pill";

const Welcome = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const { user } = useAuthStore();
  const { data: appSettings } = useAppSettings();
  const { hasTour, toursDisabled, startCurrentTour } = useAppTour();
  const timezone = getConfiguredTimezone();

  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: timezone,
    }).format(dateTime),
  );
  let greeting = "Hello";
  if (hours >= 5 && hours < 12) {
    greeting = "Good morning";
  } else if (hours >= 12 && hours < 17) {
    greeting = "Good afternoon";
  } else if (hours >= 17 && hours < 21) {
    greeting = "Good evening";
  } else {
    greeting = "Good night";
  }

  const formattedDate = dateTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: timezone,
  });

  const formattedTime = dateTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  });
  const serverName = appSettings?.serverName || "Aon ltd.";
  const fullName = `${user?.firstName || "Client"} ${user?.lastName || ""}`.trim();

  return (
    <Panel className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="emerald" dot>
              Live session
            </Pill>
            {hasTour && !toursDisabled && (
              <button
                type="button"
                onClick={startCurrentTour}
                data-voice-target="start tour"
                className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent transition-colors hover:bg-accent/[0.18]"
              >
                <Compass className="h-3 w-3" />
                Tour
              </button>
            )}
          </div>

          <h1 className="mt-3 text-xl font-bold tracking-tight text-heading sm:text-2xl">
            {greeting}, {fullName}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-subtle">
            <span data-tour-anchor="dashboard-server-name">
              Server <span className="font-medium text-heading">{serverName}</span>
            </span>
            <span data-tour-anchor="dashboard-operator">
              Operator <span className="font-medium text-heading">{fullName}</span>
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 text-right">
          <div>
            <p className="font-mono text-xl font-semibold tabular-nums text-heading sm:text-2xl">
              {formattedTime}
            </p>
            <p className="mt-0.5 text-xs text-subtle">{formattedDate}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Clock3 className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Panel>
  );
};

export default Welcome;
