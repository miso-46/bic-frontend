// src/app/admin/layout.tsx

import type React from "react";
import "./admin.css"; // 管理画面用CSSの読み込み

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-wrapper">{children}</div>;
}
