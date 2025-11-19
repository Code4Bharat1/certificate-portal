'use client';

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Auth({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow public page(s)
    if (pathname === '/verify-certificate' || 
        pathname === '/login' || 

        pathname === '/termsandconditions/C4B'|| 
        pathname === '/termsandconditions/C4B/t&c' || 
        pathname === '/termsandconditions/C4B/onboard' || 
        pathname === '/termsandconditions/C4B/pdf' || 
        pathname === '/termsandconditions/C4B/offboard' || 

        pathname === `/termsandconditions/MJ` ||
        pathname === `/termsandconditions/MJ/t&c` ||
        pathname === `/termsandconditions/MJ/onboard` || 
        pathname === `/termsandconditions/MJ/offboard` ||
        pathname === `/termsandconditions/MJ/pdf` ||

        pathname === `/termsandconditions/DM` || 
        pathname === `/termsandconditions/DM/t&c` || 
        pathname === `/termsandconditions/DM/onboard` ||
        pathname === `/termsandconditions/DM/offboard` ||
        pathname === `/termsandconditions/DM/pdf` ||

        pathname === `/termsandconditions/FSD/t&c` ||
        pathname === `/termsandconditions/FSD/onboard` ||
        pathname === `/termsandconditions/FSD/offboard` ||
        pathname === `/termsandconditions/FSD/pdf`

      ) return;

    const isAuthenticated = sessionStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [pathname, router]);

  return children;
}