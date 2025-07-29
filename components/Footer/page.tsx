import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 text-gray-600 py-4 px-6 mt-10 border-t">
      <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto">
        <p className="text-sm">&copy; {new Date().getFullYear()} Mi-Ware Technologies. All rights reserved.</p>

        <div className="flex space-x-4 mt-2 md:mt-0 text-sm">
          <a href="/privacy" className="hover:text-black transition">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-black transition">
            Terms of Service
          </a>
          <a href="/contact" className="hover:text-black transition">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
