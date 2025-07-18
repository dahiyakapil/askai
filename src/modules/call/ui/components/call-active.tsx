import Image from "next/image";
import Link from "next/link";
import { CallControls, SpeakerLayout } from "@stream-io/video-react-sdk";

interface Props {
  onLeave: () => void;
  meetingName: string;
}

export const CallActive = ({ onLeave, meetingName }: Props) => {
  return (
    <div className="flex flex-col h-screen bg-black text-white">
      
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4 bg-[#0f1113] border-b border-white/10">
        <Link
          href="/"
          className="flex items-center justify-center p-1 bg-white/10 rounded-full"
        >
          <Image src="/logo.svg" width={22} height={22} alt="Logo" />
        </Link>
        <h4 className="text-base font-medium truncate">{meetingName}</h4>
      </div>

      {/* Centered Speaker Layout */}
      <div className="flex-1 flex items-center justify-center">
        <SpeakerLayout />
      </div>

      {/* Call controls */}
      <div className="w-full flex justify-center pb-6 pt-2">
        <div className="bg-[#101213] rounded-full px-6 py-2 shadow-lg">
          <CallControls onLeave={onLeave} />
        </div>
      </div>
    </div>
  );
};
