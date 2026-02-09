import React from 'react';

interface ComingSoonWrapperProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string; // Allow custom classes just in case
  title?: string;
  message?: string;
  icon?: string;
  color?: string; // e.g., "text-accent", "text-red-500"
}

const ComingSoonWrapper: React.FC<ComingSoonWrapperProps> = ({ 
  children, 
  active = false,
  className = "",
  title = "Coming Soon",
  message = "This feature is under construction.",
  icon = "fa-person-digging",
  color = "text-accent"
}) => {
  if (!active) {
    return <>{children}</>;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* The actual content, blurred and non-interactive */}
      <div className="opacity-40 blur-[2px] pointer-events-none select-none grayscale-[0.5]">
        {children}
      </div>

      {/* The Overlay */}
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-4">
        {/* Glass effect background for the badge */}
        <div className={`bg-black/90 backdrop-blur-md border ${color.replace('text-', 'border-')}/30 p-8 rounded-2xl flex flex-col items-center gap-4 shadow-[0_0_40px_rgba(0,0,0,0.6)] max-w-sm`}>
           <div className={`h-16 w-16 rounded-full ${color.replace('text-', 'bg-')}/10 flex items-center justify-center border ${color.replace('text-', 'border-')}/20 animate-pulse`}>
             <i className={`fa-solid ${icon} ${color} text-2xl`}></i>
           </div>
           <div className="text-center">
             <h4 className={`${color} font-bold text-xl uppercase tracking-widest mb-2`}>{title}</h4>
             <p className="text-secondary text-sm font-medium">{message}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonWrapper;
