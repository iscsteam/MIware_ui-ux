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
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              miWare
            </span>
          </div>
        </Link>

        {/* Login Button */}
        {/* <Link
          href="/auth"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center text-white"
        >
          Login/Register
        </Link> */}
      </div>
    </header>
  );
};

export default Header;
