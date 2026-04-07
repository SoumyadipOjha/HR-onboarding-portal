import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-black border-t border-slate-100 dark:border-neutral-800 py-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Copyright */}
        <div className="text-sm text-slate-500 dark:text-neutral-500">
          &copy; {currentYear} <span className="font-semibold text-slate-700 dark:text-neutral-300">HireFlow</span>. All rights reserved.
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link to="#" className="text-sm text-slate-500 hover:text-sky-600 dark:text-neutral-500 dark:hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link to="#" className="text-sm text-slate-500 hover:text-sky-600 dark:text-neutral-500 dark:hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link to="#" className="text-sm text-slate-500 hover:text-sky-600 dark:text-neutral-500 dark:hover:text-white transition-colors">
            Contact Support
          </Link>
        </div>

      </div>
    </footer>
  )
}
