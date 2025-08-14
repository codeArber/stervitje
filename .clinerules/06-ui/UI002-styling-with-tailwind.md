# Rule: Styling with Tailwind CSS

**Rule ID:** UI002
**Applies to:** All `.tsx` component files.

**Description:** Defines the standards for styling components using Tailwind CSS to ensure consistency, maintainability, and conflict-free styles.

## The Rule

1.  **Tailwind First:** All styling **MUST** be implemented using Tailwind CSS utility classes. Inline `style` objects or external CSS files for individual components are forbidden unless absolutely necessary for a specific library integration.

2.  **The `cn` Utility:** For managing component classes, we **MUST** use a utility function that combines `clsx` and `tailwind-merge`. This function should be located at `src/lib/utils.ts` and named `cn`.

3.  **Conditional Classes:** When classes need to be applied conditionally, the `cn` utility **MUST** be used. This provides a cleaner and more readable syntax than manual string interpolation.

4.  **Style Overrides:** Component props that accept custom classes (e.g., `className`) **MUST** pass them through the `cn` utility. This allows `tailwind-merge` to correctly resolve conflicts between default classes and user-provided classes.

## Rationale

Using a single, consistent styling methodology (Tailwind) is key to a maintainable design system. The `cn` utility, standard in the Shadcn/ui ecosystem, solves two common problems: it simplifies the logic for applying conditional classes and it intelligently merges class names, preventing style conflicts when components are extended. This makes our components robust and predictable.

## Examples

### Correct

The `cn` utility is defined once and used throughout the project. The `StatusBadge` component uses it to handle default styles, variant styles, and external overrides cleanly.

**File:** `src/lib/utils.ts`
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// This utility MUST be used for all class name management.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**File:** `src/components/ui/StatusBadge.tsx`
```typescript
import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  status: 'active' | 'inactive';
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <div
      // Correct: `cn` handles all class logic.
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        {
          'bg-green-100 text-green-800': status === 'active',
          'bg-gray-100 text-gray-800': status === 'inactive',
        },
        className // External classes are merged here, overrides apply correctly.
      )}
    >
      {status}
    </div>
  );
}
```

### Incorrect

This example uses messy string templates and does not handle class overrides correctly, leading to bugs and hard-to-read code.

```typescript
type StatusBadgeProps = {
  status: 'active' | 'inactive';
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Bad: Manual string interpolation is hard to read.
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold';
  const statusClasses = status === 'active'
    ? 'bg-green-100 text-green-800'
    : 'bg-gray-100 text-gray-800';

  // Bad: Class conflicts can occur. If `className` contains `bg-red-100`,
  // the resulting class string will be ".... bg-green-100 ... bg-red-100",
  // and the final background color will be unpredictable.
  const finalClassName = `${baseClasses} ${statusClasses} ${className || ''}`;

  return (
    <div className={finalClassName}>
      {status}
    </div>
  );
}
```