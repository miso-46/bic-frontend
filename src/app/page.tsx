"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const Home = dynamic(() => import("./components/Home"), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-4">読み込み中...</div>}>
      <Home />
    </Suspense>
  );
}
