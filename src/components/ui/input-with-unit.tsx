import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface InputWithUnitProps extends React.ComponentProps<typeof Input> {
  unit: string
}

const InputWithUnit = React.forwardRef<HTMLInputElement, InputWithUnitProps>(({ unit, className, ...props }, ref) => {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{unit}</span>
      <Input
        ref={ref}
        className={cn("pl-8", className)}
        {...props}
      />
    </div>
  )
})
InputWithUnit.displayName = "InputWithUnit"

export { InputWithUnit }
