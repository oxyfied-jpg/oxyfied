import api from './api';

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const paymentService = {
  // Step 1: Create order on backend (receives order details and public key)
  createOrder: async (courseId: string, amount: number) => {
    const response = await api.post('/payments/order', { courseId, amount });
    return response.data; // Returns { orderId, amount, currency, keyId }
  },

  // Step 2: Verify payment signatures on backend
  verifyPayment: async (courseId: string, paymentDetails: Partial<RazorpayResponse>) => {
    const response = await api.post('/payments/verify', { courseId, ...paymentDetails });
    return response.data; // Returns { success: true, enrolled: true }
  },

  // Launcher helper for Razorpay SDK (pre-loads script and triggers modal)
  initiateRazorpayPayment: async (
    courseId: string,
    amount: number,
    courseTitle: string,
    userEmail: string,
    userName: string,
    onSuccess: (paymentId: string) => void,
    onFailure: (errorMsg: string) => void
  ) => {
    try {
      // Create backend order
      const order = await paymentService.createOrder(courseId, amount);
      
      // Check if Razorpay script is loaded in browser
      if (!(window as any).Razorpay) {
        console.warn('Razorpay SDK not found, running backend-backed mock transaction...');
        
        // Simulate popup modal delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const mockResponse: RazorpayResponse = {
          razorpay_payment_id: `pay_${Math.random().toString(36).substring(2, 9)}`,
          razorpay_order_id: order.orderId,
          razorpay_signature: 'mock_signature_data_abc123'
        };

        const verification = await paymentService.verifyPayment(courseId, mockResponse);
        if (verification.success) {
          onSuccess(mockResponse.razorpay_payment_id);
        } else {
          onFailure('Payment verification failed.');
        }
        return;
      }

      // If Razorpay SDK is available, render real checkout
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Oxyfied',
        description: `Enrollment for ${courseTitle}`,
        order_id: order.orderId,
        handler: async (response: RazorpayResponse) => {
          const verification = await paymentService.verifyPayment(courseId, response);
          if (verification.success) {
            onSuccess(response.razorpay_payment_id);
          } else {
            onFailure('Backend verification of transaction signature failed.');
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: '#0A1128',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        onFailure(resp.error.description || 'Transaction cancelled or failed.');
      });
      rzp.open();

    } catch (err: any) {
      onFailure(err.message || 'Payment initiation failed.');
    }
  }
};
