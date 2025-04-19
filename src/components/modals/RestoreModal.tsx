import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SVGProps } from "react"
import { BadgeAlertIcon, Loader2 } from "lucide-react";

interface RestoreModalProps {
  description: string;
  title: string;
  open: boolean;
  loading: boolean;
  onClick: () => void;
  setOpen: (open: boolean) => void; // Corrected type for setOpen
}

export default function RestoreModal({description, title, open, setOpen, onClick, loading} : RestoreModalProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="bg-blue-500 hover:bg-blue-700 font-geist">{title}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] font-geist">
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <BadgeAlertIcon className="size-12 text-blue-500" />
          <div className="space-y-2 text-center">
            <DialogTitle>Hold on!</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </DialogClose>
          <Button variant={"ghost"} className="bg-blue-500 hover:bg-blue-700" onClick={onClick}>
            {loading ? (
              <>
                Restoring
                <Loader2 className="animate-spin"/>
              </>
            
            ) : (
              <>
                Restore
              </>
              
            )}
            
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function TriangleAlertIcon(props : SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}