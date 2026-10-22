import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetClose = SheetPrimitive.Close
const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-scrim data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none",
      className
    )}
    {...props}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

/** Bottom sheet only: the app uses it for the finished PDF on phones. */
const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex max-h-[calc(100dvh-72px)] flex-col rounded-t-2xl bg-card pb-[env(safe-area-inset-bottom)] text-foreground shadow-pop data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom data-[state=open]:duration-300 motion-reduce:animate-none",
        className
      )}
      {...props}
    >
      <div className="flex justify-center pt-2" aria-hidden="true">
        <div className="h-[5px] w-10 rounded-full bg-input" />
      </div>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetCloseButton = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Close>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Close
    ref={ref}
    className={cn(
      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-foreground-secondary transition-colors hover:text-foreground focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_hsl(var(--background)),0_0_0_4px_hsl(var(--primary))]",
      className
    )}
    aria-label="Schliessen"
    {...props}
  >
    <X className="h-[18px] w-[18px]" strokeWidth={2} />
  </SheetPrimitive.Close>
))
SheetCloseButton.displayName = "SheetCloseButton"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title ref={ref} className={cn("font-serif text-[22px] font-medium leading-7", className)} {...props} />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description ref={ref} className={cn("text-[13px] text-muted-foreground", className)} {...props} />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export { Sheet, SheetTrigger, SheetClose, SheetCloseButton, SheetContent, SheetTitle, SheetDescription }
