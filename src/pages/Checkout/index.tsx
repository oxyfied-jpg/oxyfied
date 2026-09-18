import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CreditCard, Loader2, Lock, ShieldCheck, ArrowLeft, Tag } from 'lucide-react';
import { courseService } from '../../services/courseService';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import type { Course } from '../../types';

export const Checkout: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, enrollInCourse, isAuthenticated } = useAuth();
  const { removeFromCart } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Dynamic course state
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load course details
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        setIsLoading(true);
        const data = await courseService.getCourseBySlug(courseId);
        setCourse(data);
      } catch (err) {
        console.error('Failed to load course details for checkout:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  // If user is not logged in, redirect to login with redirect back to this checkout
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/checkout/${courseId}`);
    }
  }, [isAuthenticated, courseId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] bg-warm-ivory flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-burnt-orange animate-spin" />
        <span className="text-xs text-warm-gray font-bold uppercase tracking-widest">Securing Checkout Order...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[60vh] bg-warm-ivory flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-deep-navy font-display">Course Not Found</h2>
        <Link to="/courses" className="btn-primary px-6 py-2.5 text-xs font-semibold rounded-xl shadow">
          Back to Courses
        </Link>
      </div>
    );
  }

  const basePrice = course.price;
  const finalPrice = Math.max(0, basePrice - discount);

  // Apply Coupon logic
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const code = couponCode.trim().toUpperCase();
    if (code === 'WELCOME10') {
      setDiscount(10);
      setCouponSuccess('₹10 Welcome discount applied!');
    } else if (code === 'OXYFIED60') {
      setCouponError('This course already has a 60% early discount applied to the price!');
    } else {
      setCouponError('Invalid promo code.');
    }
  };

  // Pay and Enroll
  const handlePayAndEnroll = async () => {
    if (!user) return;
    setIsProcessing(true);
    setPaymentError(null);

    // Call payment service launcher
    await paymentService.initiateRazorpayPayment(
      course.id,
      finalPrice,
      course.title,
      user.email,
      user.name,
      async (paymentId) => {
        // SUCCESS CALLBACK
        try {
          console.log('Payment processed successfully with ID:', paymentId);
          // Register enrollment in Auth state (simulates writing to user record)
          await enrollInCourse(course.id);
          // Remove from cart if present
          removeFromCart(course.id);
          setIsProcessing(false);
          // Navigate to classroom / my-courses
          navigate('/dashboard/my-courses');
        } catch (err) {
          setPaymentError('Enrollment database update failed.');
          setIsProcessing(false);
        }
      },
      (errorMsg) => {
        // FAILURE CALLBACK
        setPaymentError(errorMsg);
        setIsProcessing(false);
      }
    );
  };

  return (
    <div className="bg-warm-ivory min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="text-left space-y-1">
          <Link
            to={`/courses/${course.slug || course.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-warm-gray hover:text-deep-navy transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Course Details
          </Link>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-deep-navy">Secure Checkout</h1>
          <p className="text-warm-gray text-xs sm:text-sm">Complete your enrollment below to start learning immediately.</p>
        </div>

        {/* Form Grid: Invoices (7) vs Review (5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
          
          {/* Billing & Payment Details (7 cols) */}
          <main className="lg:col-span-7 bg-warm-white border border-light-taupe p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
            
            {/* Student Account Summary */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm text-deep-navy border-b border-light-taupe pb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-deep-navy text-warm-ivory flex items-center justify-center text-xs font-bold">1</span>
                Student Account
              </h3>
              <div className="p-4 bg-warm-ivory border border-light-taupe rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-deep-navy block text-sm">{user?.name}</span>
                  <span className="text-warm-gray block mt-0.5">{user?.email}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-sage-green/15 border border-sage-green/30 text-sage-green font-bold uppercase tracking-wider text-[10px]">
                  Logged In
                </span>
              </div>
            </div>

            {/* Payment Method selector */}
            <div className="space-y-4 pt-2">
              <h3 className="font-display font-bold text-sm text-deep-navy border-b border-light-taupe pb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-deep-navy text-warm-ivory flex items-center justify-center text-xs font-bold">2</span>
                Payment Method
              </h3>
              
              <div className="border border-burnt-orange/20 bg-burnt-orange/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-burnt-orange">
                    <CreditCard className="w-4 h-4" />
                    Razorpay Secure Gateway
                  </span>
                  <span className="inline-flex gap-1.5">
                    <span className="text-[9px] font-bold bg-warm-white text-deep-navy border border-light-taupe px-2 py-0.5 rounded uppercase">Visa</span>
                    <span className="text-[9px] font-bold bg-warm-white text-deep-navy border border-light-taupe px-2 py-0.5 rounded uppercase">MC</span>
                    <span className="text-[9px] font-bold bg-warm-white text-deep-navy border border-light-taupe px-2 py-0.5 rounded uppercase">UPI</span>
                  </span>
                </div>
                <p className="text-xs text-warm-gray leading-relaxed">
                  Secure instant checkout via cards, UPI, net banking, or wallets. We never store your financial credentials.
                </p>
              </div>
            </div>

            {/* Payment actions block */}
            {paymentError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                <Lock className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            <div className="pt-4 space-y-3">
              <button
                onClick={handlePayAndEnroll}
                disabled={isProcessing}
                className="btn-primary w-full py-4 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay & Enroll (₹{finalPrice})
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-1.5 text-xs text-warm-gray font-medium">
                <ShieldCheck className="w-4 h-4 text-sage-green" />
                <span>256-Bit SSL Encrypted & 14-Day Money Back Guarantee</span>
              </div>
            </div>
          </main>

          {/* Invoice Summary sidebar (5 cols) */}
          <aside className="lg:col-span-5 bg-warm-white border border-light-taupe rounded-2xl shadow-sm p-6 space-y-6">
            <h3 className="font-display font-bold text-sm text-deep-navy border-b border-light-taupe pb-2">
              Order Summary
            </h3>

            {/* Course row info */}
            <div className="flex gap-4 border-b border-light-taupe pb-4">
              <img
                src={course.image}
                alt={course.title}
                className="w-20 h-14 rounded-lg object-cover border border-light-taupe flex-shrink-0"
              />
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-burnt-orange tracking-wider block">
                  {course.category}
                </span>
                <span className="font-display font-bold text-xs text-deep-navy block leading-tight">
                  {course.title}
                </span>
                <span className="text-[10px] text-warm-gray font-medium">{course.duration} • Lifetime Access</span>
              </div>
            </div>

            {/* Coupon Promo form */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label htmlFor="promo-input" className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block flex items-center gap-1">
                <Tag className="w-3 h-3 text-burnt-orange" />
                Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="promo-input"
                  placeholder="e.g. WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 bg-warm-ivory border border-light-taupe text-xs rounded-xl focus:outline-none focus:bg-warm-white focus:border-burnt-orange text-deep-navy placeholder-warm-gray/60"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-deep-navy hover:bg-deep-navy/90 text-white text-xs font-bold rounded-xl transition-colors flex-shrink-0 shadow-sm"
                >
                  Apply
                </button>
              </div>
              {couponError && <span className="text-[10px] text-red-600 font-semibold block">{couponError}</span>}
              {couponSuccess && <span className="text-[10px] text-sage-green font-semibold block">{couponSuccess}</span>}
            </form>

            {/* Price Calculations */}
            <div className="space-y-3 text-xs border-t border-light-taupe pt-4 font-medium text-warm-gray">
              <div className="flex justify-between">
                <span>Subtotal Price</span>
                <span className="text-deep-navy font-semibold">₹{course.price}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sage-green font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-deep-navy border-t border-light-taupe pt-3">
                <span>Total Due</span>
                <span className="text-burnt-orange text-lg font-extrabold">₹{finalPrice}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
