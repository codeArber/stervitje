import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority"; // NEW: Import cva

import { cn } from "@/lib/utils";

// Define input variants using cva
const inputVariants = cva(
  "flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        // Your default input styles (which were the base string) can be considered a 'default' variant
        default: "border-input", // Existing border style
        // NEW VARIANT: For example, a 'ghost' variant without a visible border
        ghost: "bg-white/15 ", // Border only on focus
        // Add other variants as needed, e.g., 'filled', 'error', etc.
        // exampleVariant: "bg-blue-100 text-blue-800 border-blue-300",
      },
  
      // You can add more props like `active` or `error` state here if needed
    },
    defaultVariants: {
      variant: "default"
    },
  }
);

// Define the props for your Input component, combining existing props with cva's VariantProps
export interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {} // NEW: Extend with VariantProps

const Input = React.forwardRef<HTMLInputElement, InputProps>( // NEW: Use InputProps
  ({ className, type, variant,  ...props }, ref) => { // NEW: Destructure variant and size
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant,  className }))} // NEW: Use inputVariants to apply classes
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants }; // NEW: Export inputVariants if needed elsewhere