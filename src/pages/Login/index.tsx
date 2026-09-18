import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Key, Mail, ShieldAlert, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Validation Schema
const loginSchema = zod.object({
  email: zod.string().email({ message: 'Please enter a valid email address.' }),
  password: zod.string().min(6, { message: 'Password must be at least 6 characters.' }),
  rememberMe: zod.boolean().optional()
});

type LoginFormData = zod.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quickLoginRole, setQuickLoginRole] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  // Ensure clean state on login mount
  useEffect(() => {
    const token = localStorage.getItem('Oxyfied_token');
    const user = localStorage.getItem('Oxyfied_user');
    if (!token && user) {
      localStorage.removeItem('Oxyfied_user');
    }
  }, []);

  const handleRedirect = (loggedInUser: any) => {
    const targetRedirect = searchParams.get('redirect');
    if (targetRedirect && targetRedirect !== '/login' && targetRedirect !== '/register' && targetRedirect !== '/dashboard' && targetRedirect !== '/dashboard/') {
      if (targetRedirect.startsWith('/admin')) {
        if (loggedInUser?.role === 'admin') navigate(targetRedirect);
        else if (loggedInUser?.role === 'mentor') navigate('/mentor/dashboard');
        else navigate('/dashboard');
      } else if (targetRedirect.startsWith('/mentor')) {
        if (loggedInUser?.role === 'mentor') navigate(targetRedirect);
        else if (loggedInUser?.role === 'admin') navigate('/admin/dashboard');
        else navigate('/dashboard');
      } else {
        if (loggedInUser?.role === 'mentor' && !targetRedirect.startsWith('/mentor')) {
          navigate('/mentor/dashboard');
        } else if (loggedInUser?.role === 'admin' && !targetRedirect.startsWith('/admin')) {
          navigate('/admin/dashboard');
        } else {
          navigate(targetRedirect);
        }
      }
    } else {
      if (loggedInUser?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (loggedInUser?.role === 'mentor') {
        navigate('/mentor/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleQuickLogin = async (emailVal: string, passwordVal: string, roleKey: string) => {
    setErrorMsg(null);
    setQuickLoginRole(roleKey);
    setValue('email', emailVal, { shouldValidate: true });
    setValue('password', passwordVal, { shouldValidate: true });

    try {
      const success = await login(emailVal, passwordVal);
      if (success) {
        const userJson = localStorage.getItem('Oxyfied_user');
        const loggedInUser = userJson ? JSON.parse(userJson) : null;
        handleRedirect(loggedInUser);
      } else {
        setErrorMsg('Invalid credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        if (err.response.data.code === 'ACCOUNT_ALREADY_LOGGED_IN') {
          setErrorMsg('This account is already active on another device. Please log out from your other device before signing in here.');
        } else {
          setErrorMsg(err.response.data.error || 'Login failed. Please verify your credentials.');
        }
      } else {
        setErrorMsg('Login failed. Please check if your backend server is running and your database is reachable.');
      }
    } finally {
      setQuickLoginRole(null);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg(null);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        const userJson = localStorage.getItem('Oxyfied_user');
        const loggedInUser = userJson ? JSON.parse(userJson) : null;
        handleRedirect(loggedInUser);
      } else {
        setErrorMsg('Invalid credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        if (err.response.data.code === 'ACCOUNT_ALREADY_LOGGED_IN') {
          setErrorMsg('This account is already active on another device. Please log out from your other device before signing in here.');
        } else {
          setErrorMsg(err.response.data.error || 'Login failed. Please verify your credentials.');
        }
      } else {
        setErrorMsg('Login failed. Please check if your backend server is running and your database is reachable.');
      }
    }
  };

  const isBusy = isSubmitting || quickLoginRole !== null;

  return (
    <div className="bg-warm-ivory min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-warm-white border border-light-taupe p-8 rounded-2xl shadow-lg space-y-6 text-left">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group justify-center">
            <span className="font-display font-extrabold text-xl tracking-tight text-deep-navy">
              Oxyfied
            </span>
          </Link>
          <h2 className="text-2xl font-display font-bold text-deep-navy mt-2">Welcome Back</h2>
          <p className="text-xs sm:text-sm text-warm-gray">Sign in to resume building tech capabilities.</p>
        </div>

        {/* Demo Credentials Quick Switcher */}
        <div className="p-3.5 bg-warm-ivory border border-light-taupe rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-burnt-orange" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-burnt-orange">
                Instant Demo Access
              </span>
            </div>
            <span className="text-[9px] text-warm-gray font-medium">1-Click Sign In</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleQuickLogin('admin@oxyfied.com', 'adminpassword123', 'admin')}
              className="p-2.5 text-left rounded-lg bg-warm-white hover:bg-soft-beige border border-light-taupe hover:border-burnt-orange/50 transition-all group disabled:opacity-60 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-deep-navy block group-hover:text-burnt-orange">
                  Administrator
                </span>
                {quickLoginRole === 'admin' && <Loader2 className="w-3 h-3 text-burnt-orange animate-spin" />}
              </div>
              <span className="text-[8px] text-warm-gray font-mono block truncate">
                admin@oxyfied.com
              </span>
            </button>

            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleQuickLogin('evelyn.vance@oxyfied.com', 'mentorpassword123', 'mentor-evelyn')}
              className="p-2.5 text-left rounded-lg bg-warm-white hover:bg-soft-beige border border-light-taupe hover:border-burnt-orange/50 transition-all group disabled:opacity-60 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-deep-navy block group-hover:text-burnt-orange">
                  Mentor (Dr. Evelyn)
                </span>
                {quickLoginRole === 'mentor-evelyn' && <Loader2 className="w-3 h-3 text-burnt-orange animate-spin" />}
              </div>
              <span className="text-[8px] text-warm-gray font-mono block truncate">
                evelyn.vance@oxyfied.com
              </span>
            </button>

            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleQuickLogin('michael.kovac@oxyfied.com', 'mentorpassword123', 'mentor-michael')}
              className="p-2.5 text-left rounded-lg bg-warm-white hover:bg-soft-beige border border-light-taupe hover:border-burnt-orange/50 transition-all group disabled:opacity-60 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-deep-navy block group-hover:text-burnt-orange">
                  Mentor (Michael K.)
                </span>
                {quickLoginRole === 'mentor-michael' && <Loader2 className="w-3 h-3 text-burnt-orange animate-spin" />}
              </div>
              <span className="text-[8px] text-warm-gray font-mono block truncate">
                michael.kovac@oxyfied.com
              </span>
            </button>

            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleQuickLogin('student@oxyfied.com', 'studentpassword123', 'student')}
              className="p-2.5 text-left rounded-lg bg-warm-white hover:bg-soft-beige border border-light-taupe hover:border-burnt-orange/50 transition-all group disabled:opacity-60 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-deep-navy block group-hover:text-burnt-orange">
                  Student
                </span>
                {quickLoginRole === 'student' && <Loader2 className="w-3 h-3 text-burnt-orange animate-spin" />}
              </div>
              <span className="text-[8px] text-warm-gray font-mono block truncate">
                student@oxyfied.com
              </span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
            <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Field: Email */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="login-email"
                placeholder="e.g. name@oxyfied.com"
                {...register('email')}
                className={`w-full pl-9 pr-3 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy placeholder-warm-gray/60 focus:outline-none focus:bg-warm-white transition-all ${
                  errors.email ? 'border-red-500 focus:border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                }`}
              />
              <Mail className="w-4 h-4 text-warm-gray absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {errors.email && <span className="text-[10px] text-red-600 font-medium">{errors.email.message}</span>}
          </div>

          {/* Field: Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="login-password" className="text-[10px] font-bold text-deep-navy uppercase tracking-widest">
                Password
              </label>
              <Link to="/forgot-password" className="text-[10px] font-semibold text-burnt-orange hover:text-deep-orange">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                id="login-password"
                placeholder="••••••••"
                {...register('password')}
                className={`w-full pl-9 pr-3 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy placeholder-warm-gray/60 focus:outline-none focus:bg-warm-white transition-all ${
                  errors.password ? 'border-red-500 focus:border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                }`}
              />
              <Key className="w-4 h-4 text-warm-gray absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {errors.password && <span className="text-[10px] text-red-600 font-medium">{errors.password.message}</span>}
          </div>

          {/* Field: Remember me */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember-me"
              {...register('rememberMe')}
              className="w-4 h-4 border-light-taupe rounded bg-warm-ivory text-burnt-orange focus:ring-burnt-orange"
            />
            <label htmlFor="remember-me" className="ml-2 text-xs text-warm-gray select-none">
              Remember me on this browser
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3.5 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
            <LogIn className="w-4 h-4" />
          </button>
        </form>

        <div className="border-t border-light-taupe pt-4 text-center">
          <p className="text-xs text-warm-gray">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-burnt-orange hover:text-deep-orange">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
