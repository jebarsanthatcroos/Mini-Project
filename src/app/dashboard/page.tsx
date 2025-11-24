"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@/models/User";

export default function DashboardRouter() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect based on role
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/dashboard')}`);
      return;
    }

    const userRole = session.user?.role as UserRole;
    
    // Role-based dashboard routing
    const roleRoutes: Record<UserRole, string> = {
      ADMIN: "/dashboard/admin",
      DOCTOR: "/dashboard/doctor",
      NURSE: "/dashboard/nurse",
      RECEPTIONIST: "/dashboard/receptionist",
      LABTECH: "/dashboard/lab",
      PHARMACIST: "/dashboard/pharmacy",
      STAFF: "/dashboard/staff",
      PATIENT: "/dashboard/patient",
      USER: "/dashboard/user"
    };

    const targetRoute = roleRoutes[userRole] || "/dashboard/user";
    router.push(targetRoute);
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
        <p className="text-sm text-gray-500 mt-2">
          Role: {session?.user?.role || "Loading..."}
        </p>
      </div>
    </div>
  );
}