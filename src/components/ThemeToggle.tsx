import { ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, type Theme } from "@/components/ThemeProvider";

const CHOICES = [
  { value: "light", label: "Hell", Icon: Sun },
  { value: "dark", label: "Dunkel", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const;

const isTheme = (value: string): value is Theme => CHOICES.some(choice => choice.value === value);

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label="Darstellung"
          className="h-11 w-11 gap-1.5 px-0 text-foreground-secondary md:w-auto md:px-3"
        >
          {/* Sun/moon follow the <html> class, so they are right before React mounts and when System changes. */}
          <span className="relative h-5 w-5 md:h-[18px] md:w-[18px]" aria-hidden="true">
            <Sun className="absolute inset-0 h-full w-full transition-all dark:-rotate-90 dark:scale-0" strokeWidth={1.75} />
            <Moon className="absolute inset-0 h-full w-full rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" strokeWidth={1.75} />
          </span>
          <ChevronDown className="hidden h-3.5 w-3.5 md:block" strokeWidth={2} aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Darstellung</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme} onValueChange={value => isTheme(value) && setTheme(value)}>
          {CHOICES.map(({ value, label, Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
