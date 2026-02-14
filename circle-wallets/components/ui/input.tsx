"use client"

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

function Input({ className, ...props }: React.ComponentProps<typeof InputPrimitive>) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-xl border border-border/80 bg-muted/20 px-4 py-2 text-sm font-bold ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/90 outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50 focus:border-primary/50 focus:bg-background",
        className
      )}
      {...props}
    />
  )
}

export { Input }
