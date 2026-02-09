"use client";

import { use, useEffect, useState } from 'react';
import UserProfile from '../../../components/dashboard/UserProfile';
import { getUserById } from '../../../constants/user-profile';

export default function GenericUserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use() in Next.js 15/16
  const resolvedParams = use(params);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (resolvedParams.id) {
       const user = getUserById(resolvedParams.id);
       setUserData(user);
    }
  }, [resolvedParams.id]);

  if (!userData) {
      return (
          <div className="min-h-screen bg-canvas flex items-center justify-center">
              <div className="text-secondary font-mono animate-pulse">Loading Profile...</div>
          </div>
      );
  }

  return <UserProfile initialUser={userData} />;
}
