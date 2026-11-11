import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, Button } from 'wartgeld-generator-zug';
import { Info } from 'lucide-react';

export const IconButtonHint = () => (
  <div className="flex h-28 items-end justify-center">
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Informationen"><Info className="h-5 w-5" /></Button>
        </TooltipTrigger>
        <TooltipContent><p>Informationen</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);
