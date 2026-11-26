
import { useState } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Check,
} from "lucide-react";

export type Product = {
  id: string;
  name: string;
  price: number;
  rating: string;
  image: string;
  description: string;
  category: string;
  isAvailable: boolean;
};

type ProductDetailProps = {
  food: Product;
  onBack: () => void;
  onAddToCart: (item: {
    food: Product;
    quantity: number;
    sauce: string;
    flavor: string;
    toppings: string[];
    unitPrice: number;
    customization: string;
  }) => void;
};

const sauces = [
  "Garlic Mayo",
  "BBQ Sauce",
  "Chipotle",
  "Peri Peri",
  "Classic Mayo",
];

const flavors = [
  "Original",
  "Spicy",
  "Extra Spicy",
  "Smoky",
];

const toppings = [
  { name: "Extra Cheese", price: 120 },
  { name: "Jalapeños", price: 80 },
  { name: "Mushrooms", price: 100 },
];

export default function ProductDetail({
  food,
  onBack,
  onAddToCart,
}: ProductDetailProps) {
  const [sauce, setSauce] = useState("Garlic Mayo");
  const [flavor, setFlavor] = useState("Original");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const toppingTotal = toppings
    .filter((item) => selectedToppings.includes(item.name))
    .reduce((total, item) => total + item.price, 0);

  const unitPrice = food.price + toppingTotal;
  const total = unitPrice * quantity;

  const toggleTopping = (name: string) => {
    setSelectedToppings((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    );
  };

  const handleAddToCart = () => {
    const customization = [
      `Sauce: ${sauce}`,
      `Flavor: ${flavor}`,
      ...(selectedToppings.length
        ? [`Extras: ${selectedToppings.join(", ")}`]
        : []),
    ].join(" | ");

    onAddToCart({
      food,
      quantity,
      sauce,
      flavor,
      toppings: selectedToppings,
      unitPrice,
      customization,
    });

    setAdded(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F3EA] text-[#29231F]">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-10">
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-sm font-semibold text-[#75695F] transition hover:text-[#E85D24]"
        >
          <ArrowLeft size={19} />
          Back to Menu
        </button>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
            <img
              src={food.image}
              alt={food.name}
              className="h-[350px] w-full object-cover md:h-[550px]"
            />
          </div>

          <div className="py-2">
            <span className="inline-block rounded-full bg-[#E85D24]/10 px-4 py-2 text-xs font-bold uppercase tracking-[2px] text-[#E85D24]">
              {food.category}
            </span>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">
              {food.name}
            </h1>

            <p className="mt-5 leading-7 text-[#75695F]">
              {food.description}
            </p>

            <div className="mt-6 flex items-center justify-between border-b border-[#DED5C9] pb-6">
              <span className="text-3xl font-extrabold text-[#E85D24]">
                Rs. {food.price.toLocaleString("en-PK")}
              </span>
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold">
                ★ {food.rating}
              </span>
            </div>

            <div className="mt-7">
              <h3 className="mb-3 text-lg font-bold">Choose Your Sauce</h3>
              <div className="flex flex-wrap gap-2">
                {sauces.map((item) => (
                  <button
                    key={item}
                    onClick={() => setSauce(item)}
                    className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                      sauce === item
                        ? "border-[#E85D24] bg-[#E85D24] text-white"
                        : "border-[#DED5C9] bg-white hover:border-[#E85D24]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <h3 className="mb-3 text-lg font-bold">Choose Your Flavor</h3>
              <div className="flex flex-wrap gap-2">
                {flavors.map((item) => (
                  <button
                    key={item}
                    onClick={() => setFlavor(item)}
                    className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                      flavor === item
                        ? "border-[#899477] bg-[#899477] text-white"
                        : "border-[#DED5C9] bg-white hover:border-[#899477]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <h3 className="mb-3 text-lg font-bold">Make It Extra Special</h3>

              <div className="space-y-3">
                {toppings.map((item) => {
                  const selected = selectedToppings.includes(item.name);

                  return (
                    <button
                      key={item.name}
                      onClick={() => toggleTopping(item.name)}
                      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-[#E85D24] bg-[#E85D24]/5"
                          : "border-[#DED5C9] bg-white"
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="mt-1 text-sm text-[#75695F]">
                          + Rs. {item.price}
                        </p>
                      </div>

                      <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                        selected
                          ? "border-[#E85D24] bg-[#E85D24] text-white"
                          : "border-[#DED5C9]"
                      }`}>
                        {selected && <Check size={15} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-5 rounded-full border border-[#DED5C9] bg-white px-4 py-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={17} />
                </button>

                <span className="min-w-5 text-center font-bold">
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={17} />
                </button>
              </div>

              <span className="text-xl font-extrabold">
                Rs. {total.toLocaleString("en-PK")}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!food.isAvailable}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-[#E85D24] px-7 py-4 font-bold text-white shadow-lg shadow-[#E85D24]/20 transition hover:-translate-y-1 hover:bg-[#cf4c19] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {added ? <Check size={20} /> : <ShoppingBag size={20} />}
              {added ? "Added to Cart!" : "Add to Cart"}
            </button>

            <p className="mt-4 text-center text-xs text-[#897D72]">
              Freshly prepared • Made with care • CraveHub.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
