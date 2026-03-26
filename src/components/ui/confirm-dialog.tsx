"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  open: boolean
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title = "Are you sure?",
  description,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
            "w-full max-w-sm rounded-2xl border bg-background p-6 shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2",
            "data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]"
          )}
        >
          <DialogPrimitive.Title className="text-base font-semibold text-foreground mb-1.5">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-sm text-muted-foreground mb-5">
            {description}
          </DialogPrimitive.Description>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button
              variant={destructive ? "destructive" : "default"}
              size="sm"
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
