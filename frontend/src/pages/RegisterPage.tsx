import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/api';
import { Compass, Lock, Mail, User, Phone, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name cannot exceed 100 characters'),
  email: z.string().email('Please enter a valid email address').max(150, 'Email cannot exceed 150 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(50, 'Password cannot exceed 50 characters'),
  phoneNumber: z.string().max(30, 'Phone number cannot exceed 30 characters').optional().or(z.literal('')),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Clear any existing stale session tokens when visiting register page
  React.useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phoneNumber: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setSubmitting(true);
      setErrorMessage(null);
      await registerUser({
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        password: data.password,
        phoneNumber: data.phoneNumber ? data.phoneNumber.trim() : undefined,
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = getApiErrorMessage(err);
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0B1020]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#6D5EF7] to-[#8D82F9] flex items-center justify-center text-white shadow-lg shadow-[#6D5EF7]/30 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#F1F5F9]">
            Smart<span className="text-[#6D5EF7]">Recovery</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-[#F1F5F9]">Create your account</h2>
        <p className="mt-1.5 text-sm text-[#94A3B8]">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#6D5EF7] hover:text-[#8D82F9] transition">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#121A2B] py-8 px-6 shadow-2xl rounded-2xl border border-[#2B3850] sm:px-10">
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Alex Morgan"
                  {...register('fullName')}
                  className="w-full pl-10 pr-3.5 py-3 text-sm bg-[#182338] border border-[#2B3850] rounded-xl text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7] focus:border-[#6D5EF7] transition"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="alex.morgan@example.com"
                  {...register('email')}
                  className="w-full pl-10 pr-3.5 py-3 text-sm bg-[#182338] border border-[#2B3850] rounded-xl text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7] focus:border-[#6D5EF7] transition"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  {...register('password')}
                  className="w-full pl-10 pr-10 py-3 text-sm bg-[#182338] border border-[#2B3850] rounded-xl text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7] focus:border-[#6D5EF7] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-[#F1F5F9] transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5"
              >
                Phone Number <span className="text-slate-500 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 (555) 234-5678"
                  {...register('phoneNumber')}
                  className="w-full pl-10 pr-3.5 py-3 text-sm bg-[#182338] border border-[#2B3850] rounded-xl text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7] focus:border-[#6D5EF7] transition"
                />
              </div>
              {errors.phoneNumber && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.phoneNumber.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3.5 px-4 bg-[#6D5EF7] hover:bg-[#5B4CE6] text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-[#6D5EF7]/25 hover:shadow-lg hover:shadow-[#6D5EF7]/40 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
