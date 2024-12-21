import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mb-4">{message}</div>
        <DialogFooter className="flex justify-end gap-4">
          <Button
            variant="outline"
            className="bg-transparent text-gray-400 border-gray-600 hover:bg-gray-700"
            onClick={onClose}
          >
            Bekor qilish
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            O'chirish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
