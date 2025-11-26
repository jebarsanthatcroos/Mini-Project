'use client';

import { useEffect, useState } from 'react';
import { ToastContainer } from './ToastContainer';

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  // Prevent hydration mismatch by not rendering on server
  if (!isClient) {
    return <>{children}</>; // Return children without client-specific features
  }

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
