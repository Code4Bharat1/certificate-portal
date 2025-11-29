"use client";
import Client from "@/components/Client/Client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const page = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthenticated = sessionStorage.getItem("isAuthenticated");
      if (!isAuthenticated) {
        router.push("/login");
      }
    }
  }, [router]);

  return (
    <div>
      <Client />
    </div>
  );
};

export default page;
