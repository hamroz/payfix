/** Fixed backdrop: a dotted grid under two slowly drifting glows, echoing the brand video. */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage: "radial-gradient(rgba(120,135,180,0.22) 1px, transparent 1.2px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, black 20%, transparent 75%)",
        }}
      />
      <div className="animate-drift absolute -left-[15%] -top-[25%] size-[60vmax] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.22),transparent_60%)] blur-2xl" />
      <div className="animate-drift-slow absolute -bottom-[30%] -right-[15%] size-[55vmax] rounded-full bg-[radial-gradient(circle,rgba(94,242,194,0.10),transparent_60%)] blur-2xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet/40 to-transparent" />
    </div>
  );
}
