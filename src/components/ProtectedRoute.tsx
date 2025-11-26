'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/models/User';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: UserRole | UserRole[];
  fallbackPath?: string;
  showLoading?: boolean;
  customMessage?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallbackPath = '/',
  showLoading = true,
  customMessage,
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isLoading,
    user,
    hasRole,
    canAccess,
    getRoleDisplayName,
    getRoleDisplayNameForRole,
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const currentUrl =
        typeof window !== 'undefined' ? window.location.href : '/';
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentUrl)}`);
      return;
    }

    // Check role-based access
    if (requiredRole && !hasRole(requiredRole)) {
      router.push(fallbackPath);
      return;
    }

    // Check permission-based access (role hierarchy)
    if (requiredPermission && !canAccess(requiredPermission)) {
      router.push(fallbackPath);
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    requiredRole,
    requiredPermission,
    hasRole,
    canAccess,
    router,
    fallbackPath,
  ]);

  // Show loading spinner
  if (isLoading && showLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return showLoading ? (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Redirecting to login...</p>
        </div>
      </div>
    ) : null;
  }

  // Check role-based access
  const hasRequiredRole = !requiredRole || hasRole(requiredRole);
  const hasRequiredPermission =
    !requiredPermission || canAccess(requiredPermission);

  if (!hasRequiredRole || !hasRequiredPermission) {
    const message =
      customMessage || "You don't have permission to access this page.";

    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-center max-w-md mx-auto p-6'>
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4'>
            <h1 className='text-2xl font-bold mb-2'>Access Denied</h1>
            <p className='mb-2'>{message}</p>
            <div className='text-sm space-y-1'>
              <p>
                <strong>Your Role:</strong> {getRoleDisplayName()}
              </p>
              {requiredRole && (
                <p>
                  <strong>Required Role:</strong>{' '}
                  {Array.isArray(requiredRole)
                    ? requiredRole
                        .map(role => getRoleDisplayNameForRole(role))
                        .join(' or ')
                    : getRoleDisplayNameForRole(requiredRole)}
                </p>
              )}
              {requiredPermission && (
                <p>
                  <strong>Required Permission Level:</strong>{' '}
                  {Array.isArray(requiredPermission)
                    ? requiredPermission
                        .map(role => getRoleDisplayNameForRole(role))
                        .join(' or ')
                    : getRoleDisplayNameForRole(requiredPermission)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => router.push(fallbackPath)}
            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md'
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
