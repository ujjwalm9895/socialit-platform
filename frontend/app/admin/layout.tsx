"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: "📊" },
  { name: "Homepage", href: "/admin/homepage", icon: "🏠" },
  { name: "Header", href: "/admin/header", icon: "🔝" },
  { name: "Footer", href: "/admin/footer", icon: "🔻" },
  { name: "Services", href: "/admin/services", icon: "🛠️" },
  { name: "Pages", href: "/admin/pages", icon: "📄" },
  { name: "Blogs", href: "/admin/blogs", icon: "📝" },
  { name: "Case Studies", href: "/admin/case-studies", icon: "📚" },
  { name: "Users", href: "/admin/users", icon: "👥" },
  { name: "Theme", href: "/admin/theme", icon: "🎨" },
  { name: "UI Settings", href: "/admin/ui-settings", icon: "✨" },
  { name: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const isLoginPage = pathname === "/admin/login";
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!isLoginPage && !token) {
      router.replace("/admin/login");
      return;
    }
    setAuthChecked(true);
  }, [pathname, router]);

  // Listen for 401 during edit (e.g. in modals) – we don't redirect so the modal stays open; show banner instead
  useEffect(() => {
    const onSessionExpired = () => setSessionExpired(true);
    window.addEventListener("session-expired", onSessionExpired);
    return () => window.removeEventListener("session-expired", onSessionExpired);
  }, []);

  const isLoginPage = pathname === "/admin/login";
  if (isLoginPage) {
    return <>{children}</>;
  }
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 lg:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                  <h1 className="text-xl font-bold text-gray-900">CMS Admin</h1>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                  {navigation.map((item, index) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                            isActive
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span className="mr-3 text-lg">{item.icon}</span>
                          {item.name}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center px-4 py-2 text-sm text-gray-600">
                    <span className="mr-2">👤</span>
                    <span>Admin User</span>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
        
        {/* Desktop Sidebar */}
        <motion.aside
          initial={{ x: -256 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="hidden lg:block fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">CMS Admin</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item, index) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      {item.name}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center px-4 py-2 text-sm text-gray-600">
                <span className="mr-2">👤</span>
                <span>Admin User</span>
              </div>
            </div>
          </div>
        </motion.aside>

        <div className="flex flex-col flex-1 lg:pl-64">
          <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              ☰
            </button>
            <div className="flex items-center space-x-4 ml-auto">
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50">
                🔔
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50">
                ⚙️
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("access_token");
                  window.location.href = "/admin/login";
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 relative">
            {sessionExpired && (
              <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 flex items-center justify-between">
                <p className="text-sm font-medium text-amber-800">
                  Your session has expired. Please log in again to save changes.
                </p>
                <Link
                  href="/admin/login"
                  className="shrink-0 ml-4 px-3 py-1.5 text-sm font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md"
                >
                  Log in
                </Link>
              </div>
            )}
            {children}
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
