"use client";

export default function IPhoneFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-pf-gray-900 p-4">
      {/* iPhone 15 Pro frame */}
      <div className="relative w-[393px] h-[852px] bg-pf-black rounded-[55px] border-[3px] border-pf-gray-700 shadow-2xl overflow-hidden">
        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-pf-black rounded-full z-50" />

        {/* Screen content */}
        <div className="absolute inset-0 rounded-[52px] overflow-hidden">
          <div className="h-full overflow-y-auto pt-14 pb-8">
            {children}
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-pf-gray-500 rounded-full z-50" />
      </div>
    </div>
  );
}
