import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem, Button,
} from 'wartgeld-generator-zug';
import { Sun, Moon, Settings } from 'lucide-react';

export const ThemeMenu = () => (
  <div className="h-56">
    <DropdownMenu defaultOpen modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Darstellung"><Sun className="h-5 w-5" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>Darstellung</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value="light">
          <DropdownMenuRadioItem value="light"><Sun className="mr-2 h-4 w-4" />Hell</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark"><Moon className="mr-2 h-4 w-4" />Dunkel</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system"><Settings className="mr-2 h-4 w-4" />System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Einstellungen öffnen</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);
