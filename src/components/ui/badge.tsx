import * as React from "react"

import { cn } from "@/lib/utils"

const Badge = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 text-[13px] font-semibold text-accent-foreground [&>svg]:h-3.5 [&>svg]:w-3.5",
      className
    )}
    {...props}
  />
)

export { Badge }
