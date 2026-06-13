"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  CreditCard,
  Settings,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Tableau",
    match: "/dashboard",
  },
  {
    href: "/ventes",
    icon: ShoppingCart,
    label: "Ventes",
    match: "/ventes",
  },
  {
    href: "/produits",
    icon: Package,
    label: "Produits",
    match: "/produits",
  },
  {
    href: "/depenses",
    icon: CreditCard,
    label: "Dépenses",
    match: "/depenses",
  },
  {
    href: "/parametres",
    icon: Settings,
    label: "Réglages",
    match: "/parametres",
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-slate-700/50 bottom-nav">
      <div className="flex items-center justify-around h-16 max-w-screen-sm mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.match);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-200 rounded-xl mx-0.5 ${
                isActive
                  ? "text-green-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive ? "bg-green-400/10" : ""
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? "text-green-400" : ""}
                />
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-green-400" : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
