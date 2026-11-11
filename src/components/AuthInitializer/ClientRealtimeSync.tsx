import { useRealtimeSync } from "@/hooks/useRealtimeSync";

export default function ClientRealtimeSync() {
  useRealtimeSync({
    enabled: true,
  });

  return null;
}
