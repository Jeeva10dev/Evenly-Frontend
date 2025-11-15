import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { signIn } from "../utils/api";
import { useAuthContext } from "../hooks/AuthContext.jsx";
import BackButton from "../components/BackButton.jsx";

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Handle OAuth token from URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      const fetchUser = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/current`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Failed to fetch user");
          const userData = await res.json();
          login(token, userData);

          // Clean the URL
          window.history.replaceState({}, document.title, "/signin");

          navigate("/dashboard");
        } catch (err) {
          console.error("OAuth login failed", err);
          setError("Google login failed. Please try again.");
        }
      };
      fetchUser();
    }
  }, []);

  // Handle email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await signIn({ email, password });
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      const message = err?.response?.data?.msg || "Failed to sign in";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16 relative">
      <BackButton className="left-6 top-6" />
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col items-center mt-6">
            <p className="text-gray-500 text-sm mb-2">or</p>
            <button
              type="button"
              onClick={() =>
                (window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`)
              }
              className="w-full border border-gray-300 rounded flex items-center justify-center gap-2 py-2 hover:bg-gray-50 transition"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">Sign in with Google</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium rounded px-4 py-2 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-green-700 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
