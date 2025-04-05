// src/app/login/layout.tsx

import React from "react";
import "./login.css"; // 必要ならCSSも適用

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="login-container">{children}</div>;
}
