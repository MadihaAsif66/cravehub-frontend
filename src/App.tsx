
import { useState, useRef, useEffect } from "react";
import {
  Search,
  ShoppingBag,
  UserRound,
  ArrowRight,
  Star,
  Plus,
  Minus,
  Trash2,
  X,
  Clock,
  MapPin,
  ChefHat,
  Truck,
  ShieldCheck,
  Heart,
  Utensils,
  ChevronRight,
  Sparkles,
  Menu as MenuIcon,
} from "lucide-react";

import KitchenDashboard from "./pages/KitchenDashboard";
import InventoryDashboard from "./pages/InventoryDashboard";
import AuthModal from "./AuthModal";

type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: "Customer" | "Kitchen Staff" | "Manager" | "Admin";
};

type FoodItem = {
  id: string;
  name: string;
  price: number;
  rating: string;
  image: string;
  description: string;
  category: string;
  isAvailable: boolean;
};

type ApiMenuItem = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
};

type CartItem = FoodItem & {
  quantity: number;
};

type CustomerOrder = {
  id: string;
  date: string;
  customerName: string;
  email: string;
  address: string;
  phone: string;
  items: {
    id: string | number;
    name: string;
    price: number;
    quantity: number;
    rating?: string;
    image?: string;
  }[];
  total: number;
  status: string;
};

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersOpen, setOrdersOpen] = useState(false);

  const checkoutRef = useRef<HTMLElement>(null);

  const [apiMenuItems, setApiMenuItems] = useState<ApiMenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [kitchenOpen, setKitchenOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [authToken, setAuthToken] = useState<string | null>(
    () => localStorage.getItem("cravehub_token")
  );

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const savedUser = localStorage.getItem("cravehub_user");
      return savedUser ? (JSON.parse(savedUser) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  }

  useEffect(() => {
    let active = true;

    const fetchMenu = async () => {
      try {
        setMenuLoading(true);
        setMenuError("");

        const response = await fetch("http://localhost:5000/api/menu");

        if (!response.ok) {
          throw new Error("Unable to load menu");
        }

        const data = await response.json();

        if (active) {
          setApiMenuItems(Array.isArray(data) ? data : data.items || []);
        }
      } catch (error) {
        console.error("Menu fetch error:", error);

        if (active) {
          setMenuError(
            "We couldn't load the menu. Please check your connection and try again."
          );
        }
      } finally {
        if (active) setMenuLoading(false);
      }
    };

    fetchMenu();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!authToken || !currentUser || currentUser.role !== "Customer") {
      setOrders([]);
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/orders/my-orders",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load your orders");
        }

        const data = await response.json();

        setOrders(
          (Array.isArray(data) ? data : data.orders || []).map(
            (order: any) => ({
              id: order._id,
              date: new Date(order.createdAt).toLocaleDateString(),
              customerName: order.customerName,
              email: order.email,
              address: order.address,
              phone: order.phone,
              items: order.items.map((item: any, index: number) => ({
                id: index + 1,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                rating: "4.9",
                image: "",
              })),
              total: order.total,
              status: order.status,
            })
          )
        );
      } catch (error) {
        console.error("My Orders Error:", error);
      }
    };

    fetchMyOrders();
  }, [authToken, currentUser]);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const categories = [
    "All",
    ...Array.from(
      new Set(
        apiMenuItems
          .map((item) =>
            typeof item.category === "string"
              ? item.category
              : String(item.category || "")
          )
          .filter(Boolean)
      )
    ),
  ];

  const foodItems: FoodItem[] = apiMenuItems
    .filter((item) => {
      const matchesAvailability = item.isAvailable !== false;

      const matchesCategory =
        selectedCategory === "All" ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesAvailability && matchesCategory && matchesSearch;
    })
    .map((item) => ({
      id: item._id,
      name: item.name,
      price: item.price,
      rating: "4.9",
      image: item.image,
      description: item.description || "Freshly prepared with quality ingredients.",
      category: item.category || "Special",
      isAvailable: item.isAvailable !== false,
    }));

  function addToCart(food: FoodItem) {
    setCart((previousCart) => {
      const existingItem = previousCart.find(
        (item) => item.id === food.id
      );

      if (existingItem) {
        return previousCart.map((item) =>
          item.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previousCart, { ...food, quantity: 1 }];
    });

    showToast(`${food.name} added to your cart`);
  }

  function increaseQuantity(id: string) {
    setCart((previousCart) =>
      previousCart.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function decreaseQuantity(id: string) {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id: string) {
    setCart((previousCart) =>
      previousCart.filter((item) => item.id !== id)
    );

    showToast("Item removed from cart");
  }

  function openCheckout() {
    if (!currentUser || !authToken) {
      setCartOpen(false);
      setAuthOpen(true);
      showToast("Please sign in before placing your order");
      return;
    }

    if (currentUser.role !== "Customer") {
      showToast("Please use a customer account to place an order");
      return;
    }

    setCartOpen(false);
    setCheckoutOpen(true);

    window.setTimeout(() => {
      checkoutRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  }

  function logout() {
    localStorage.removeItem("cravehub_token");
    localStorage.removeItem("cravehub_user");

    setCurrentUser(null);
    setAuthToken(null);
    setOrders([]);
    setKitchenOpen(false);
    setInventoryOpen(false);

    showToast("You have been signed out");
  }

  if (kitchenOpen) {
    if (
      !currentUser ||
      !["Kitchen Staff", "Manager", "Admin"].includes(currentUser.role)
    ) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F8F3EA]">
          <ShieldCheck size={54} className="text-orange-600" />
          <h2 className="text-3xl font-bold text-[#29231F]">
            Access Denied
          </h2>
          <p className="text-gray-500">
            Please sign in with an authorized staff account.
          </p>
          <button
            onClick={() => {
              setKitchenOpen(false);
              setAuthOpen(true);
            }}
            className="bg-orange-600 text-white px-6 py-3 rounded-full"
          >
            Sign In
          </button>
        </div>
      );
    }

    return (
      <>
        <button
          onClick={() => setKitchenOpen(false)}
          className="bg-orange-600 text-white px-5 py-3 rounded-xl m-5"
        >
          ← Back to CraveHub
        </button>
        <KitchenDashboard
          token={authToken ?? ""}
          role={currentUser.role}
        />
      </>
    );
  }

  if (inventoryOpen) {
    if (
      !currentUser ||
      !["Manager", "Admin"].includes(currentUser.role)
    ) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F8F3EA]">
          <ShieldCheck size={54} className="text-orange-600" />
          <h2 className="text-3xl font-bold text-[#29231F]">
            Access Denied
          </h2>
          <p className="text-gray-500">
            Please sign in with an authorized manager account.
          </p>
          <button
            onClick={() => {
              setInventoryOpen(false);
              setAuthOpen(true);
            }}
            className="bg-orange-600 text-white px-6 py-3 rounded-full"
          >
            Sign In
          </button>
        </div>
      );
    }

    return (
      <>
        <button
          onClick={() => setInventoryOpen(false)}
          className="bg-orange-600 text-white px-5 py-3 rounded-xl m-5"
        >
          ← Back to CraveHub
        </button>
        <InventoryDashboard token={authToken ?? ""} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F3EA] text-[#29231F] overflow-x-hidden">
      <style>{`
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        * { box-sizing: border-box; }
        ::selection { background: #E85D24; color: white; }
        .premium-card { transition: transform .3s ease, box-shadow .3s ease; }
        .premium-card:hover { transform: translateY(-7px); box-shadow: 0 20px 45px rgba(41,35,31,.12); }
        .food-image { transition: transform .6s ease; }
        .premium-card:hover .food-image { transform: scale(1.06); }
        .hero-glow { background: radial-gradient(circle, rgba(232,93,36,.22), transparent 68%); }
        .soft-shadow { box-shadow: 0 15px 45px rgba(41,35,31,.08); }
        .orange-gradient { background: linear-gradient(135deg,#E85D24,#B94318); }
        .dark-gradient { background: linear-gradient(135deg,#29231F,#44352C); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gentleFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }
        .fade-up { animation: fadeUp .7s ease both; }
        .float-animation { animation: gentleFloat 4s ease-in-out infinite; }
        button, a { -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[120] bg-[#29231F] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-[90%]">
          <span className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
            ✓
          </span>
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}

      {/* Top announcement */}
      <div className="bg-[#29231F] text-white text-center py-2.5 px-4 text-xs md:text-sm tracking-wide">
        <Sparkles size={14} className="inline mr-2 text-orange-400" />
        Fresh flavours, unforgettable moments — made just for you.
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-[#F8F3EA]/95 backdrop-blur-xl border-b border-[#29231F]/10">
        <div className="max-w-[1400px] mx-auto px-5 md:px-12 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center text-white">
              <Utensils size={21} />
            </div>
            <span className="text-2xl md:text-3xl font-black tracking-tight">
              CraveHub<span className="text-[#E85D24]">.</span>
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-9 text-sm font-semibold text-[#655B53]">
            <a href="#" className="text-[#E85D24]">Home</a>
            <a href="#menu" className="hover:text-[#E85D24] transition">Our Menu</a>
            <a href="#about" className="hover:text-[#E85D24] transition">Our Story</a>
            <a href="#reviews" className="hover:text-[#E85D24] transition">Reviews</a>
            <a href="#contact" className="hover:text-[#E85D24] transition">Contact</a>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => {
                document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
                window.setTimeout(() => {
                  document.getElementById("menu-search")?.focus();
                }, 500);
              }}
              className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full hover:bg-white transition"
              aria-label="Search menu"
            >
              <Search size={19} />
            </button>

            <button
              onClick={() => setCartOpen(true)}
              className="relative w-10 h-10 rounded-full hover:bg-white flex items-center justify-center"
              aria-label="Open cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E85D24] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setOrdersOpen(true)}
              className="hidden md:block border border-[#29231F]/20 px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-white transition"
            >
              My Orders
            </button>

            {(currentUser?.role === "Kitchen Staff" ||
              currentUser?.role === "Manager" ||
              currentUser?.role === "Admin") && (
              <button
                onClick={() => setKitchenOpen(true)}
                className="hidden xl:block bg-[#29231F] text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-[#E85D24]"
              >
                Kitchen
              </button>
            )}

            {(currentUser?.role === "Manager" ||
              currentUser?.role === "Admin") && (
              <button
                onClick={() => setInventoryOpen(true)}
                className="hidden xl:block bg-[#899477] text-white px-4 py-2.5 rounded-full text-sm font-semibold"
              >
                Inventory
              </button>
            )}

            {currentUser ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm font-bold max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <button
                  onClick={logout}
                  className="border border-[#E85D24] text-[#E85D24] px-4 py-2 rounded-full text-sm font-bold hover:bg-[#E85D24] hover:text-white transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="hidden md:flex items-center gap-2 orange-gradient text-white px-5 py-3 rounded-full text-sm font-bold shadow-lg shadow-orange-900/10 hover:scale-105 transition"
              >
                <UserRound size={16} />
                Sign In
              </button>
            )}

            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#F8F3EA] border-t border-[#29231F]/10 px-6 py-5 space-y-4">
            <a href="#menu" onClick={() => setMobileMenuOpen(false)} className="block font-semibold">Our Menu</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block font-semibold">Our Story</a>
            <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="block font-semibold">Reviews</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block font-semibold">Contact</a>
            <button onClick={() => { setOrdersOpen(true); setMobileMenuOpen(false); }} className="block font-semibold">My Orders</button>
            {currentUser ? (
              <button onClick={logout} className="block text-[#E85D24] font-bold">Logout</button>
            ) : (
              <button onClick={() => { setAuthOpen(true); setMobileMenuOpen(false); }} className="block text-[#E85D24] font-bold">Sign In</button>
            )}
            {currentUser && ["Kitchen Staff", "Manager", "Admin"].includes(currentUser.role) && (
              <button onClick={() => { setKitchenOpen(true); setMobileMenuOpen(false); }} className="block font-semibold">Kitchen Dashboard</button>
            )}
            {currentUser && ["Manager", "Admin"].includes(currentUser.role) && (
              <button onClick={() => { setInventoryOpen(true); setMobileMenuOpen(false); }} className="block font-semibold">Inventory Management</button>
            )}
          </div>
        )}
      </nav>

      {/* Checkout */}
      {checkoutOpen && (
        <section
          ref={checkoutRef}
          className="max-w-3xl mx-auto px-5 py-14"
        >
          <button
            onClick={() => setCheckoutOpen(false)}
            className="text-[#E85D24] font-bold mb-6"
          >
            ← Back to Menu
          </button>

          <div className="bg-white rounded-[30px] soft-shadow p-6 md:p-10">
            <span className="text-[#E85D24] text-sm font-bold tracking-widest">ALMOST THERE</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2">Complete your order</h2>
            <p className="text-gray-500 mt-2 mb-8">Add your delivery details below.</p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();

                if (!authToken || !currentUser) {
                  setAuthOpen(true);
                  return;
                }

                if (currentUser.role !== "Customer") {
                  showToast("Please sign in with a customer account");
                  return;
                }

                const formData = new FormData(e.currentTarget);

                const missingItem = cart.some((item) =>
                  !apiMenuItems.some(
                    (apiItem) =>
                      apiItem._id === item.id && apiItem.isAvailable !== false
                  )
                );

                if (missingItem) {
                  alert("Some items are no longer available. Please refresh your menu.");
                  return;
                }

                const orderItems = cart.map((item) => {
                  const apiItem = apiMenuItems.find(
                    (apiMenuItem) => apiMenuItem._id === item.id
                  );

                  return {
                    menuItem: apiItem?._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                  };
                });

                const orderData = {
                  customerName: String(formData.get("customerName")),
                  email: String(formData.get("email")),
                  address: String(formData.get("address")),
                  phone: String(formData.get("phone")),
                  items: orderItems,
                  total: cartTotal,
                };

                try {
                  const response = await fetch("http://localhost:5000/api/orders", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify(orderData),
                  });

                  const data = await response.json();

                  if (!response.ok) {
                    throw new Error(data.message || "Order could not be placed");
                  }

                  const newOrder: CustomerOrder = {
                    id: data._id,
                    date: new Date(data.createdAt || Date.now()).toLocaleDateString(),
                    customerName: data.customerName,
                    email: data.email,
                    address: data.address,
                    phone: data.phone,
                    items: (data.items || []).map((item: any, index: number) => ({
                      id: index + 1,
                      name: item.name,
                      price: item.price,
                      quantity: item.quantity,
                      rating: "4.9",
                      image: "",
                    })),
                    total: data.total,
                    status: data.status,
                  };

                  setOrders((previous) => [newOrder, ...previous]);
                  setCart([]);
                  setCheckoutOpen(false);
                  setOrdersOpen(true);
                  showToast("Your order has been placed successfully!");
                } catch (error) {
                  console.error("Order submission error:", error);
                  alert(
                    error instanceof Error
                      ? error.message
                      : "Something went wrong. Please try again."
                  );
                }
              }}
              className="space-y-5"
            >
              <div>
                <label className="block font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  name="customerName"
                  required
                  defaultValue={currentUser?.name || ""}
                  placeholder="Enter your name"
                  className="w-full border border-gray-200 rounded-xl p-4 outline-none focus:border-[#E85D24] focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={currentUser?.email || ""}
                  placeholder="Enter your email"
                  className="w-full border border-gray-200 rounded-xl p-4 outline-none focus:border-[#E85D24] focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Delivery Address</label>
                <textarea
                  name="address"
                  required
                  placeholder="Enter your complete delivery address"
                  className="w-full border border-gray-200 rounded-xl p-4 outline-none focus:border-[#E85D24] focus:ring-2 focus:ring-orange-100"
                  rows={3}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="Enter phone number"
                  className="w-full border border-gray-200 rounded-xl p-4 outline-none focus:border-[#E85D24] focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="border-t border-gray-100 pt-6">
                <div className="flex justify-between text-xl font-black">
                  <span>Total Amount</span>
                  <span className="text-[#E85D24]">
                    PKR {cartTotal.toLocaleString("en-PK")}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full orange-gradient hover:opacity-95 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-900/10 transition"
              >
                Place My Order <ArrowRight className="inline ml-2" size={19} />
              </button>
            </form>
          </div>
        </section>
      )}

      {/* My Orders */}
      {ordersOpen && (
        <section className="max-w-5xl mx-auto px-5 py-14 min-h-[60vh]">
          <button
            onClick={() => setOrdersOpen(false)}
            className="text-[#E85D24] font-bold mb-6"
          >
            ← Back to Menu
          </button>

          <span className="text-[#E85D24] font-bold tracking-widest text-sm">YOUR ACCOUNT</span>
          <h2 className="text-4xl font-black mt-2 mb-3">My Orders</h2>
          <p className="text-gray-500 mb-8">Track your food orders and their latest status.</p>

          {!currentUser ? (
            <div className="bg-white rounded-3xl p-10 text-center soft-shadow">
              <UserRound size={45} className="mx-auto text-[#E85D24] mb-4" />
              <h3 className="text-xl font-bold">Sign in to view your orders</h3>
              <button onClick={() => setAuthOpen(true)} className="mt-5 orange-gradient text-white px-6 py-3 rounded-full font-bold">Sign In</button>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center soft-shadow">
              <ShoppingBag size={45} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold">No Orders Yet</h3>
              <p className="text-gray-500 mt-2">Your delicious orders will appear here.</p>
              <button onClick={() => setOrdersOpen(false)} className="mt-5 orange-gradient text-white px-6 py-3 rounded-full font-bold">Explore Menu</button>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-3xl p-6 md:p-8 soft-shadow">
                  <div className="flex flex-wrap justify-between gap-3 mb-5">
                    <div>
                      <h3 className="font-black text-lg">{order.id}</h3>
                      <p className="text-gray-500 text-sm mt-1">{order.date}</p>
                    </div>
                    <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-bold">{order.status}</span>
                  </div>
                  <p className="font-semibold">{order.customerName}</p>
                  <p className="text-gray-500 text-sm mt-1">{order.address}</p>
                  <div className="border-t mt-5 pt-5">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between gap-4 text-sm mb-3">
                        <span>{item.name} × {item.quantity}</span>
                        <span className="font-semibold">PKR {(item.price * item.quantity).toLocaleString("en-PK")}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-black text-lg mt-5">
                      <span>Total</span>
                      <span className="text-[#E85D24]">PKR {order.total.toLocaleString("en-PK")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Hero */}
      {!checkoutOpen && !ordersOpen && (
        <>
          <section className="relative overflow-hidden dark-gradient text-white">
            <div className="absolute -top-20 -right-20 w-[450px] h-[450px] rounded-full hero-glow pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full hero-glow pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center relative z-10">
              <div className="fade-up">
                <div className="inline-flex items-center gap-2 border border-white/15 bg-white/10 px-4 py-2 rounded-full text-sm text-orange-200 mb-7">
                  <Sparkles size={15} />
                  Delicious moments start here
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.06] tracking-tight">
                  Good Food.
                  <span className="block text-[#F28A52]">Good Mood.</span>
                </h1>

                <p className="text-white/65 text-lg leading-8 mt-7 max-w-lg">
                  Discover your favourite meals, explore bold flavours and enjoy
                  freshly prepared food delivered straight to your door.
                </p>

                <div className="flex flex-wrap gap-4 mt-9">
                  <a href="#menu" className="orange-gradient px-7 py-4 rounded-full font-bold flex items-center gap-3 hover:scale-105 transition shadow-xl shadow-orange-950/20">
                    Explore Menu <ArrowRight size={19} />
                  </a>
                  <a href="#about" className="border border-white/25 px-7 py-4 rounded-full font-semibold hover:bg-white/10 transition">
                    Our Story
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-5 max-w-md mt-14 border-t border-white/15 pt-8">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black">29+</h3>
                    <p className="text-white/50 text-xs md:text-sm mt-1">Menu Choices</p>
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black">4.9★</h3>
                    <p className="text-white/50 text-xs md:text-sm mt-1">Guest Rating</p>
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black">30 min</h3>
                    <p className="text-white/50 text-xs md:text-sm mt-1">Fast Delivery</p>
                  </div>
                </div>
              </div>

              <div className="relative fade-up">
                <div className="absolute inset-5 rounded-[40px] bg-[#E85D24] rotate-3 opacity-40 blur-sm" />
                <div className="relative rounded-[36px] overflow-hidden border border-white/10 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1100"
                    alt="Fresh gourmet burger"
                    className="w-full h-[380px] md:h-[550px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-orange-300 text-xs font-bold tracking-widest">MADE FRESH</p>
                      <h3 className="text-2xl font-black mt-1">Made to satisfy.</h3>
                    </div>
                    <div className="bg-white text-[#29231F] p-4 rounded-2xl shadow-xl float-animation">
                      <div className="flex items-center gap-1 text-orange-500">
                        <Star size={16} fill="currentColor" />
                        <span className="font-black">4.9</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">Customer love</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Service highlights */}
          <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-9">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: ChefHat, title: "Freshly Prepared", text: "Made fresh when you order" },
                { icon: Truck, title: "Quick Delivery", text: "Your favourites at your door" },
                { icon: ShieldCheck, title: "Quality Ingredients", text: "Carefully selected ingredients" },
                { icon: Heart, title: "Made With Care", text: "A little extra love in every bite" },
              ].map((feature) => (
                <div key={feature.title} className="bg-white/80 rounded-2xl p-5 flex items-center gap-4 border border-[#29231F]/5">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-orange-100 text-[#E85D24] flex items-center justify-center">
                    <feature.icon size={23} />
                  </div>
                  <div>
                    <h3 className="font-bold">{feature.title}</h3>
                    <p className="text-gray-500 text-xs mt-1">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Categories */}
          <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-16">
            <div className="flex flex-wrap justify-between items-end gap-5 mb-9">
              <div>
                <p className="text-[#E85D24] font-black tracking-[.2em] text-xs mb-3">EXPLORE BY CATEGORY</p>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight">What are you craving?</h2>
                <p className="text-gray-500 mt-3">Find something delicious for every mood.</p>
              </div>
              <a href="#menu" className="text-[#E85D24] font-bold flex items-center gap-2">View Menu <ArrowRight size={17} /></a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Burgers", emoji: "🍔", description: "Juicy & delicious" },
                { name: "Pizza", emoji: "🍕", description: "Cheesy goodness" },
                { name: "Desserts", emoji: "🍰", description: "Sweet little moments" },
                { name: "Drinks", emoji: "🥤", description: "Cool & refreshing" },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setSelectedCategory(item.name);
                    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`premium-card rounded-3xl p-6 md:p-8 text-left border ${
                    selectedCategory === item.name
                      ? "bg-[#29231F] text-white border-[#29231F]"
                      : "bg-white border-[#29231F]/5"
                  }`}
                >
                  <div className="text-5xl mb-5">{item.emoji}</div>
                  <h3 className="text-xl font-black">{item.name}</h3>
                  <p className={`text-sm mt-1 ${selectedCategory === item.name ? "text-white/60" : "text-gray-500"}`}>{item.description}</p>
                  <div className={`mt-5 flex items-center gap-2 text-xs font-bold ${selectedCategory === item.name ? "text-orange-300" : "text-[#E85D24]"}`}>
                    Explore <ChevronRight size={15} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Menu */}
          <section id="menu" className="bg-white py-20 scroll-mt-24">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <p className="text-[#E85D24] font-black tracking-[.2em] text-xs mb-3">FROM OUR KITCHEN</p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">Popular dishes for you</h2>
                <p className="text-gray-500 mt-4">A little something for every craving. Choose your favourite.</p>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-9">
                <div className="relative w-full md:max-w-sm">
                  <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="menu-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your favourite food..."
                    className="w-full bg-[#F8F3EA] border border-transparent focus:border-[#E85D24] rounded-full pl-12 pr-5 py-4 outline-none transition"
                  />
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold transition ${
                        selectedCategory === category
                          ? "bg-[#29231F] text-white"
                          : "bg-[#F8F3EA] text-[#655B53] hover:bg-orange-100"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {menuLoading ? (
                <div className="py-20 text-center">
                  <div className="w-12 h-12 border-4 border-orange-200 border-t-[#E85D24] rounded-full animate-spin mx-auto" />
                  <p className="text-gray-500 mt-5">Preparing your menu...</p>
                </div>
              ) : menuError ? (
                <div className="bg-orange-50 rounded-3xl p-10 text-center">
                  <p className="text-[#29231F] font-bold">{menuError}</p>
                  <button onClick={() => window.location.reload()} className="mt-5 bg-[#E85D24] text-white px-6 py-3 rounded-full font-bold">Refresh Menu</button>
                </div>
              ) : foodItems.length === 0 ? (
                <div className="text-center py-20 bg-[#F8F3EA] rounded-3xl">
                  <Search size={42} className="mx-auto text-gray-300" />
                  <h3 className="text-xl font-bold mt-4">No dishes found</h3>
                  <p className="text-gray-500 mt-2">Try another search or category.</p>
                  <button
                    onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                    className="mt-5 text-[#E85D24] font-bold"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {foodItems.map((food) => {
                    const cartItem = cart.find((item) => item.id === food.id);

                    return (
                      <article key={food.id} className="premium-card bg-[#F8F3EA] rounded-[26px] overflow-hidden border border-[#29231F]/5">
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={food.image}
                            alt={food.name}
                            className="food-image w-full h-full object-cover"
                            loading="lazy"
                          />
                          <span className="absolute top-4 left-4 bg-white/95 backdrop-blur text-[#29231F] text-xs font-bold px-3 py-2 rounded-full">
                            {food.category}
                          </span>
                          <span className="absolute top-4 right-4 bg-white/95 text-[#29231F] text-xs font-bold px-3 py-2 rounded-full flex items-center gap-1">
                            <Star size={13} fill="#E85D24" className="text-[#E85D24]" /> {food.rating}
                          </span>
                        </div>

                        <div className="p-5">
                          <h3 className="font-black text-lg leading-snug">{food.name}</h3>
                          <p className="text-gray-500 text-sm mt-2 min-h-[40px] line-clamp-2">{food.description}</p>

                          <div className="flex justify-between items-center mt-5 gap-3">
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold tracking-widest">PRICE</p>
                              <p className="text-[#E85D24] text-xl font-black mt-1">PKR {food.price.toLocaleString("en-PK")}</p>
                            </div>

                            {cartItem ? (
                              <div className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5">
                                <button onClick={() => decreaseQuantity(food.id)} className="text-[#E85D24]" aria-label="Decrease quantity">
                                  <Minus size={17} />
                                </button>
                                <span className="font-black">{cartItem.quantity}</span>
                                <button onClick={() => increaseQuantity(food.id)} className="text-[#E85D24]" aria-label="Increase quantity">
                                  <Plus size={17} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(food)}
                                className="w-12 h-12 rounded-xl orange-gradient text-white flex items-center justify-center hover:scale-110 transition shadow-lg shadow-orange-900/10"
                                aria-label={`Add ${food.name} to cart`}
                              >
                                <Plus size={22} />
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* About */}
          <section id="about" className="py-20 md:py-28 scroll-mt-20">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=700"
                    alt="Fresh food bowl"
                    className="w-full h-64 md:h-80 object-cover rounded-[28px] mt-10"
                    loading="lazy"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1515003197210-e0cd7184f8b5?w=700"
                    alt="Freshly served meal"
                    className="w-full h-64 md:h-80 object-cover rounded-[28px]"
                    loading="lazy"
                  />
                </div>
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-6 py-4 shadow-xl text-center min-w-[190px]">
                  <p className="text-2xl font-black text-[#E85D24]">Fresh</p>
                  <p className="text-xs text-gray-500 font-semibold">Every single day</p>
                </div>
              </div>

              <div>
                <p className="text-[#E85D24] font-black tracking-[.2em] text-xs mb-4">A LITTLE ABOUT US</p>
                <h2 className="text-4xl md:text-5xl font-black leading-tight">
                  Great food brings people together.
                </h2>
                <p className="text-gray-500 leading-8 mt-6">
                  At CraveHub, we believe every meal should feel special. From
                  carefully selected ingredients to flavours worth coming back
                  for, we make every order with care.
                </p>
                <p className="text-gray-500 leading-8 mt-4">
                  Whether you are sharing a meal with friends or enjoying a
                  little treat on your own, there is always something delicious
                  waiting for you.
                </p>

                <div className="grid grid-cols-2 gap-5 mt-8">
                  <div className="border-l-4 border-[#E85D24] pl-4">
                    <h3 className="font-black text-xl">Quality First</h3>
                    <p className="text-sm text-gray-500 mt-1">Care in every detail.</p>
                  </div>
                  <div className="border-l-4 border-[#899477] pl-4">
                    <h3 className="font-black text-xl">Made Fresh</h3>
                    <p className="text-sm text-gray-500 mt-1">Prepared for your order.</p>
                  </div>
                </div>

                <a href="#menu" className="inline-flex items-center gap-3 mt-9 orange-gradient text-white px-7 py-4 rounded-full font-bold">
                  Discover Our Menu <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section id="reviews" className="bg-white py-20 scroll-mt-20">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <p className="text-[#E85D24] font-black tracking-[.2em] text-xs mb-3">KIND WORDS</p>
                <h2 className="text-4xl md:text-5xl font-black">Love from our guests</h2>
                <p className="text-gray-500 mt-4">Good food makes people happy. That is what we aim for.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { name: "A Happy Customer", text: "The food was fresh, delicious and beautifully prepared. Definitely ordering again!" },
                  { name: "Food Lover", text: "Loved the variety on the menu. Everything arrived fresh and tasted wonderful." },
                  { name: "Regular Guest", text: "A lovely experience from browsing the menu to enjoying the meal. Highly recommended!" },
                ].map((review) => (
                  <div key={review.name} className="bg-[#F8F3EA] rounded-3xl p-7 border border-[#29231F]/5">
                    <div className="flex gap-1 text-[#E85D24] mb-5">
                      {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={16} fill="currentColor" />)}
                    </div>
                    <p className="text-[#655B53] leading-7">“{review.text}”</p>
                    <div className="flex items-center gap-3 mt-7">
                      <div className="w-11 h-11 rounded-full orange-gradient text-white flex items-center justify-center font-black">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-sm">{review.name}</h3>
                        <p className="text-gray-400 text-xs mt-1">CraveHub Guest</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="px-6 md:px-12 py-16">
            <div className="max-w-[1400px] mx-auto dark-gradient rounded-[34px] p-9 md:p-16 text-center text-white relative overflow-hidden">
              <div className="absolute -right-16 -top-24 w-72 h-72 rounded-full bg-orange-500/20 blur-3xl" />
              <div className="relative z-10">
                <p className="text-orange-300 text-xs font-black tracking-[.2em]">YOUR NEXT FAVOURITE MEAL</p>
                <h2 className="text-3xl md:text-5xl font-black mt-4">Ready to satisfy your cravings?</h2>
                <p className="text-white/60 mt-4 max-w-xl mx-auto">Explore the menu and find something delicious today.</p>
                <a href="#menu" className="inline-flex items-center gap-3 orange-gradient px-8 py-4 rounded-full font-bold mt-8 hover:scale-105 transition">
                  Order Something Delicious <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer id="contact" className="bg-[#29231F] text-white pt-16 pb-8 scroll-mt-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            <div className="lg:col-span-2">
              <a href="#" className="text-3xl font-black">CraveHub<span className="text-[#E85D24]">.</span></a>
              <p className="text-white/50 leading-7 mt-5 max-w-sm">
                Good food, great moments. Bringing delicious flavours and
                memorable meals to your table.
              </p>
              <div className="flex gap-3 mt-6">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Heart size={17} /></div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Utensils size={17} /></div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Star size={17} /></div>
              </div>
            </div>

            <div>
              <h3 className="font-black text-lg mb-5">Explore</h3>
              <div className="space-y-3 text-white/55 text-sm">
                <a href="#" className="block hover:text-orange-400">Home</a>
                <a href="#menu" className="block hover:text-orange-400">Our Menu</a>
                <a href="#about" className="block hover:text-orange-400">About Us</a>
                <a href="#reviews" className="block hover:text-orange-400">Reviews</a>
              </div>
            </div>

            <div>
              <h3 className="font-black text-lg mb-5">Get in touch</h3>
              <div className="space-y-4 text-white/55 text-sm">
                <p className="flex items-center gap-3"><MapPin size={17} className="text-orange-400" /> Fresh food, delivered to you</p>
                <p className="flex items-center gap-3"><Clock size={17} className="text-orange-400" /> Made fresh for every order</p>
                <p className="flex items-center gap-3"><ShoppingBag size={17} className="text-orange-400" /> Easy online ordering</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-7 text-xs text-white/35">
            <p>© 2026 CraveHub. All rights reserved.</p>
            <p>Made with care for food lovers.</p>
          </div>
        </div>
      </footer>

      {/* Floating Cart Bar */}
      {cartCount > 0 && !cartOpen && !checkoutOpen && !ordersOpen && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full dark-gradient text-white rounded-2xl px-5 py-4 shadow-2xl flex items-center justify-between border border-white/10 hover:scale-[1.02] transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center font-black">
                {cartCount}
              </div>
              <div className="text-left">
                <p className="font-black">View Your Cart</p>
                <p className="text-xs text-white/50">Your delicious picks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-black">PKR {cartTotal.toLocaleString("en-PK")}</span>
              <ArrowRight size={20} className="text-orange-400" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-[#F8F3EA] shadow-2xl flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-[#29231F]/10">
              <div>
                <p className="text-[#E85D24] text-xs font-black tracking-widest">YOUR SELECTION</p>
                <h2 className="text-2xl font-black mt-1">Your Cart</h2>
                <p className="text-sm text-gray-500 mt-1">{cartCount} item(s) in your cart</p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-3 rounded-full bg-white hover:bg-orange-100 transition"
                aria-label="Close cart"
              >
                <X size={21} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag size={48} className="mx-auto text-gray-300" />
                  <h3 className="text-xl font-black mt-5">Your cart is empty</h3>
                  <p className="text-gray-500 mt-2">Add something delicious to get started.</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="mt-6 orange-gradient text-white px-6 py-3 rounded-full font-bold"
                  >
                    Explore Menu
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-white rounded-2xl p-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-xl"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black leading-snug">{item.name}</h3>
                        <p className="text-[#E85D24] font-bold mt-1">
                          PKR {item.price.toLocaleString("en-PK")}
                        </p>

                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="border rounded-lg p-1.5 hover:bg-orange-50"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-black text-sm">{item.quantity}</span>
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="border rounded-lg p-1.5 hover:bg-orange-50"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto text-red-500 p-1.5"
                            aria-label="Remove item"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-[#29231F]/10 p-6 bg-white">
                <div className="flex justify-between text-lg font-black mb-5">
                  <span>Total</span>
                  <span className="text-[#E85D24]">PKR {cartTotal.toLocaleString("en-PK")}</span>
                </div>
                <button
                  onClick={openCheckout}
                  className="w-full orange-gradient text-white py-4 rounded-xl font-black hover:opacity-95 transition"
                >
                  Proceed to Checkout <ArrowRight className="inline ml-2" size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onSuccess={(token, user) => {
            localStorage.setItem("cravehub_token", token);
            localStorage.setItem("cravehub_user", JSON.stringify(user));

            setAuthToken(token);
            setCurrentUser(user);
            setAuthOpen(false);
            showToast(`Welcome to CraveHub, ${user.name}!`);
          }}
        />
      )}
    </div>
  );
}

export default App;
