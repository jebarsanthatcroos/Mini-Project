/* eslint-disable no-undef */
import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import { CartProvider } from '../context/CartContext';

export const metadata: Metadata = {
  title: 'Pharmacy Management System',
  description: 'Manage pharmacy operations efficiently',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        {/* Disable browser extensions that modify the DOM */}
        <meta name='grammarly-disable' content='true' />
        <meta name='zen-marketplace-disable' content='true' />
        <meta name='languagetool-disable' content='true' />
      </head>
      <body suppressHydrationWarning>
        <CartProvider>
          <AuthProvider>{children}</AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
