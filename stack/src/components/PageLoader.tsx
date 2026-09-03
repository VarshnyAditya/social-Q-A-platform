interface PageLoaderProps {
  label?: string;
  className?: string;
}

// A layered ring spinner in the app's own orange, with a small caption —
// used in place of a bare spinning circle for page-level loading states.
export default function PageLoader({ label = "Loading...", className = "" }: PageLoaderProps) {
  return (
    <div className={`w-full flex flex-col items-center justify-center py-16 gap-3 ${className}`}>
      <div className="relative w-11 h-11">
        <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
        <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
      {label && <p className="text-sm text-gray-400">{label}</p>}
    </div>
  );
}