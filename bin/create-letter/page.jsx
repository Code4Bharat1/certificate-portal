"use client";
import CreateLetter from '../../../bin/CreateLetter/CreateLetter'
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

const page = () => {
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
      <CreateLetter />
    </div>
  )
}

export default page
