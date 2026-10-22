import { Link } from "react-router-dom";
import { Info, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

type Page = "rechnung" | "einstellungen" | "info";

const NAV = [
  { page: "info", to: "/info", label: "Information", Icon: Info },
  { page: "einstellungen", to: "/settings", label: "Einstellungen", Icon: SlidersHorizontal },
] as const;

/** Shared top bar. The brand is not a heading: each page has exactly one h1 of its own. */
export const AppHeader = ({ current }: { current: Page }) => (
  <header className="border-b bg-header">
    <div className="mx-auto flex h-[60px] max-w-[1440px] items-center justify-between pl-5 pr-2 md:h-[72px] md:px-10">
      <Link to="/" className="flex items-center gap-2.5 rounded-md md:gap-3 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_hsl(var(--background)),0_0_0_4px_hsl(var(--primary))]">
        <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-primary font-serif text-lg font-medium leading-none text-primary-foreground md:h-9 md:w-9 md:rounded-md md:text-xl">W</span>
        <span className="flex flex-col gap-0.5">
          <span className="text-base font-semibold leading-5 tracking-[-0.01em]">Wartgeld Generator</span>
          <span className="hidden text-[13px] leading-4 text-muted-foreground md:block">Kanton Zug</span>
        </span>
      </Link>
      <nav className="flex items-center md:gap-1" aria-label="Hauptnavigation">
        {NAV.map(({ page, to, label, Icon }) => {
          const active = current === page;
          return (
            <Button
              key={page}
              asChild
              variant="ghost"
              className={cn("h-11 w-11 px-0 md:w-auto md:px-4", active && "bg-accent text-accent-foreground hover:bg-accent")}
            >
              <Link to={to} aria-label={label} aria-current={active ? "page" : undefined}>
                <Icon className="h-5 w-5 md:h-[18px] md:w-[18px]" strokeWidth={1.75} aria-hidden="true" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            </Button>
          );
        })}
        <div className="mx-2 hidden h-6 w-px bg-border md:block" aria-hidden="true" />
        <ThemeToggle />
      </nav>
    </div>
  </header>
);
