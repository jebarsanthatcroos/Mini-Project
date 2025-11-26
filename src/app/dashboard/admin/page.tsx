"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiActivity,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle
} from "react-icons/fi";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  const stats = [
    {
      name: "Total Users",
      value: "1,248",
      change: "+12%",
      changeType: "increase",
      icon: FiUsers,
      color: "bg-blue-500"
    },
    {
      name: "Appointments Today",
      value: "86",
      change: "+5%",
      changeType: "increase",
      icon: FiCalendar,
      color: "bg-green-500"
    },
    {
      name: "Revenue",
      value: "$24,800",
      change: "+18%",
      changeType: "increase",
      icon: FiDollarSign,
      color: "bg-purple-500"
    },
    {
      name: "System Uptime",
      value: "99.9%",
      change: "+0.1%",
      changeType: "increase",
      icon: FiActivity,
      color: "bg-orange-500"
    }
  ];

  const recentActivities = [
    { id: 1, user: "Dr. Sarah Johnson", action: "created new patient record", time: "2 min ago", type: "success" },
    { id: 2, user: "Nurse Mike Chen", action: "updated medication list", time: "5 min ago", type: "info" },
    { id: 3, user: "Receptionist Lisa", action: "scheduled appointment", time: "10 min ago", type: "info" },
    { id: 4, user: "Lab Technician Tom", action: "uploaded test results", time: "15 min ago", type: "success" },
    { id: 5, user: "System", action: "security patch applied", time: "1 hour ago", type: "warning" }
  ];

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here&apos;s what&apos;s happening with your healthcare system today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className={`p-3 rounded-md ${item.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {item.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {item.value}
                        </div>
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {item.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              System-wide activities and updates
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {activity.type === 'success' && (
                      <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    )}
                    {activity.type === 'warning' && (
                      <FiAlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    )}
                    {activity.type === 'info' && (
                      <FiTrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.user}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.action}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Quick Actions
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Frequently used administrative tasks
            </p>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 transition-colors">
              <FiUsers className="mx-auto h-6 w-6 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Manage Users
              </span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 transition-colors">
              <FiCalendar className="mx-auto h-6 w-6 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                View Schedule
              </span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 transition-colors">
              <FiActivity className="mx-auto h-6 w-6 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                System Health
              </span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 transition-colors">
              <FiTrendingUp className="mx-auto h-6 w-6 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Analytics
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}