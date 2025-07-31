"use client";

import Link from "next/link";
import Image from "next/image";
// import logo from "@/public/logo.png"; // <-- Replace with your actual logo path

const Header = () => {
  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-background/80 backdrop-blur border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2">
            {/* <Image src={logo} alt="Mi-Ware Logo" width={40} height={40} /> */}
            <span className="font-semibold text-lg text-foreground">Mi-Ware</span>
          </div>
        </Link>

        {/* Login Button */}
        <Link
          href="/login"
          className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition"
        >
          Login
        </Link>
      </div>
    </header>
  );
};

export default Header;
