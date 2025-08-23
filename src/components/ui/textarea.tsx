import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority" // NEW: Import cva

import { cn } from "@/lib/utils"

// Define textarea variants using cva
const textareaVariants = cva(
  "flex min-h-[60px] w-full rounded-md px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        // Default variant with border
        default: "border border-input bg-transparent",
        // NEW VARIANT: 'ghost' variant with no default border, but border on focus
        ghost: "bg-white/15 ",
        // Add other variants here if needed
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Define the props for your Textarea component
export interface TextareaProps
  extends React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {} // NEW: Extend with VariantProps

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps // NEW: Use TextareaProps
>(({ className, variant, ...props }, ref) => { // NEW: Destructure variant
  return (
    <textarea
      className={cn(textareaVariants({ variant, className }))} // NEW: Use textareaVariants
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants } // NEW: Export textareaVariants if needed elsewhere