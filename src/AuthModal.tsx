
import { useState } from "react";
import { X, UserRound } from "lucide-react";

type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: "Customer" | "Kitchen Staff" | "Manager" | "Admin";
};

type AuthModalProps = {
  onClose: () => void;
  onSuccess: (token: string, user: AuthUser) => void;
};

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isSignup ? "signup" : "login";

      const response = await fetch(
        `http://localhost:5000/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isSignup ? { name, email, password } : { email, password }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      onSuccess(data.token, data.user);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full hover:bg-gray-100"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="bg-orange-100 text-orange-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-5">
          <UserRound size={28} />
        </div>

        <h2 className="text-3xl font-bold">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-gray-500 mt-2 mb-7">
          {isSignup
            ? "Join CraveHub and enjoy delicious food."
            : "Sign in to your CraveHub account."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              required
              className="w-full border rounded-xl p-3 outline-orange-500"
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
            className="w-full border rounded-xl p-3 outline-orange-500"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            minLength={8}
            required
            className="w-full border rounded-xl p-3 outline-orange-500"
          />

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white py-4 rounded-xl font-bold"
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isSignup ? "Already have an account?" : "New to CraveHub?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
            }}
            className="text-orange-600 font-bold"
          >
            {isSignup ? "Sign In" : "Create Account"}
          </button>
        </p>
      </div>
    </div>
  );
}
