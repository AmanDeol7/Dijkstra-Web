
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CertificateDashboard } from "@/components/certificate/certificate-dashboard";

function PageFallback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-8 flex items-start gap-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <CertificateDashboard />
    </Suspense>
  );
}
