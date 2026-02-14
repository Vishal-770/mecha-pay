"use client"

import * as React from "react"
import { Field as FieldPrimitive } from "@base-ui/react/field"
import { cn } from "@/lib/utils"

function Field({ className, ...props }: React.ComponentProps<typeof FieldPrimitive.Root>) {
  return (
    <FieldPrimitive.Root
      data-slot="field"
      className={cn("group flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function FieldControl({ className, ...props }: React.ComponentProps<typeof FieldPrimitive.Control>) {
  return (
    <FieldPrimitive.Control
      data-slot="field-control"
      className={cn("relative", className)}
      {...props}
    />
  )
}

export { Field, FieldControl }
