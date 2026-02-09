"use client";

import { useAuthStore } from "../../store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login?redirect=/admin");
      } else if (user?.role !== 'admin') {
        // Uncomment this once roles are properly set up in backend/db
        // For now, we might want to allow dev access or just strict check
        // router.push("/dashboard");
        
        // STRICT CHECK:
        if (process.env.NODE_ENV === 'development') {
            // Allow access in dev for testing even without role, or warn
             console.warn("Accessing Admin without explicit 'admin' role (Dev Mode)");
             setIsAuthorized(true);
        } else {
             router.push("/dashboard");
        }
      } else {
        setIsAuthorized(true);
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-canvas text-primary">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
            <p className="font-mono text-sm tracking-widest text-secondary animate-pulse">VERIFYING CLEARANCE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-primary flex flex-col">
       <header className="border-b border-divider/10 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
           <div className="container mx-auto px-4 h-16 flex items-center justify-between">
               <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-black font-black text-xs">A</div>
                   <h1 className="font-bold tracking-tight">CITYHUNTER <span className="text-secondary font-mono text-xs ml-2">ADMIN CONSOLE</span></h1>
               </div>
               <div className="flex items-center gap-4">
                   <span className="text-xs font-mono text-secondary">Logged in as <span className="text-primary">{user?.handle}</span></span>
                   <button 
                    onClick={() => router.push('/dashboard')}
                    className="text-xs font-bold hover:text-accent transition-colors"
                   >
                    EXIT
                   </button>
               </div>
           </div>
       </header>
       <main className="flex-1 container mx-auto px-4 py-8">
        {children}
       </main>
    </div>
  );
}
