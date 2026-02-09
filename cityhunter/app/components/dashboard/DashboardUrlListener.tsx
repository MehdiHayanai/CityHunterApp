"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDashboardContext } from "../../context/DashboardContext";

function UrlListenerInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { walks, setActiveWalk, setActiveTab, retryLoading } = useDashboardContext();

  useEffect(() => {
    const walkIdParam = searchParams.get('walkId');
    const refreshParam = searchParams.get('refresh');
    
    if (refreshParam) {
      console.log("[TACTICAL] Refresh signal received, reloading intelligence database...");
      retryLoading();
      
      // Clean up URL
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('refresh');
      router.replace('/dashboard', { scroll: false });
      return;
    }

    if (walkIdParam) {
      const walkId = Number(walkIdParam);
      const targetWalk = walks.find(w => w.id === walkId);
      
      if (targetWalk) {
        setActiveWalk(targetWalk);
        setActiveTab('Walk');
        
        // Clean up URL without reload
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete('walkId');
        router.replace(`/dashboard`, { scroll: false });
      }
    }
  }, [searchParams, walks, setActiveWalk, setActiveTab, router, retryLoading]);

  return null;
}

export default function DashboardUrlListener() {
  return (
    <Suspense fallback={null}>
      <UrlListenerInner />
    </Suspense>
  );
}
