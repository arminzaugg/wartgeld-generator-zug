import { Link } from "react-router-dom";
import { ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSetupStatus } from "@/hooks/useSetupStatus";
import { joinItems, remainingLabel } from "@/lib/setupStatus";

/** Invoice-page reminder while the midwife's own details are missing; never blocks generating. */
export const SetupNotice = () => {
  const missing = useSetupStatus();
  if (missing.length === 0) return null;

  return (
    <aside className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg bg-warning-soft px-4 py-4 text-warning-foreground md:pl-5">
      <Info className="hidden h-[22px] w-[22px] shrink-0 md:block" strokeWidth={1.75} aria-hidden="true" />
      <div className="flex min-w-[min(100%,14rem)] flex-1 flex-col gap-0.5 text-sm leading-[21px]">
        <p className="text-[15px] font-semibold">Noch {remainingLabel(missing.length)} bis zur ersten Rechnung</p>
        <p>Hinterlegen Sie einmalig: {joinItems(missing)}.</p>
      </div>
      <Button asChild variant="outline" className="h-11 bg-card px-[18px] text-foreground">
        <Link to="/settings">
          Zu den Einstellungen
          <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </Link>
      </Button>
    </aside>
  );
};
