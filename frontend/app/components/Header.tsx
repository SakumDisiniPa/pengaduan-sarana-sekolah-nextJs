"use client";

import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { pb } from "../../lib/pocketbase";
import { Menu, Transition } from "@headlessui/react";
import { Menu as MenuIcon, X, User, LogOut } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState<typeof pb.authStore.model>(pb.authStore.model);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setMounted(true);
    });

    const unsubscribe = pb.authStore.onChange(() => {
      setUser(pb.authStore.model);
    });

    return () => {
      cancelAnimationFrame(frameId);
      unsubscribe();
    };
  }, []);

  const signOut = () => {
    pb.authStore.clear();
    setUser(null);
    setMobileMenuOpen(false);
    router.push("/");
  };

  // Get avatar URL from PocketBase (Google OAuth stores it)
  const getAvatarUrl = () => {
    if (!user) return null;
    if (user.avatar) {
      // PocketBase file URL
      return pb.files.getURL(user, user.avatar);
    }
    return null;
  };

  const avatarUrl = getAvatarUrl();
  const displayName = (user?.name && user.name.trim()) ? user.name : user?.email;
  const avatarInitial = (user?.name && user.name.trim() ? user.name.charAt(0) : user?.email?.charAt(0))?.toUpperCase() || "U";

  // Daftar navigasi
  const navigation = [
    { name: "Dashboard", href: "/siswa/dashboard", requiresAuth: true },
    { name: "Chat", href: "/siswa/chat", requiresAuth: true },
    { name: "Home", href: "/admin", requiresAdmin: true },
    { name: "Admin Chat", href: "/admin/chats", requiresAdmin: true },
    { name: "Complaints", href: "/admin/complaints", requiresAdmin: true },
    { name: "Kategori", href: "/admin/kategori", requiresAdmin: true },
  ];

  const filteredNav = navigation.filter((item) => {
    if (item.requiresAdmin) return user?.isAdmin;
    if (item.requiresAuth) return !!user && !user?.isAdmin;
    return true;
  });

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 via-purple-600/80 to-pink-600/80" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,.1),transparent)] animate-pulse" />
      
      <nav className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center">
            <Link
              href={user?.isAdmin ? "/admin" : "/"}
              className="text-2xl font-bold text-white drop-shadow-lg hover:scale-110 transition-transform"
            >
              MyApp
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {filteredNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-sm font-medium text-white/90 hover:text-white transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {mounted ? (
              user ? (
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center space-x-2 text-sm font-medium text-white/90 hover:text-white focus:outline-none group">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName || "User"}
                        className="w-8 h-8 rounded-full ring-2 ring-white shadow-lg transition-transform group-hover:scale-110 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white ring-2 ring-white shadow-lg transition-transform group-hover:scale-110">
                        {avatarInitial}
                      </span>
                    )}
                    <span className="hidden lg:inline">{displayName}</span>
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white/95 backdrop-blur-md py-1 shadow-2xl ring-1 ring-black/10 focus:outline-none border border-white/30">
                      {/* User info section */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={displayName || "User"}
                              className="w-10 h-10 rounded-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              {avatarInitial}
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user.name || "User"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href={`${user?.isAdmin ? "/admin" : "/siswa"}/profile?id=${user?.id}`}
                            className={`${active ? "bg-gray-50" : ""} block w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:text-gray-700 font-medium flex items-center gap-2`}
                          >
                            <User className="w-4 h-4" /> Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={signOut}
                            className={`${active ? "bg-red-50" : ""} block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-2`}
                          >
                            <LogOut className="w-4 h-4" /> Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/siswa/login"
                    className="px-5 py-2 text-sm font-semibold text-blue-600 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Login Siswa
                  </Link>
                </div>
              )
            ) : (
              <div className="w-20 h-8 bg-white/20 rounded animate-pulse" />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-white/80 hover:text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <Transition
          show={mobileMenuOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 -translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-2"
        >
          <div className="md:hidden py-4 border-t border-white/30 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-lg rounded-b-xl">
            <div className="flex flex-col space-y-2">
              {filteredNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-base font-medium text-white/90 hover:text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {mounted && user ? (
                <>
                  <div className="flex items-center space-x-3 px-4 py-2 text-sm text-white/90 border-t border-white/20">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName || "User"}
                        className="w-8 h-8 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                        {avatarInitial}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-medium truncate block">{user.name || "User"}</span>
                      <span className="text-xs text-white/60 truncate block">{user.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={signOut}
                    className="text-left text-base font-medium text-white/90 hover:text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" /> Sign out
                  </button>
                </>
              ) : mounted ? (
                <div className="flex flex-col space-y-2 px-4">
                  <Link
                    href="/siswa/login"
                    className="text-base font-medium text-blue-600 bg-white px-4 py-2 rounded-lg shadow-md text-center font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login Siswa
                  </Link>
                </div>
              ) : (
                <div className="px-4 py-2">
                  <div className="h-8 bg-white/20 rounded animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </Transition>
      </nav>
    </header>
  );
}