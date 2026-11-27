
import { useEffect, useState } from "react";
import {
  Package,
  Search,
  Plus,
  RefreshCw,
  AlertTriangle,
  Boxes,
  X,
  CheckCircle2,
  TrendingUp,
  Warehouse,
  Save,
  Layers3,
} from "lucide-react";

type InventoryItem = {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
};

type InventoryDashboardProps = {
  token: string;
};

const API_URL = "https://cravehub-backend.netlify.app/api/inventory";

export default function InventoryDashboard({
  token,
}: InventoryDashboardProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [unit, setUnit] = useState("kg");
  const [threshold, setThreshold] = useState("5");

  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});

  const showNotification = (text: string, error = false) => {
    setMessage(text);
    setMessageError(error);
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Could not load inventory");
      }

      const data: InventoryItem[] = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Inventory error:", error);
      showNotification("Inventory load nahi hui. Backend check karo.", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [token]);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          quantity: Number(quantity),
          unit,
          lowStockThreshold: Number(threshold),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Item add nahi hua.");
      }

      showNotification("New inventory item added successfully!");
      setName("");
      setQuantity("0");
      setUnit("kg");
      setThreshold("5");
      setShowForm(false);
      await fetchInventory();
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Item add nahi hua.",
        true
      );
    }
  };

  const updateStock = async (id: string) => {
    const newQuantity = Number(stockInputs[id]);

    if (
      stockInputs[id] === undefined ||
      !Number.isFinite(newQuantity) ||
      newQuantity < 0
    ) {
      showNotification("Valid stock quantity enter karo.", true);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error("Stock update failed");
      }

      showNotification("Stock updated successfully!");
      await fetchInventory();

      setStockInputs((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (error) {
      console.error("Stock update error:", error);
      showNotification("Stock update nahi hua. Dobara try karo.", true);
    }
  };

  const lowStockItems = items.filter(
    (item) => item.quantity <= item.lowStockThreshold
  );

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-[#101114] text-white">
      <div className="max-w-[1500px] mx-auto p-5 md:p-8 lg:p-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Warehouse size={29} className="text-orange-400" />
            </div>

            <div>
              <p className="text-orange-400 text-xs font-bold tracking-[3px] uppercase">
                CraveHub Management
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">
                Inventory Dashboard
              </h1>
              <p className="text-gray-500 text-sm mt-2">
                Manage ingredients, stock levels and supplies.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchInventory}
              disabled={loading}
              className="flex items-center gap-2 bg-[#1b1c21] border border-white/10 px-4 py-3 rounded-xl text-sm hover:border-orange-500/40 transition disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-semibold text-sm transition shadow-lg shadow-orange-500/10"
            >
              <Plus size={19} />
              Add Item
            </button>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#292019] via-[#211b18] to-[#171719] border border-orange-500/15 p-6 md:p-8 mb-8">
          <div className="absolute -right-10 -top-20 w-64 h-64 bg-orange-500/10 blur-3xl rounded-full" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <span className="text-orange-400 text-xs font-bold tracking-[2px] uppercase">
                Stock Control Center
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mt-3">
                Everything in stock. Everything in control.
              </h2>
              <p className="text-gray-400 text-sm mt-2 max-w-xl">
                Monitor restaurant ingredients, manage quantities and stay
                ahead of low-stock alerts.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-black/20 border border-white/10 rounded-2xl px-5 py-4">
              <div className="w-11 h-11 bg-orange-500/15 rounded-xl flex items-center justify-center">
                <Boxes className="text-orange-400" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Inventory Workspace</p>
                <p className="font-bold">Stock Management</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notification */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex justify-between items-center gap-3 border ${
              messageError
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              {messageError ? (
                <AlertTriangle size={19} />
              ) : (
                <CheckCircle2 size={19} />
              )}
              {message}
            </div>

            <button onClick={() => setMessage("")}>
              <X size={18} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">

          <div className="bg-[#191a1f] border border-white/[0.06] rounded-2xl p-6 hover:border-orange-500/30 transition">
            <div className="flex justify-between items-center">
              <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Package className="text-orange-400" size={23} />
              </div>
              <TrendingUp className="text-gray-600" size={19} />
            </div>
            <p className="text-gray-500 text-sm mt-5">Total Items</p>
            <h3 className="text-3xl font-bold mt-1">{items.length}</h3>
            <p className="text-xs text-gray-600 mt-2">
              Registered ingredients
            </p>
          </div>

          <div className="bg-[#191a1f] border border-white/[0.06] rounded-2xl p-6 hover:border-blue-500/30 transition">
            <div className="flex justify-between items-center">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Layers3 className="text-blue-400" size={23} />
              </div>
              <Boxes className="text-gray-600" size={19} />
            </div>
            <p className="text-gray-500 text-sm mt-5">Total Stock Quantity</p>
            <h3 className="text-3xl font-bold mt-1">
              {totalQuantity.toLocaleString()}
            </h3>
            <p className="text-xs text-gray-600 mt-2">
              Combined stock quantity
            </p>
          </div>

          <div className="bg-[#191a1f] border border-white/[0.06] rounded-2xl p-6 hover:border-red-500/30 transition">
            <div className="flex justify-between items-center">
              <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="text-red-400" size={23} />
              </div>
              <span className="text-xs text-red-400">Attention</span>
            </div>
            <p className="text-gray-500 text-sm mt-5">Low Stock Items</p>
            <h3 className="text-3xl font-bold mt-1 text-red-400">
              {lowStockItems.length}
            </h3>
            <p className="text-xs text-gray-600 mt-2">
              Need stock replenishment
            </p>
          </div>

        </div>

        {/* Low Stock Alerts */}
        <div className="bg-[#191a1f] border border-white/[0.07] rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="text-red-400" size={21} />
            </div>
            <div>
              <h2 className="font-bold text-lg">Low Stock Alerts</h2>
              <p className="text-gray-500 text-xs mt-1">
                Ingredients that need attention
              </p>
            </div>
            <span className="ml-auto bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold">
              {lowStockItems.length} Alerts
            </span>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5 flex items-center gap-3">
              <CheckCircle2 className="text-emerald-400" size={21} />
              <p className="text-sm text-emerald-400">
                All ingredients are above their minimum stock levels.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStockItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-red-500/5 border border-red-500/15 rounded-xl p-4"
                >
                  <p className="font-semibold text-gray-200">{item.name}</p>
                  <p className="text-red-400 text-sm mt-2">
                    {item.quantity} {item.unit} remaining
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Minimum: {item.lowStockThreshold} {item.unit}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory Table */}
        <div className="bg-[#191a1f] border border-white/[0.07] rounded-2xl overflow-hidden">

          <div className="p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/[0.07]">
            <div>
              <p className="text-orange-400 text-xs font-bold tracking-[2px] uppercase">
                Stock Overview
              </p>
              <h2 className="text-xl font-bold mt-2">Stock Inventory</h2>
              <p className="text-gray-500 text-sm mt-1">
                View and update available ingredients.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#111216] border border-white/10 rounded-xl px-3 py-3 w-full md:w-72">
              <Search size={18} className="text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ingredients..."
                className="bg-transparent outline-none w-full text-sm text-white placeholder:text-gray-600"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw
                className="animate-spin text-orange-400 mx-auto mb-4"
                size={28}
              />
              <p className="text-gray-400 text-sm">Loading inventory...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="text-gray-600 mx-auto mb-4" size={38} />
              <h3 className="font-bold text-lg">No inventory items found</h3>
              <p className="text-gray-500 text-sm mt-2">
                Try another search or add a new ingredient.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[750px]">
                <thead className="bg-[#111216] text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-5">Ingredient</th>
                    <th className="p-5">Available Stock</th>
                    <th className="p-5">Minimum Stock</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Update Stock</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map((item) => {
                    const isLow =
                      item.quantity <= item.lowStockThreshold;

                    return (
                      <tr
                        key={item._id}
                        className="border-t border-white/[0.06] hover:bg-white/[0.02] transition"
                      >
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                              <Package size={18} className="text-orange-400" />
                            </div>
                            <span className="font-semibold text-gray-200">
                              {item.name}
                            </span>
                          </div>
                        </td>

                        <td className="p-5 text-gray-300">
                          {item.quantity} {item.unit}
                        </td>

                        <td className="p-5 text-gray-400">
                          {item.lowStockThreshold} {item.unit}
                        </td>

                        <td className="p-5">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                              isLow
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            }`}
                          >
                            {isLow ? "Low Stock" : "In Stock"}
                          </span>
                        </td>

                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={
                                stockInputs[item._id] ??
                                String(item.quantity)
                              }
                              onChange={(e) =>
                                setStockInputs((prev) => ({
                                  ...prev,
                                  [item._id]: e.target.value,
                                }))
                              }
                              className="w-20 bg-[#111216] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50"
                            />

                            <button
                              onClick={() => updateStock(item._id)}
                              className="flex items-center gap-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-2 rounded-lg text-xs font-bold hover:bg-orange-500 hover:text-white transition"
                            >
                              <Save size={14} />
                              Save
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-center text-gray-600 text-xs mt-12 pb-4">
          CraveHub Inventory Management · Staff Workspace
        </div>

        {/* Add Item Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={addItem}
              className="bg-[#191a1f] border border-white/10 w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-7">
                <div>
                  <p className="text-orange-400 text-xs font-bold tracking-[2px] uppercase">
                    Inventory Management
                  </p>
                  <h2 className="text-2xl font-bold mt-2">
                    Add New Item
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-10 h-10 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition flex items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Ingredient Name
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chicken, Cheese, Flour"
                    className="w-full bg-[#111216] border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-orange-500/50 placeholder:text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Initial Quantity
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    className="w-full bg-[#111216] border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-orange-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-[#111216] border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-orange-500/50"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="liters">Liters</option>
                    <option value="pieces">Pieces</option>
                    <option value="packets">Packets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Low Stock Threshold
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    placeholder="Minimum stock level"
                    className="w-full bg-[#111216] border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-7 bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2"
              >
                <Plus size={19} />
                Save Inventory Item
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
