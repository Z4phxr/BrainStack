import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    // Motion: shadow + optional lift; transforms only when prefers-reduced-motion is off (motion-safe).
    "transition-[color,box-shadow,transform,background-color,opacity,border-color] duration-200 ease-out",
    "motion-reduce:transition-[color,box-shadow,background-color,opacity,border-color] motion-reduce:duration-150",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  ].join(" "),
  {
    variants: {
      variant: {
        // Themed default: black / white inversion; hover lift + depth (shadow tuned per theme).
        default: [
          "btn-themed shadow-sm",
          "motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0",
          "hover:shadow-[0_12px_36px_-10px_rgba(0,0,0,0.38)]",
          "dark:hover:shadow-[0_14px_40px_-8px_rgba(0,0,0,0.72)]",
        ].join(" "),
        destructive: [
          "bg-destructive text-white shadow-sm hover:bg-destructive/90",
          "focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
          "motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0",
          "hover:shadow-[0_10px_30px_-8px_rgba(0,0,0,0.32)] dark:hover:shadow-[0_10px_30px_-8px_rgba(0,0,0,0.55)]",
        ].join(" "),
        outline: [
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
          "dark:bg-transparent dark:border-[var(--border)] dark:hover:bg-[var(--block-bg)]",
          "motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0",
          "hover:shadow-[0_8px_26px_-8px_rgba(0,0,0,0.14)] dark:hover:shadow-[0_8px_26px_-8px_rgba(0,0,0,0.48)]",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
          "motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0",
          "hover:shadow-[0_8px_26px_-8px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_26px_-8px_rgba(0,0,0,0.42)]",
        ].join(" "),
        ghost: [
          "shadow-none hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
          "motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0",
          "hover:shadow-[0_6px_22px_-10px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_6px_22px_-10px_rgba(0,0,0,0.38)]",
        ].join(" "),
        link: "text-primary underline-offset-4 shadow-none hover:underline motion-safe:hover:opacity-90",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
