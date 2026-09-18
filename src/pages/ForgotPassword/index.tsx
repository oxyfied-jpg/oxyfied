import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { authService } from '../../services/authService';

const forgotSchema = zod.object({
  email: zod.string().email({ message: 'Please enter a valid email address.' })
});

type ForgotFormData = zod.infer<typeof forgotSchema>;

export const ForgotPassword: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema)
  });

  const onSubmit = async (data: ForgotFormData) => {
    setErrorMsg(null);
    try {
      const resp = await authService.forgotPassword(data.email);
      if (resp.success) {
        setSuccess(true);
      } else {
        setErrorMsg('Failed to process request. Verify your input.');
      }
    } catch (err) {
      setErrorMsg('Network error requesting recovery token.');
    }
  };

  return (
    <div className="bg-warm-ivory min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-warm-white border border-light-taupe p-8 rounded-2xl shadow-lg space-y-6 text-left">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <span className="w-8 h-8 rounded-lg bg-deep-navy text-warm-ivory flex items-center justify-center font-display font-black text-base shadow-sm">
              O
            </span>
            <span className="font-display font-extrabold text-xl tracking-tight text-deep-navy">
              Oxyfied
            </span>
          </Link>
          <h2 className="text-2xl font-display font-bold text-deep-navy mt-2">Reset Password</h2>
          <p className="text-xs sm:text-sm text-warm-gray">We will email you a secure link to reset your password.</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
            <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-sage-green/15 border border-sage-green/30 text-deep-navy text-xs rounded-xl flex items-start gap-2.5 font-medium">
              <CheckCircle2 className="w-5 h-5 text-sage-green flex-shrink-0" />
              <div>
                <span className="font-bold block text-deep-navy">Reset Email Sent!</span>
                <span className="text-warm-gray">Please check your inbox (and spam folder) for instructions to restore access.</span>
              </div>
            </div>
            <Link
              to="/login"
              className="btn-primary w-full py-3.5 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2 shadow"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Field: Email */}
            <div className="space-y-1.5">
              <label htmlFor="forgot-email" className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="forgot-email"
                  placeholder="e.g. john@oxyfied.com"
                  {...register('email')}
                  className={`w-full pl-9 pr-3 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy placeholder-warm-gray/60 focus:outline-none focus:bg-warm-white transition-all ${
                    errors.email ? 'border-red-500 focus:border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                <Mail className="w-4 h-4 text-warm-gray absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.email && <span className="text-[10px] text-red-600 font-medium">{errors.email.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow"
            >
              {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-warm-gray hover:text-deep-navy transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
