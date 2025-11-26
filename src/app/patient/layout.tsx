import React from 'react';

export const metadata = {
  title: 'Patient Portal - Medical System',
  description:
    'Patient dashboard for managing medical appointments and records',
};

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className='antialiased'>{children}</body>
    </html>
  );
}
