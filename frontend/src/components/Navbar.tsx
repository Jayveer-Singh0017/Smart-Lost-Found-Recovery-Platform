import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import {
  Compass,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6D5EF7] to-[#8D82F9] flex items-center justify-center text-white shadow-md shadow-[#6D5EF7]/25 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#F1F5F9] group-hover:text-[#6D5EF7] transition">
                Smart<span className="text-[#6D5EF7]">Recovery</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-[#94A3B8] -mt-1">
                Lost &amp; Found
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1.5">
            <Link
              to="/search"
              className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                isActive('/search')
                  ? 'text-[#6D5EF7] bg-[#182338] border border-[#2B3850] font-semibold'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#182338]/60'
              }`}
            >
              Browse Items
            </Link>

            <Link
              to="/report-lost"
              className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                isActive('/report-lost')
                  ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30 font-semibold'
                  : 'text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              Report Lost
            </Link>

            <Link
              to="/report-found"
              className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                isActive('/report-found')
                  ? 'text-[#2DD4BF] bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 font-semibold'
                  : 'text-[#94A3B8] hover:text-[#2DD4BF] hover:bg-[#2DD4BF]/10'
              }`}
            >
              Report Found
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                    isActive('/dashboard')
                      ? 'text-[#6D5EF7] bg-[#182338] border border-[#2B3850] font-semibold'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#182338]/60'
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/claims"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                    isActive('/claims')
                      ? 'text-[#6D5EF7] bg-[#182338] border border-[#2B3850] font-semibold'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#182338]/60'
                  }`}
                >
                  Claims
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition border ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-[#6D5EF7] text-white border-[#6D5EF7]'
                    : 'bg-[#182338] text-[#F1F5F9] border-[#2B3850] hover:border-[#6D5EF7]/50'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Admin
              </Link>
            )}
          </div>

          {/* Right Action Icons & User Dropdown */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <NotificationDropdown />

                <div className="h-6 w-px bg-[#2B3850]" />

                <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition p-1.5 rounded-xl hover:bg-[#182338]"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#6D5EF7]/20 border border-[#6D5EF7]/40 text-[#6D5EF7] flex items-center justify-center font-bold text-xs">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <span className="text-xs font-semibold max-w-[120px] truncate text-[#F1F5F9]">{user?.fullName}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#182338] rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#6D5EF7] hover:bg-[#5B4CE6] rounded-xl transition shadow-md shadow-[#6D5EF7]/25"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#182338] transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#2B3850] bg-[#121A2B] px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2">
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#182338]"
          >
            Browse All Items
          </Link>
          <Link
            to="/report-lost"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10"
          >
            Report Lost Belonging
          </Link>
          <Link
            to="/report-found"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-[#2DD4BF] hover:bg-[#2DD4BF]/10"
          >
            Report Found Item
          </Link>

          {isAuthenticated ? (
            <>
              <div className="pt-2 border-t border-[#2B3850]">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#182338]"
                >
                  User Dashboard
                </Link>
                <Link
                  to="/claims"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#182338]"
                >
                  My Claims &amp; Verification
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#182338]"
                >
                  Account Settings
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-white bg-[#6D5EF7] mt-2"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 mt-2 cursor-pointer"
                >
                  Sign Out ({user?.fullName})
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-[#2B3850] flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 text-sm font-medium text-[#F1F5F9] bg-[#182338] border border-[#2B3850] rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-[#6D5EF7] hover:bg-[#5B4CE6] rounded-xl shadow-md shadow-[#6D5EF7]/25"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
