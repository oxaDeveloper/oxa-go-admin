"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Settings,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  { icon: LayoutDashboard, label: "Boshqaruv paneli", href: "/" },
  { icon: ShoppingCart, label: "Buyurtmalar", href: "/order" },
  { icon: Package, label: "Mahsulotlar", href: "/product" },
  { icon: Settings, label: "Sozlamalar", href: "/settings" },
];

export default function Sidebar({ setSidebar }) {
  const { id, setId } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  if (id === null || id === undefined) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("userId");
    setId(null);
    setSidebar(false);
    router.push("/login");
  };

  return (
    <div className="w-64 h-screen bg-gray-900 text-gray-300 p-4 flex flex-col">
      <div className="mb-8">
        <Image
          src="/images/logo_white.png"
          alt=""
          width={1280}
          height={1280}
          className="w-32 h-16 object-cover cursor-pointer"
        />
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                pathname === item.href ? "bg-gray-800" : "hover:bg-gray-800"
              }`}
              onClick={() => setSidebar(false)}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-2">
        <button
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
          onClick={() => handleLogout()}
        >
          <LogOut className="w-5 h-5" />
          <span>Chiqish</span>
        </button>
      </div>
    </div>
  );
}
