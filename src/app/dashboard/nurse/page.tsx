"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NurseDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "NURSE") {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nurse Dashboard</h1>
            <p className="text-gray-600">
              Welcome, Nurse {session?.user?.name} • {session?.user?.department}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Patient Rounds</h3>
            <p className="text-2xl font-bold text-blue-600">8</p>
            <p className="text-gray-600">Patients to check</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Medications Due</h3>
            <p className="text-2xl font-bold text-green-600">15</p>
            <p className="text-gray-600">Medications to administer</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Vital Signs</h3>
            <p className="text-2xl font-bold text-purple-600">12</p>
            <p className="text-gray-600">Readings to record</p>
          </div>
        </div>
      </div>
    </div>
  );
}