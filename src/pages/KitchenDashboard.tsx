
import { useEffect, useState } from "react";
import {
  ChefHat,
  RefreshCw,
  Clock3,
  Flame,
  CheckCircle2,
  ClipboardList,
  Search,
  PackageCheck,
  Utensils,
  ArrowUpRight,
} from "lucide-react";

type OrderItem = {
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  _id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
};

type KitchenDashboardProps = {
  token: string;
  role: string;
};

function KitchenDashboard({ token, role }: KitchenDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "https://cravehub-backend.netlify.app/api/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data: Order[] = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Orders fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(
        `https://cravehub-backend.netlify.app/api/orders/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        console.error("Backend Error:", responseText);
        throw new Error(responseText);
      }

      await fetchOrders();
    } catch (error) {
      console.error("Status update error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Could not update order status."
      );
    }
  };

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  );

  const preparingOrders = orders.filter(
    (order) => order.status === "Preparing"
  );

  const readyOrders = orders.filter(
    (order) => order.status === "Ready"
  );

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === "All" || order.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const statusStyle = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Preparing":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Ready":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Completed":
        return "bg-white/10 text-gray-400 border-white/10";
      default:
        return "bg-white/10 text-gray-400 border-white/10";
    }
  };

  return (
    <div className="min-h-screen bg-[#101114] text-white">
      <div className="max-w-[1500px] mx-auto p-5 md:p-8 lg:p-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <ChefHat size={26} className="text-orange-400" />
              </div>

              <div>
                <p className="text-orange-400 text-xs font-bold tracking-[3px] uppercase">
                  CraveHub Operations
                </p>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Kitchen Dashboard
                </h1>
              </div>
            </div>

            <p className="text-gray-500 text-sm">
              Manage incoming orders and keep the kitchen running smoothly.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right mr-2">
              <p className="text-xs text-gray-500">Logged in as</p>
              <p className="text-sm font-semibold text-gray-200">{role}</p>
            </div>

            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 bg-[#1b1c21] border border-white/10 px-5 py-3 rounded-xl text-sm font-semibold hover:border-orange-500/40 hover:bg-[#23242a] transition disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh Orders
            </button>
          </div>
        </div>

        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#292019] via-[#211b18] to-[#171719] border border-orange-500/15 p-6 md:p-8 mb-8">
          <div className="absolute -right-10 -top-20 w-64 h-64 bg-orange-500/10 blur-3xl rounded-full" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <span className="text-orange-400 text-xs font-bold tracking-[2px] uppercase">
                Kitchen Control Center
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mt-3">
                Every order matters.
              </h2>
              <p className="text-gray-400 text-sm mt-2 max-w-xl">
                Track customer orders, prepare meals and keep every order
                moving through the kitchen.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-black/20 border border-white/10 rounded-2xl px-5 py-4">
              <div className="w-11 h-11 bg-orange-500/15 rounded-xl flex items-center justify-center">
                <Utensils className="text-orange-400" size={23} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Your workspace</p>
                <p className="font-bold">Kitchen Operations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">

          <div className="bg-[#191a1f] border border-white/[0.06] rounded-2xl p-6 hover:border-orange-500/30 transition">
            <div className="flex justify-between items-center">
              <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <ClipboardList className="text-orange-400" size={22} />
              </div>
              <ArrowUpRight className="text-gray-600" size={19} />
            </div>
            <p className="text-gray-500 text-sm mt-5">Total Orders</p>
            <h3 className="text-3xl font-bold mt-1">{orders.length}</h3>
            <p className="text-xs text-gray-600 mt-2">All received orders</p>
          </div>

          <div className="bg-[#191a1f] border border-white/[0.06] rounded-2xl p-6 hover:border-amber-500/30 transition">
            <div className="flex justify-between items-center">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock3 className="text-amber-400" size={22} />
              </div>
              <span className="text-xs text-amber-400">Waiting</span>
            </div>
            <p className="text-gray-500 text-sm mt-5">Pending Orders</p>
            <h3 className="text-3xl font-bold mt-1">{pendingOrders.length}</h3>
            <p className="text-xs text-gray-600 mt-2">Awaiting preparation</p>
          </div>

          <div className="bg-[#191a1f] border border-white/[0.06] rounded-2xl p-6 hover:border-blue-500/30 transition">
            <div className="flex justify-between items-center">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Flame className="text-blue-400" size={22} />
              </div>
              <span className="text-xs text-blue-400">Active</span>
            </div>
            <p className="text-gray-500 text-sm mt-5">Preparing Orders</p>
            <h3 className="text-3xl font-bold mt-1">{preparingOrders.length}</h3>
            <p className="text-xs text-gray-600 mt-2">Currently in kitchen</p>
          </div>

          <div className="bg-[#191a1f] border border-white/[0.06] rounded-2xl p-6 hover:border-emerald-500/30 transition">
            <div className="flex justify-between items-center">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <PackageCheck className="text-emerald-400" size={22} />
              </div>
              <span className="text-xs text-emerald-400">Ready</span>
            </div>
            <p className="text-gray-500 text-sm mt-5">Ready Orders</p>
            <h3 className="text-3xl font-bold mt-1">{readyOrders.length}</h3>
            <p className="text-xs text-gray-600 mt-2">Awaiting completion</p>
          </div>

        </div>

        {/* Orders section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-6">
          <div>
            <p className="text-orange-400 text-xs font-bold tracking-[2px] uppercase">
              Live Order Management
            </p>
            <h2 className="text-2xl font-bold mt-2">Incoming Orders</h2>
          </div>

          <div className="relative w-full md:w-72">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer or order..."
              className="w-full bg-[#191a1f] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-orange-500/50 placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-7">
          {["All", "Pending", "Preparing", "Ready", "Completed"].map(
            (filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                  activeFilter === filter
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-[#191a1f] text-gray-400 border-white/10 hover:border-orange-500/40 hover:text-white"
                }`}
              >
                {filter}
                <span className="ml-2 opacity-70">
                  {filter === "All"
                    ? orders.length
                    : orders.filter((order) => order.status === filter).length}
                </span>
              </button>
            )
          )}
        </div>

        {/* Order cards */}
        {loading ? (
          <div className="bg-[#191a1f] border border-white/10 rounded-2xl p-12 text-center">
            <RefreshCw className="animate-spin text-orange-400 mx-auto mb-4" size={30} />
            <p className="text-gray-400">Loading kitchen orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-[#191a1f] border border-white/10 rounded-2xl p-12 text-center">
            <ChefHat className="text-gray-600 mx-auto mb-4" size={42} />
            <h3 className="text-xl font-bold">No orders found</h3>
            <p className="text-gray-500 text-sm mt-2">
              No orders match your current search or filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-[#191a1f] border border-white/[0.07] rounded-2xl p-6 hover:border-orange-500/30 transition duration-300"
              >
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Order Reference
                    </p>
                    <h3 className="text-lg font-bold mt-1">
                      #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-gray-400 text-sm mt-2">
                      Customer:{" "}
                      <span className="text-white font-medium">
                        {order.customerName}
                      </span>
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="bg-[#111216] rounded-xl border border-white/[0.05] p-4 space-y-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
                    <Utensils size={15} className="text-orange-400" />
                    Order Items
                  </div>

                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center gap-3 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 font-bold text-xs">
                          {item.quantity}x
                        </span>
                        <span className="text-gray-200">{item.name}</span>
                      </div>
                      <span className="text-gray-400 whitespace-nowrap">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-5 pt-4 border-t border-white/[0.07]">
                  <span className="text-gray-500 text-sm">Order Total</span>
                  <span className="text-xl font-bold text-orange-400">
                    Rs. {order.total.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 mt-5">
                  {order.status === "Pending" && role === "Kitchen Staff" && (
                    <button
                      onClick={() => updateStatus(order._id, "Preparing")}
                      className="flex-1 flex justify-center items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-3 rounded-xl font-semibold text-sm hover:bg-blue-500 hover:text-white transition"
                    >
                      <Flame size={17} />
                      Start Preparing
                    </button>
                  )}

                  {order.status === "Preparing" && role === "Manager" && (
                    <button
                      onClick={() => updateStatus(order._id, "Ready")}
                      className="flex-1 flex justify-center items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-3 rounded-xl font-semibold text-sm hover:bg-emerald-500 hover:text-white transition"
                    >
                      <CheckCircle2 size={17} />
                      Mark Ready
                    </button>
                  )}

                  {order.status === "Ready" && role === "Manager" && (
                    <button
                      onClick={() => updateStatus(order._id, "Completed")}
                      className="flex-1 flex justify-center items-center gap-2 bg-white/10 text-gray-200 border border-white/10 px-4 py-3 rounded-xl font-semibold text-sm hover:bg-white/20 transition"
                    >
                      <PackageCheck size={17} />
                      Complete Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center text-gray-600 text-xs mt-12 pb-4">
          CraveHub Kitchen Operations · Staff Workspace
        </div>

      </div>
    </div>
  );
}

export default KitchenDashboard;
