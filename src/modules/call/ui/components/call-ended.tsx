import { Button } from "@/components/ui/button";
import Link from "next/link";

export const CallEnded = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-radial from-sidebar-accent to-sidebar">
      <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
        <div className="flex flex-col gap-y-2 text-center">
          <h6 className="text-lg font-medium">You have ended the call</h6>
          <p className="text-sm">Summary will appear in a few minutes.</p>
        </div>

        <Button asChild>
          <Link href="/meetings">Back to meetings</Link>
        </Button>
      </div>
    </div>
  );
};
