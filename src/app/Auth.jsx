'use client';

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Auth({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow public page(s)
    if (pathname === '/verify-certificate' || pathname === '/login') return;

    const isAuthenticated = sessionStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [pathname, router]);

  return children;
}
