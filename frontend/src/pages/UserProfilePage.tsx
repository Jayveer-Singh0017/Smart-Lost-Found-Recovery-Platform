import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.fullName || user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      setProfileError(null);
      await api.put('/users/profile', { fullName, phoneNumber });
      await refreshProfile();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    try {
      setChangingPassword(true);
      setPasswordError(null);
      await api.post('/users/change-password', { currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Password update failed. Verify current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[#F1F5F9]">
      <div>
        <h1 className="text-3xl font-extrabold text-[#F1F5F9] tracking-tight">Account Settings</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Manage your identity, communication phone, and login credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Card */}
        <div className="bg-[#121A2B] p-6 sm:p-8 rounded-2xl border border-[#2B3850] shadow-card space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#2B3850]">
            <div className="w-10 h-10 rounded-xl bg-[#6D5EF7]/15 text-[#8D82F9] border border-[#6D5EF7]/30 flex items-center justify-center">
              <User className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F1F5F9]">Personal Information</h2>
              <span className="text-xs text-slate-500">Account #{user?.userId}</span>
            </div>
          </div>

          {profileSuccess && (
            <div className="p-3 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
            </div>
          )}
          {profileError && (
            <div className="p-3 bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-medium flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> {profileError}
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                Email Address (Permanent)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-[#0B1020] border border-[#2B3850] rounded-xl text-sm text-[#94A3B8] cursor-not-allowed opacity-80"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={updatingProfile}
                className="w-full py-2.5 bg-[#6D5EF7] hover:bg-[#5B4CE6] text-white font-semibold rounded-xl text-xs shadow-md shadow-[#6D5EF7]/25 transition disabled:opacity-50 cursor-pointer"
              >
                {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-[#121A2B] p-6 sm:p-8 rounded-2xl border border-[#2B3850] shadow-card space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#2B3850]">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-[#8D82F9] border border-indigo-500/30 flex items-center justify-center">
              <Lock className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F1F5F9]">Security &amp; Password</h2>
              <span className="text-xs text-slate-500">BCrypt encrypted</span>
            </div>
          </div>

          {passwordSuccess && (
            <div className="p-3 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Password changed successfully!
            </div>
          )}
          {passwordError && (
            <div className="p-3 bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-medium flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={changingPassword || !currentPassword || !newPassword}
                className="w-full py-2.5 bg-[#182338] hover:bg-[#202E48] text-[#F1F5F9] border border-[#2B3850] font-semibold rounded-xl text-xs shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
