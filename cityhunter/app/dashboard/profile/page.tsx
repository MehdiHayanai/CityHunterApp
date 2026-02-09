
import UserProfile from '@/app/components/dashboard/UserProfile';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explorer Profile | CityHunter',
  description: 'View your urban exploration stats, level progression, and mission logs.',
};

export default function ProfilePage() {
  return (
    <div className="w-full h-full">
      <UserProfile />
    </div>
  );
}
