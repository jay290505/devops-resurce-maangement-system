'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Infinity as InfinityIcon, Send, Code2, Globe, Share2, MessageSquare } from 'lucide-react';

const footerLinks = {
  Product: ['Features', 'Dashboard', 'Resources', 'Pricing'],
  Resources: ['Documentation', 'API Reference', 'Guides', 'Blog', 'Status'],
  Company: ['About Us', 'Careers', 'Contact', 'Privacy Policy', 'Terms of Service'],
  Legal: ['Privacy', 'Terms', 'Cookies', 'Security'],
};

const socialIcons = [
  { icon: Code2, label: 'GitHub' },
  { icon: Globe, label: 'Website' },
  { icon: Share2, label: 'Twitter' },
  { icon: MessageSquare, label: 'Discord' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer data-motion-section
      className="relative border-t py-16 px-4 sm:px-6 lg:px-8"
      style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(3,3,8,0.95)' }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">

          {/* Brand column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}
              >
                <InfinityIcon className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-bold text-white">DRMS</span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
              The intelligent platform for managing, automating, and scaling your DevOps infrastructure.
            </p>
            <div className="flex items-center gap-2">
              {socialIcons.map(({ icon: Icon, label }) => (
                <motion.a
                  key={label}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-500 hover:text-white hover:border-white/20 transition-colors"
                  aria-label={label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-xs font-semibold tracking-wider uppercase text-zinc-300">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="lg:col-span-2 md:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-zinc-300">Subscribe to our newsletter</h4>
            <p className="text-xs text-zinc-500">Get the latest updates and best practices delivered to your inbox.</p>
            <form
              onSubmit={(e) => { e.preventDefault(); if (email) setSubscribed(true); }}
              className="flex gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                disabled={subscribed}
              />
              <motion.button
                type="submit"
                disabled={subscribed}
                className="flex items-center justify-center h-8 w-8 rounded-lg text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="h-3.5 w-3.5" />
              </motion.button>
            </form>
            {subscribed && <p className="text-[11px] text-green-400">✓ Subscribed! Check your inbox.</p>}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs text-zinc-600">© 2024 DRMS. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {['Privacy', 'Terms', 'Cookies'].map((t) => (
              <Link key={t} href="#" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">{t}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
