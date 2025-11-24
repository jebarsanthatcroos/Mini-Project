import AdminNavbar from "@/components/adminNavbar";
import AdminHeader from "@/components/adminHeader";

export const metadata = {
  title: "Admin Dashboard - Healthcare System",
  description: "Administrative dashboard for healthcare management system",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Admin Navbar */}
      <AdminNavbar />
      
      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden md:ml-64">
        {/* Admin Header */}
        <AdminHeader />
        
        {/* Page Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}