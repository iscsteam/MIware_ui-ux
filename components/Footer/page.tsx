// import React from 'react';

// export default function Footer() {
//   return (
//     <footer className="w-full bg-gray-100 text-gray-600 py-4 px-6 mt-10 border-t">
//       <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto">
//         <p className="text-sm">&copy; {new Date().getFullYear()} Mi-Ware Technologies. All rights reserved.</p>

//         <div className="flex space-x-4 mt-2 md:mt-0 text-sm">
//           <a href="/privacy" className="hover:text-black transition">
//             Privacy Policy
//           </a>
//           <a href="/terms" className="hover:text-black transition">
//             Terms of Service
//           </a>
//           <a href="/contact" className="hover:text-black transition">
//             Contact
//           </a>
//         </div>
//       </div>
//     </footer>
//   );
// }

import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Github,
  Youtube,
  ArrowRight,
  Send,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold mb-2">
                Stay Updated with miWare
              </h3>
              <p className="text-slate-300 max-w-md">
                Get the latest insights on data integration, platform updates,
                and industry best practices delivered to your inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                miWare
              </h2>
              <p className="text-slate-300 mt-3 leading-relaxed">
                Transforming data integration into strategic advantage through
                enterprise-grade, cloud-native solutions. Accelerate your data
                workflows from weeks to hours with our revolutionary platform.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-300">
                <Mail className="w-5 h-5 text-blue-400" />
                <a
                  href="mailto:contact@miware.com"
                  className="hover:text-white transition-colors"
                >
                  contact@miware.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-5 h-5 text-blue-400" />
                <a
                  href="tel:+1-555-0123"
                  className="hover:text-white transition-colors"
                >
                  {/* +1 (555) 012-3456 */} 9999999999
                </a>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>Hyderabad</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Platform</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/features"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Core Features
                </a>
              </li>
              <li>
                <a
                  href="/integrations"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Integrations
                </a>
              </li>
              <li>
                <a
                  href="/architecture"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Architecture
                </a>
              </li>
              <li>
                <a
                  href="/enterprise"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Enterprise
                </a>
              </li>
              <li>
                <a
                  href="/pricing"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Resources</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/documentation"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="/api-reference"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  API Reference
                </a>
              </li>
              <li>
                <a
                  href="/tutorials"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Tutorials
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/case-studies"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Case Studies
                </a>
              </li>
              <li>
                <a
                  href="/webinars"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Webinars
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Company</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/about"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/careers"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="/partners"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Partners
                </a>
              </li>
              <li>
                <a
                  href="/press"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Press Kit
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/support"
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media & Trust Signals */}
        <div className="mt-16 pt-8 border-t border-slate-700">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            {/* Social Media */}
            <div className="flex items-center gap-6">
              <span className="text-slate-300 font-medium">Follow us:</span>
              <div className="flex gap-4">
                <a
                  href="https://linkedin.com/"
                  target="_blank"
                  className="w-10 h-10 bg-slate-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com/"
                  target="_blank"
                  className="w-10 h-10 bg-slate-800 hover:bg-blue-400 rounded-full flex items-center justify-center transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://github.com/"
                  target="_blank"
                  className="w-10 h-10 bg-slate-800 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors duration-200"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://youtube.com/"
                  target="_blank"
                  className="w-10 h-10 bg-slate-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors duration-200"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-slate-400 text-sm">
              &copy; {currentYear} miWare software, Inc. All rights
              reserved.
            </p>
            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <a
                href="/privacy-policy"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms-of-service"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/cookie-policy"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Cookie Policy
              </a>
              <a
                href="/security"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Security
              </a>
              <a
                href="/status"
                className="text-slate-400 hover:text-white transition-colors"
              >
                System Status
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
