import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/api';
import { Compass, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Clear any existing stale session tokens when visiting login page
  React.useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setSubmitting(true);
      setErrorMessage(null);
      await login(data.email.trim(), data.password);
      navigate(from, { replace: true });
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
        <h2 className="text-2xl font-bold tracking-tight text-[#F1F5F9]">Sign in to your account</h2>
        <p className="mt-1.5 text-sm text-[#94A3B8]">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-[#6D5EF7] hover:text-[#8D82F9] transition">
            Create an account
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="name@example.com"
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
                className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-[#6D5EF7] hover:bg-[#5B4CE6] text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-[#6D5EF7]/25 hover:shadow-lg hover:shadow-[#6D5EF7]/40 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Sign In</span>
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
