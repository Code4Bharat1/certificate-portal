"use client"

import dynamic from "next/dynamic";

const ViewDocuments = dynamic(
  () => import("@/components/view-documents/view-documents"),
  { ssr: false }
);

export default function Page() {
  return (
    <div>
      <ViewDocuments />
    </div>
  );
}
