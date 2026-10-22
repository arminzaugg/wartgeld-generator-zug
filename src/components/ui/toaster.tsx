import { AlertCircle, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const destructive = props.variant === "destructive"
        const Icon = destructive ? AlertCircle : Check
        return (
          <Toast key={id} {...props}>
            <div className="flex items-center gap-3">
              <span
                data-toast-icon
                aria-hidden="true"
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  destructive ? "bg-destructive-soft text-destructive" : "bg-accent text-accent-foreground"
                )}
              >
                <Icon className="h-[17px] w-[17px]" strokeWidth={destructive ? 2 : 2.5} />
              </span>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
