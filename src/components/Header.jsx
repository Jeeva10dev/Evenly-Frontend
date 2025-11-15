import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { LayoutDashboard } from "lucide-react";
import { BarLoader } from "react-spinners";
import { useAuthContext } from "../hooks/AuthContext.jsx";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

function getProfilePicUrl(imageUrl) {
  if (!imageUrl) return "/logos/logo-s.png";
  if (imageUrl.startsWith("http")) return imageUrl;
  return import.meta.env.VITE_BACKEND_URL + imageUrl;
}

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthContext();
  const location = useLocation();
  const isLoading = false;
  const handleLogout = () => { logout(); navigate("/signin"); };


  return (
    <header className="fixed top-0 w-full border-b bg-white/95 backdrop-blur z-50 supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logos/logo.png"
              alt="Evenly Logo"
              className="h-15 w-20 object-contain"
            />
          </Link>
        </div>

        {location.pathname === "/" && (
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#how-it-works"
              className="text-sm font-medium hover:text-green-600 transition"
            >
              Working
            </a>
            <a
              href="#features"
              className="text-sm font-medium hover:text-green-600 transition"
            >
              Features
            </a>
          </div>
        )}

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2 hover:text-green-600 hover:border-green-600 transition"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
              </Link>
              {/* User avatar with popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="focus:outline-none">
                    <Avatar>
                      {user && user.imageUrl ? (
                        <AvatarImage src={getProfilePicUrl(user.imageUrl)} alt={user.name || "Profile"} />
                      ) : (
                        <AvatarFallback>{user && user.name ? user.name[0].toUpperCase() : "U"}</AvatarFallback>
                      )}
                    </Avatar>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="p-0 bg-white shadow-md rounded-md">
                  <div className="flex flex-col gap-1">
                    <Link to="/profile">
                      <Button variant="ghost" className="w-full justify-start">Profile</Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="ghost">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-green-600 hover:bg-green-700 border-none">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {isLoading && <BarLoader width={"100%"} color="#36d7b7" />}
    </header>
  );
}