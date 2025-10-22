'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import StatsCards from '@/components/Dashboard/StatsCards';
import CategoryOverview from '@/components/Dashboard/CategoryOverview';
import QuickActions from '@/components/Dashboard/QuickActions';
import ActivityChart from '@/components/Dashboard/ActivityChart';
import { Toaster } from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthenticated = sessionStorage.getItem('isAuthenticated');
      if (!isAuthenticated) {
        router.push('/login');
      }
    }
  }, [router]);

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      <div className="space-y-8">
        <StatsCards />
        <CategoryOverview />
        <QuickActions />
        <ActivityChart />
      </div>
    </DashboardLayout>
  );
}