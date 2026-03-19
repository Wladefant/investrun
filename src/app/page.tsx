"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AcademyAppInner } from "@/components/academy/AcademyAppInner";

function AcademyAppWithParams() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");

  // If ?name= is provided (from /pitch redirect), skip onboarding and go to dashboard
  if (name) {
    return <AcademyAppInner initialScreen="dashboard" initialName={name} />;
  }

  return <AcademyAppInner />;
}

export default function AcademyApp() {
  return (
    <Suspense>
      <AcademyAppWithParams />
    </Suspense>
  );
}
