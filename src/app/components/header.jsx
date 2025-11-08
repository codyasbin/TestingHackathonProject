"use client";

import Link from "next/link";
import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {Leaf} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Avatar, AvatarImage, AvatarFallback} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      const raw = sessionStorage.getItem("currentUser");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.id) setUser(parsed);
        } catch {
          sessionStorage.removeItem("currentUser");
        }
      }
    };

    loadUser();

    const handler = (e) => {
      if (e.key === "user") loadUser();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const go = (path) => () => router.push(path);

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Sahayog</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/browse" className="text-sm text-muted-foreground hover:text-foreground transition">
              Services
            </Link>
            <Link href="#impact" className="text-sm text-muted-foreground hover:text-foreground transition">
              Our Impact
            </Link>
            <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition">
              About
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition">
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full">
                    <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-green-400 transition-all">
                      <AvatarImage src={user.avatar || ""} />
                      <AvatarFallback className="bg-green-600 text-white font-semibold">{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email || "user@example.com"}</p>
                      {user.role && <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">{user.role}</span>}
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={go("/profile")} className="cursor-pointer">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={go("/dashboard")} className="cursor-pointer">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Dashboard
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={go("/bookings")} className="cursor-pointer">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    My Bookings
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={go("/settings")} className="cursor-pointer">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={go("/rewards")} className="cursor-pointer">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m-3-3H9m3-4H9m3 0h3m-3 0v4m0 0l-3 3m3-3h3m-3 0h-3" />
                    </svg>
                    Rewards and Points
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
                  Log in
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
