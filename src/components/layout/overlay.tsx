// components/LoadingOverlay.tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export function LoadingOverlay({ open }: { open: boolean }) {
  return (
    <Dialog open={open}>
      <DialogContent className="flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-4">Processing, this operation will not take over 30 seconds...</span>
      </DialogContent>
    </Dialog>
  );
}
