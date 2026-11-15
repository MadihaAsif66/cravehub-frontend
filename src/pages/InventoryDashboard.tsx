
import { useEffect, useState } from "react";
import {
  Package,
  Search,
  Plus,
  RefreshCw,
  AlertTriangle,
  Boxes,
  X,
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

const API_URL = "http://localhost:5000/api/inventory";

export default function InventoryDashboard({ token }: InventoryDashboardProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [unit, setUnit] = useState("kg");
  const [threshold, setThreshold] = useState("5");

  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

      if (!response.ok) throw new Error("Could not load inventory");

      const data: InventoryItem[] = await response.json();
      setItems(data);
    } catch (error) {
      setMessage("Inventory load nahi hui. Backend check karo.");
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

      if (!response.ok) throw new Error(data.message);

      setMessage("New inventory item added successfully!");
      setName("");
      setQuantity("0");
      setUnit("kg");
      setThreshold("5");
      setShowForm(false);
      fetchInventory();
    } catch (error) {
      setMessage("Item add nahi hua. Dobara try karo.");
    }
  };

  const updateStock = async (id: string) => {
    const newQuantity = Number(stockInputs[id]);

    if (!Number.isFinite(newQuantity) || newQuantity < 0) {
      setMessage("Valid stock quantity enter karo.");
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

      if (!response.ok) throw new Error("Update failed");

      setMessage("Stock updated successfully!");
      fetchInventory();
    } catch (error) {
      setMessage("Stock update nahi hua.");
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
    <div className="min-h-screen bg-[#fffaf5] p-5 md:p-10">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-wrap justify-between items-center gap-4 mb-9">
          <div>
            <p className="text-orange-600 font-bold text-sm tracking-widest">
              CRAVEHUB MANAGEMENT
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-[#292522] mt-2">
              Inventory Dashboard
            </h1>
            <p className="text-gray-500 mt-2">
              Manage restaurant stock and ingredients
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchInventory}
              className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw size={19} />
            </button>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-orange-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-orange-700"
            >
              <Plus size={19} />
              Add Item
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-5 p-4 rounded-xl bg-orange-50 text-orange-800 flex justify-between gap-3">
            <span>{message}</span>
            <button onClick={() => setMessage("")}>
              <X size={18} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-orange-100">
            <Package className="text-orange-600 mb-4" size={27} />
            <p className="text-gray-500 text-sm">Total Items</p>
            <h2 className="text-3xl font-black mt-1">{items.length}</h2>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-orange-100">
            <Boxes className="text-orange-600 mb-4" size={27} />
            <p className="text-gray-500 text-sm">Total Stock Quantity</p>
            <h2 className="text-3xl font-black mt-1">{totalQuantity}</h2>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-orange-100">
            <AlertTriangle className="text-red-500 mb-4" size={27} />
            <p className="text-gray-500 text-sm">Low Stock Items</p>
            <h2 className="text-3xl font-black mt-1 text-red-600">
              {lowStockItems.length}
            </h2>
          </div>
        </div>

        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-8">
            <h3 className="font-bold text-red-700 flex items-center gap-2 mb-3">
              <AlertTriangle size={20} />
              Low Stock Alerts
            </h3>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map((item) => (
                <span
                  key={item._id}
                  className="bg-white text-red-700 px-3 py-2 rounded-lg text-sm font-semibold"
                >
                  {item.name}: {item.quantity} {item.unit}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 md:p-6 flex flex-wrap justify-between items-center gap-4 border-b">
            <div>
              <h2 className="text-xl font-bold text-[#292522]">
                Stock Inventory
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                View and update available ingredients
              </p>
            </div>

            <div className="flex items-center gap-2 border rounded-xl px-3 py-2 w-full sm:w-64">
              <Search size={18} className="text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ingredients..."
                className="outline-none w-full text-sm"
              />
            </div>
          </div>

          {loading ? (
            <p className="p-10 text-center text-gray-500">
              Loading inventory...
            </p>
          ) : filteredItems.length === 0 ? (
            <p className="p-10 text-center text-gray-500">
              No inventory items found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[650px]">
                <thead className="bg-[#fffaf5] text-gray-500 text-sm">
                  <tr>
                    <th className="p-4">Ingredient</th>
                    <th className="p-4">Available Stock</th>
                    <th className="p-4">Minimum Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Update Stock</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map((item) => {
                    const isLow =
                      item.quantity <= item.lowStockThreshold;

                    return (
                      <tr key={item._id} className="border-t">
                        <td className="p-4 font-semibold text-[#292522]">
                          {item.name}
                        </td>

                        <td className="p-4">
                          {item.quantity} {item.unit}
                        </td>

                        <td className="p-4">
                          {item.lowStockThreshold} {item.unit}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              isLow
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {isLow ? "Low Stock" : "In Stock"}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="0"
                              value={stockInputs[item._id] ?? String(item.quantity)}
                              onChange={(e) =>
                                setStockInputs((prev) => ({
                                  ...prev,
                                  [item._id]: e.target.value,
                                }))
                              }
                              className="w-20 border rounded-lg px-2 py-2 text-sm"
                            />
                            <button
                              onClick={() => updateStock(item._id)}
                              className="bg-[#292522] text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-orange-600"
                            >
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

        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <form
              onSubmit={addItem}
              className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Add Inventory Item</h2>
                <button type="button" onClick={() => setShowForm(false)}>
                  <X />
                </button>
              </div>

              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingredient name"
                className="w-full border rounded-xl p-3"
              />

              <input
                required
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Quantity"
                className="w-full border rounded-xl p-3"
              />

              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border rounded-xl p-3"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="liters">Liters</option>
                <option value="pieces">Pieces</option>
                <option value="packets">Packets</option>
              </select>

              <input
                required
                type="number"
                min="0"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="Low stock threshold"
                className="w-full border rounded-xl p-3"
              />

              <button
                type="submit"
                className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700"
              >
                Save Inventory Item
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
