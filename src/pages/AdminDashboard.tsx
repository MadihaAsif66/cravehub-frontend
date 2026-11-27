
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  Package,
  ChartNoAxesCombined,
  Settings,
  Bell,
  Search,
  MoreHorizontal,
  Clock3,
  CircleDollarSign,
  ChefHat,
  Menu,
  X,
  CalendarDays,
  TrendingUp,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Orders", icon: ShoppingBag },
  { label: "Customers", icon: Users },
  { label: "Menu Management", icon: UtensilsCrossed },
  { label: "Inventory", icon: Package },
  { label: "Analytics", icon: ChartNoAxesCombined },
];

type AdminDashboardProps = {
  token: string;
};

export default function AdminDashboard({ token }: AdminDashboardProps) {
  const [active, setActive] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSalesReport = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://cravehub-backend.netlify.app/api/reports/sales",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Sales report could not load");
        }

        const data = await response.json();
        setReportData(data);
      } catch (err) {
        console.error("Sales Report Error:", err);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSalesReport();
    }
  }, [token]);

  const rawOrders = Array.isArray(reportData?.recentOrders)
    ? reportData.recentOrders
    : [];

  const orders = rawOrders.map((order: any) => {
    const itemNames = Array.isArray(order.items)
      ? order.items
          .map((item: any) => {
            const quantity = Number(item.quantity || 1);
            return `${item.name || "Item"} × ${quantity}`;
          })
          .join(", ")
      : "No items";

    return {
      id: order.orderNumber || `#CH-${String(order._id || "").slice(-4).toUpperCase()}`,
      customer: order.customerName || "Customer",
      item: itemNames,
      amount: Number(order.total || 0),
      status: order.status || "Pending",
      date: order.createdAt
        ? new Date(order.createdAt).toLocaleDateString()
        : "N/A",
    };
  });

  const totalSales = Number(reportData?.totalSales || 0);
  const totalOrders = Number(reportData?.totalOrders || 0);
  const completedOrders = Number(reportData?.completedOrders || 0);
  const pendingOrders = Number(reportData?.pendingOrders || 0);
  const preparingOrders = Number(reportData?.preparingOrders || 0);
  const readyOrders = Number(reportData?.readyOrders || 0);

  const averageOrderValue =
    totalOrders > 0 ? totalSales / totalOrders : 0;

  const completionRate =
    totalOrders > 0
      ? Math.round((completedOrders / totalOrders) * 100)
      : 0;

  const stats = [
    {
      title: "Total Revenue",
      value: `Rs. ${totalSales.toLocaleString()}`,
      icon: CircleDollarSign,
      note: "Actual sales from database",
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      icon: ShoppingBag,
      note: "Orders in database",
    },
    {
      title: "Completed Orders",
      value: completedOrders.toLocaleString(),
      icon: Users,
      note: "Successfully completed",
    },
    {
      title: "Pending Orders",
      value: pendingOrders.toLocaleString(),
      icon: Clock3,
      note: "Waiting for processing",
    },
  ];

  // Build the chart from actual recent orders.
  const groupedSales: Record<string, number> = {};

  rawOrders.forEach((order: any) => {
    if (!order.createdAt) return;

    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) return;

    const day = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    groupedSales[day] =
      (groupedSales[day] || 0) + Number(order.total || 0);
  });

  const salesData = Object.entries(groupedSales).map(([day, sales]) => ({
    day,
    sales,
  }));

  const statusItems = [
    { label: "Completed", count: completedOrders, color: "bg-emerald-400" },
    { label: "Preparing", count: preparingOrders, color: "bg-sky-400" },
    { label: "Ready", count: readyOrders, color: "bg-violet-400" },
    { label: "Pending", count: pendingOrders, color: "bg-orange-400" },
  ];

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-emerald-400/10 text-emerald-300";
      case "preparing":
        return "bg-sky-400/10 text-sky-300";
      case "ready":
        return "bg-violet-400/10 text-violet-300";
      default:
        return "bg-orange-400/10 text-orange-300";
    }
  };

  return (
    <div className="min-h-screen bg-[#11110f] text-[#f5f0e8]">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .7s ease both; }
        .dashboard-card {
          background: linear-gradient(145deg, #201f1c, #191916);
          border: 1px solid rgba(255,255,255,.07);
          transition: transform .25s ease, border-color .25s ease;
        }
        .dashboard-card:hover {
          transform: translateY(-4px);
          border-color: rgba(245,145,72,.35);
        }
      `}</style>

      <div className="flex min-h-screen">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/70 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/[0.07] bg-[#171714] px-5 py-7 transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                Crave<span className="text-orange-400">Hub.</span>
              </h1>
              <p className="mt-1 text-[10px] uppercase tracking-[4px] text-white/40">
                Admin workspace
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X size={21} />
            </button>
          </div>

          <p className="mb-4 text-[10px] font-bold uppercase tracking-[2px] text-white/30">
            Workspace
          </p>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const selected = active === item.label;

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setActive(item.label);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-all ${
                    selected
                      ? "bg-orange-500 text-[#17130f] shadow-lg shadow-orange-500/15"
                      : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                  {selected && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#17130f]" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto">
            <div className="mb-5 rounded-2xl border border-orange-400/20 bg-orange-400/[0.07] p-4">
              <div className="mb-2 flex items-center gap-2 text-orange-300">
                <ChefHat size={18} />
                <span className="text-xs font-semibold">CraveHub Control</span>
              </div>
              <p className="text-xs leading-5 text-white/45">
                Your restaurant operations, all in one place.
              </p>
            </div>

            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/50 transition hover:bg-white/[0.06] hover:text-white">
              <Settings size={18} /> Settings
            </button>

            <div className="mt-4 flex items-center gap-3 border-t border-white/[0.07] pt-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-400 font-bold text-[#17130f]">
                A
              </div>
              <div>
                <p className="text-sm font-semibold">Administrator</p>
                <p className="text-xs text-white/35">Admin account</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-7 lg:px-10 lg:py-8">
          <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-white/10 p-2 lg:hidden"
              >
                <Menu size={20} />
              </button>
              <div>
                <p className="mb-1 text-xs uppercase tracking-[2px] text-orange-300">
                  Restaurant overview
                </p>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Dashboard <span className="text-orange-400">Overview.</span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/45 sm:flex">
                <CalendarDays size={15} />
                Live database report
              </div>
              <button className="relative rounded-xl border border-white/10 bg-white/[0.03] p-3 text-white/60 hover:text-orange-300">
                <Bell size={18} />
              </button>
              <button className="hidden rounded-xl border border-white/10 bg-white/[0.03] p-3 text-white/60 hover:text-white sm:block">
                <Search size={18} />
              </button>
            </div>
          </header>

          <section className="fade-up relative mb-7 overflow-hidden rounded-3xl border border-orange-400/15 bg-gradient-to-r from-[#302116] via-[#241c16] to-[#1d1b17] p-6 sm:p-8">
            <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full bg-orange-500/20 blur-[85px]" />
            <div className="relative z-10 max-w-xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[3px] text-orange-300">
                Welcome to your workspace
              </p>
              <h3 className="text-2xl font-bold leading-tight sm:text-3xl">
                Every detail matters.
                <br />
                <span className="text-orange-300">Every order counts.</span>
              </h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/50">
                Monitor your restaurant performance using actual order and sales data.
              </p>
            </div>
            <div className="pointer-events-none absolute -bottom-10 right-8 hidden text-orange-300/10 sm:block">
              <ChefHat size={190} strokeWidth={0.7} />
            </div>
          </section>

          {loading ? (
            <div className="dashboard-card rounded-2xl p-8 text-center text-white/60">
              Loading live dashboard data...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-center text-red-300">
              {error}
            </div>
          ) : (
            <>
              <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.title}
                      style={{ animationDelay: `${index * 100}ms` }}
                      className="dashboard-card fade-up rounded-2xl p-5"
                    >
                      <div className="mb-5 flex items-center justify-between">
                        <div className="rounded-xl bg-orange-400/10 p-3 text-orange-300">
                          <Icon size={20} />
                        </div>
                        <MoreHorizontal size={20} className="text-white/30" />
                      </div>
                      <p className="text-sm text-white/45">{stat.title}</p>
                      <h3 className="mt-2 text-2xl font-bold tracking-tight">
                        {stat.value}
                      </h3>
                      <p className="mt-2 text-[11px] text-white/30">
                        {stat.note}
                      </p>
                    </div>
                  );
                })}
              </section>

              <section className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-[1.65fr_1fr]">
                <div className="dashboard-card fade-up rounded-2xl p-5 sm:p-6">
                  <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-white/45">
                        Revenue analytics
                      </p>
                      <h3 className="mt-1 text-2xl font-bold">
                        Sales Overview
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-300">
                      <TrendingUp size={15} /> Actual order sales
                    </div>
                  </div>

                  <div className="mb-5">
                    <p className="text-xs text-white/35">
                      Total sales recorded
                    </p>
                    <h2 className="mt-1 text-3xl font-bold">
                      Rs. {totalSales.toLocaleString()}
                    </h2>
                  </div>

                  <div className="h-[260px] w-full">
                    {salesData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesData}>
                          <defs>
                            <linearGradient
                              id="salesGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#fb923c"
                                stopOpacity={0.35}
                              />
                              <stop
                                offset="95%"
                                stopColor="#fb923c"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            stroke="rgba(255,255,255,0.06)"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#817d76", fontSize: 12 }}
                            dy={10}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#817d76", fontSize: 11 }}
                            tickFormatter={(value) =>
                              `${value / 1000}k`
                            }
                          />
                          <Tooltip
                            contentStyle={{
                              background: "#24221e",
                              border: "1px solid #514033",
                              borderRadius: "12px",
                              color: "#fff",
                            }}
                            formatter={(value) => [
                              `Rs. ${Number(value).toLocaleString()}`,
                              "Sales",
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="sales"
                            stroke="#fb923c"
                            strokeWidth={3}
                            fill="url(#salesGradient)"
                            activeDot={{
                              r: 6,
                              fill: "#fb923c",
                              stroke: "#fff",
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-white/40">
                        No dated orders available for the sales graph yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="dashboard-card fade-up rounded-2xl p-6">
                  <div className="mb-7 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/45">
                        Business insights
                      </p>
                      <h3 className="mt-1 text-xl font-bold">
                        Order Performance
                      </h3>
                    </div>
                    <ChartNoAxesCombined
                      className="text-orange-300"
                      size={22}
                    />
                  </div>

                  <div className="mb-7 rounded-2xl bg-[#29231c] p-5">
                    <p className="text-xs text-white/40">
                      Average order value
                    </p>
                    <h3 className="mt-2 text-3xl font-bold">
                      Rs. {Math.round(averageOrderValue).toLocaleString()}
                    </h3>
                  </div>

                  <div className="mb-6">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-white/55">
                        Order completion
                      </span>
                      <span>{completionRate}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-5">
                    {statusItems.map((item) => {
                      const percentage =
                        totalOrders > 0
                          ? Math.round((item.count / totalOrders) * 100)
                          : 0;

                      return (
                        <div key={item.label}>
                          <div className="mb-2 flex justify-between text-sm">
                            <span className="text-white/55">
                              {item.label}
                            </span>
                            <span>
                              {item.count} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full ${item.color}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="dashboard-card fade-up overflow-hidden rounded-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
                  <div>
                    <p className="text-sm text-white/40">
                      Latest database activity
                    </p>
                    <h3 className="mt-1 text-xl font-bold">
                      Recent Orders
                    </h3>
                  </div>
                  <button
                    onClick={() => setActive("Orders")}
                    className="rounded-xl border border-orange-400/20 px-4 py-2 text-xs font-semibold text-orange-300 transition hover:bg-orange-400/10"
                  >
                    View all orders
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[750px] text-left text-sm">
                    <thead className="border-y border-white/[0.06] bg-white/[0.02] text-xs text-white/35">
                      <tr>
                        <th className="px-6 py-4 font-medium">Order ID</th>
                        <th className="px-6 py-4 font-medium">Customer</th>
                        <th className="px-6 py-4 font-medium">Item</th>
                        <th className="px-6 py-4 font-medium">Amount</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length > 0 ? (
                        orders.map((order: any, index: number) => (
                          <tr
                            key={order.id || index}
                            className="border-b border-white/[0.05] transition hover:bg-white/[0.025]"
                          >
                            <td className="px-6 py-4 font-semibold text-orange-300">
                              {order.id}
                            </td>
                            <td className="px-6 py-4 text-white/75">
                              {order.customer}
                            </td>
                            <td className="max-w-[250px] px-6 py-4 text-white/45">
                              {order.item}
                            </td>
                            <td className="px-6 py-4 font-medium">
                              Rs. {order.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${getStatusStyle(
                                  order.status
                                )}`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-white/45">
                              {order.date}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-10 text-center text-white/40"
                          >
                            No orders found in the database yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          <footer className="py-7 text-center text-[11px] tracking-wide text-white/25">
            CRAVEHUB ADMIN WORKSPACE · MADE FOR BETTER OPERATIONS
          </footer>
        </main>
      </div>
    </div>
  );
}
