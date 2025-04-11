// app/layout.tsx
import type React from "react";

export const metadata = {
  title: 'My App',
  description: 'App description here',
};

export default function PriorityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor: 'white', color: 'black', minHeight: '100vh' }}>
      {children}
    </div>
  );
}