
import { useEffect, useState } from "react";
import { ChefHat, RefreshCw } from "lucide-react";

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

  const fetchOrders = async () => {
    try {
      const response = await fetch("https://cravehub-backend.netlify.app/api/orders", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

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
  }, []);


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


  return (
    <div className="min-h-screen bg-[#fffaf5] p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3">
              <ChefHat className="text-orange-600" size={36} />
              <h1 className="text-3xl font-bold text-[#292522]">
                Kitchen Dashboard
              </h1>
            </div>
            <p className="text-gray-500 mt-2">
              Manage and prepare customer orders
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-white border px-5 py-3 rounded-xl hover:bg-orange-50"
          >
            <RefreshCw size={18} />
            Refresh Orders
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-gray-500">Total Orders</p>
            <h2 className="text-3xl font-bold mt-2">{orders.length}</h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-gray-500">Pending Orders</p>
            <h2 className="text-3xl font-bold text-orange-600 mt-2">
              {orders.filter((order) => order.status === "Pending").length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-gray-500">Preparing Orders</p>
            <h2 className="text-3xl font-bold text-blue-600 mt-2">
              {orders.filter((order) => order.status === "Preparing").length}
            </h2>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-5">All Orders</h2>

        {loading ? (
          <p className="text-gray-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="bg-white p-8 rounded-2xl text-gray-500">
            No orders found.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100"
              >
                <div className="flex justify-between items-start gap-3 mb-5">
                  <div>
                    <p className="text-sm text-gray-400">Order ID</p>
                    <h3 className="font-bold break-all">
                      #{order._id.slice(-8)}
                    </h3>
                    <p className="text-gray-600 mt-2">
                      {order.customerName}
                    </p>
                  </div>

                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                    {order.status}
                  </span>
                </div>

                <div className="border-t border-b py-4 space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between gap-3">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        Rs. {item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between font-bold text-lg mt-4">
                  <span>Total</span>
                  <span>Rs. {order.total}</span>
                </div>

               
<div className="flex flex-wrap gap-3 mt-5">
  {order.status === "Pending" && role === "Kitchen Staff" && (
    <button
      onClick={() => updateStatus(order._id, "Preparing")}
      className="bg-blue-600 text-white px-4 py-2 rounded-xl"
    >
      Start Preparing
    </button>
  )}

  {order.status === "Preparing" && role === "Manager" && (
    <button
      onClick={() => updateStatus(order._id, "Ready")}
      className="bg-green-600 text-white px-4 py-2 rounded-xl"
    >
      Mark Ready
    </button>
  )}

  {order.status === "Ready" && role === "Manager" && (
    <button
      onClick={() => updateStatus(order._id, "Completed")}
      className="bg-gray-800 text-white px-4 py-2 rounded-xl"
    >
      Complete Order
    </button>
  )}
</div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default KitchenDashboard;
