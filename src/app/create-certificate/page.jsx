'use client';

import CreateCertificate from '@/components/CreateCertificate/CreateCertificate';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Page = () => {
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
    <div>
      <CreateCertificate />
    </div>
  );
};

export default Page;
