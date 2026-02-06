"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import AnimatedCard from "../../components/AnimatedCard";
import { motion } from "framer-motion";
import { apiUrl } from "../../lib/api";

interface Stats {
  services: { total: number; published: number };
  pages: { total: number; published: number };
  blogs: { total: number; published: number };
  caseStudies: { total: number; published: number };
  users: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    services: { total: 0, published: 0 },
    pages: { total: 0, published: 0 },
    blogs: { total: 0, published: 0 },
    caseStudies: { total: 0, published: 0 },
    users: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
      setLoading(false);
      fetchStats();
    }
  }, [router]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem("access_token");

      const [servicesRes, pagesRes, blogsRes, caseStudiesRes, usersRes] =
        await Promise.allSettled([
          axios.get(`${apiUrl}/cms/services`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/cms/pages`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/cms/blogs`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/cms/case-studies`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/cms/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      const newStats: Stats = {
        services: { total: 0, published: 0 },
        pages: { total: 0, published: 0 },
        blogs: { total: 0, published: 0 },
        caseStudies: { total: 0, published: 0 },
        users: 0,
      };

      if (servicesRes.status === "fulfilled") {
        const services = servicesRes.value.data;
        newStats.services = {
          total: services.length,
          published: services.filter((s: any) => s.status === "published").length,
        };
      }

      if (pagesRes.status === "fulfilled") {
        const pages = pagesRes.value.data;
        newStats.pages = {
          total: pages.length,
          published: pages.filter((p: any) => p.status === "published").length,
        };
      }

      if (blogsRes.status === "fulfilled") {
        const blogs = blogsRes.value.data;
        newStats.blogs = {
          total: blogs.length,
          published: blogs.filter((b: any) => b.status === "published").length,
        };
      }

      if (caseStudiesRes.status === "fulfilled") {
        const caseStudies = caseStudiesRes.value.data;
        newStats.caseStudies = {
          total: caseStudies.length,
          published: caseStudies.filter((cs: any) => cs.status === "published").length,
        };
      }

      if (usersRes.status === "fulfilled") {
        newStats.users = usersRes.value.data.length;
      }

      setStats(newStats);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const StatCard = ({
    icon,
    title,
    total,
    published,
    href,
    index,
  }: {
    icon: string;
    title: string;
    total: number;
    published: number;
    href: string;
    index: number;
  }) => (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="block"
    >
      <AnimatedCard>
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">{icon}</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {title}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {statsLoading ? "..." : total}
                  </div>
                  {published > 0 && (
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <span>{published} published</span>
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </AnimatedCard>
    </motion.a>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of your content and website statistics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="🛠️"
          title="Services"
          total={stats.services.total}
          published={stats.services.published}
          href="/admin/services"
          index={0}
        />
        <StatCard
          icon="📄"
          title="Pages"
          total={stats.pages.total}
          published={stats.pages.published}
          href="/admin/pages"
          index={1}
        />
        <StatCard
          icon="📝"
          title="Blogs"
          total={stats.blogs.total}
          published={stats.blogs.published}
          href="/admin/blogs"
          index={2}
        />
        <StatCard
          icon="📚"
          title="Case Studies"
          total={stats.caseStudies.total}
          published={stats.caseStudies.published}
          href="/admin/case-studies"
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnimatedCard>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <a
                href="/admin/homepage"
                className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">🏠</span>
                  <div>
                    <div className="font-medium text-gray-900">Edit Homepage</div>
                    <div className="text-sm text-gray-500">
                      Customize your website homepage
                    </div>
                  </div>
                </div>
              </a>
              <a
                href="/admin/services"
                className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">🛠️</span>
                  <div>
                    <div className="font-medium text-gray-900">Manage Services</div>
                    <div className="text-sm text-gray-500">
                      Add or edit your services
                    </div>
                  </div>
                </div>
              </a>
              <a
                href="/admin/settings"
                className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">⚙️</span>
                  <div>
                    <div className="font-medium text-gray-900">Site Settings</div>
                    <div className="text-sm text-gray-500">
                      Configure your website settings
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Getting Started
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <div>
                  <strong>1. Customize Homepage:</strong> Go to Homepage builder to
                  create your landing page
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <div>
                  <strong>2. Add Services:</strong> Create service pages to showcase
                  what you offer
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <div>
                  <strong>3. Create Content:</strong> Add blog posts and case studies
                  to build trust
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <div>
                  <strong>4. Configure Settings:</strong> Set up your site name, theme,
                  and SEO settings
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>

      <AnimatedCard>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Content Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {stats.services.published}
              </div>
              <div className="text-sm text-gray-500">Published Services</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {stats.pages.published}
              </div>
              <div className="text-sm text-gray-500">Published Pages</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {stats.blogs.published}
              </div>
              <div className="text-sm text-gray-500">Published Blogs</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {stats.caseStudies.published}
              </div>
              <div className="text-sm text-gray-500">Published Case Studies</div>
            </div>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}
