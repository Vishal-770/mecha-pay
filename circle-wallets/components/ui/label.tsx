"use client"

import * as React from "react"
import { Field } from "@base-ui/react/field"
import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<typeof Field.Label>) {
  return (
    <Field.Label
      data-slot="label"
      className={cn(
        "text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/90 group-focus-within:text-primary transition-colors leading-none",
        className
      )}
      {...props}
    />
  )
}

export { Label }
