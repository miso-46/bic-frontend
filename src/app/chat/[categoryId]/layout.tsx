import React from 'react';

export default function ChatLayout({
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