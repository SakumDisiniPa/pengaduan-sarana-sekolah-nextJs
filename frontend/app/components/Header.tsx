"use client";

import { useEffect, useState, Fragment } from "react";
import Link from "next/link";
import { pb } from "../../lib/pocketbase";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Header() {
  const [user, setUser] = useState<typeof pb.authStore.model>(pb.authStore.model);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to defer setMounted, avoiding synchronous setState error
    const frameId = requestAnimationFrame(() => {
      setMounted(true);
    });

    // Subscribe to auth changes
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
  };

  // Daftar navigasi
  const navigation = [
    { name: "Home", href: "/", requiresAuth: true },
    { name: "Chat", href: "/chat", requiresAuth: true },
    { name: "Complaints", href: "/complaints", requiresAuth: true },
    { name: "Home", href: "/admin", requiresAdmin: true },
    { name: "Admin Chat", href: "/admin/chats", requiresAdmin: true },
    { name: "Complaints", href: "/admin/complaints", requiresAdmin: true },
  ];

  const filteredNav = navigation.filter((item) => {
    if (item.requiresAdmin) return user?.isAdmin;
    if (item.requiresAuth) return !!user && !user?.isAdmin;
    return true;
  });

  // Avoid hydration mismatch in Next.js
  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-2xl">
      {/* Background animated shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 via-purple-600/80 to-pink-600/80" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,.1),transparent)] animate-pulse" />
      
      <nav className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand dengan gradien */}
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
                key={item.name}
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
                    <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white ring-2 ring-white shadow-lg transition-transform group-hover:scale-110">
                      {(user.name && user.name.trim() ? user.name.charAt(0) : user.email?.charAt(0))?.toUpperCase() || "U"}
                    </span>
                    <span className="hidden lg:inline">{(user.name && user.name.trim()) ? user.name : user.email}</span>
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
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white/95 backdrop-blur-md py-1 shadow-2xl ring-1 ring-black/10 focus:outline-none border border-white/30">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={signOut}
                            className={`${
                              active ? "bg-blue-50" : ""
                            } block w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-gray-900`}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Register
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
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dengan transisi */}
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
                  key={item.name}
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
                    <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </span>
                    <span className="font-medium truncate">{user.name}</span>
                  </div>
                  <button
                    onClick={signOut}
                    className="text-left text-base font-medium text-white/90 hover:text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
                  >
                    Sign out
                  </button>
                </>
              ) : mounted ? (
                <div className="flex flex-col space-y-2 px-4">
                  <Link
                    href="/login"
                    className="text-base font-medium text-white/90 hover:text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-base font-medium text-blue-600 bg-white px-4 py-2 rounded-lg shadow-md text-center font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
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