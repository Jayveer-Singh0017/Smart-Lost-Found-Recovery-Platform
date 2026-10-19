import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Cpu, Database, Code } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#121A2B] text-[#94A3B8] text-sm border-t border-[#2B3850] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6D5EF7] to-[#8D82F9] flex items-center justify-center text-white shadow-md shadow-[#6D5EF7]/25">
                <Compass className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-base text-[#F1F5F9] tracking-tight">
                Smart<span className="text-[#6D5EF7]">Recovery</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deterministic recovery platform uniting lost and found belongings through multi-factor similarity matching, verified claims, and privacy-shielded handoffs.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Platform Status: Operational
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Discovery</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/search" className="hover:text-white transition">
                  Search All Listings
                </Link>
              </li>
              <li>
                <Link to="/search?type=LOST" className="hover:text-white transition">
                  Lost Belongings
                </Link>
              </li>
              <li>
                <Link to="/search?type=FOUND" className="hover:text-white transition">
                  Found Belongings
                </Link>
              </li>
              <li>
                <Link to="/report-lost" className="hover:text-white transition">
                  File a Lost Report
                </Link>
              </li>
              <li>
                <Link to="/report-found" className="hover:text-white transition">
                  File a Found Item
                </Link>
              </li>
            </ul>
          </div>

          {/* User & Security */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Verification &amp; Trust</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/claims" className="hover:text-white transition">
                  Ownership Verification Flow
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  User Dashboard
                </Link>
              </li>
              <li>
                <a href="/swagger-ui.html" target="_blank" rel="noreferrer" className="hover:text-white transition inline-flex items-center gap-1">
                  REST API Docs (Swagger)
                </a>
              </li>
              <li className="text-slate-500">
                BCrypt Hashed Security
              </li>
              <li className="text-slate-500">
                Zero Public Contact Exposure
              </li>
            </ul>
          </div>

          {/* Stack & Architecture */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Architecture</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-brand-400" />
                <span>Java 21 • Spring Boot 3.4</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>MySQL 8 • Flyway Migrations</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                <span>React • Vite • TypeScript</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>JWT Authentication &amp; RBAC</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Smart Lost &amp; Found Recovery Platform. Portfolio project.</p>
          <div className="flex items-center space-x-6">
            <span>Windows 11 Local Environment</span>
            <span>Deterministic Scoring Algorithm</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
