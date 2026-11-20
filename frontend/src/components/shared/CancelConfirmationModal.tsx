import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type CancelConfirmationModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function CancelConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
}: CancelConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Code Editing</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          You have unsaved changes. Are you sure you want to cancel?
        </div>
        <div className="flex justify-end space-x-4">
          <Button variant="destructive" onClick={onConfirm}>
            Confirm
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Keep Editing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
