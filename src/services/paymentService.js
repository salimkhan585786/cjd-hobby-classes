const razorpayScriptUrl = 'https://checkout.razorpay.com/v1/checkout.js';
const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SgZMmLz2jbgR6x';

let razorpayLoader;

export const loadRazorpayScript = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay checkout can only run in the browser.'));
  }

  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  if (razorpayLoader) {
    return razorpayLoader;
  }

  razorpayLoader = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${razorpayScriptUrl}"]`);

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.Razorpay), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Razorpay SDK failed to load')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = razorpayScriptUrl;
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
    document.body.appendChild(script);
  });

  return razorpayLoader;
};

export const createRazorpayOptions = ({
  amount,
  email,
  name,
  phone,
  orderId,
  notes,
  onSuccess,
  onDismiss,
}) => ({
  key: razorpayKeyId,
  amount: Math.round(Number(amount || 0) * 100),
  currency: 'INR',
  name: 'CJD Hobby Classes',
  description: `Art commission - ${orderId || 'order'}`,
  prefill: {
    name: name || 'CJD Hobby Classes Student',
    email: email || 'student@example.com',
    contact: phone || '',
  },
  notes: {
    orderId: orderId || '',
    ...notes,
  },
  theme: {
    color: '#7c3aed',
  },
  handler: onSuccess,
  modal: {
    ondismiss: onDismiss,
  },
});

export const openRazorpayCheckout = async (options) => {
  const Razorpay = await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const paymentObject = new Razorpay({
      ...options,
      handler: async (response) => {
        try {
          await options.handler?.(response);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ...options.modal,
        ondismiss: () => {
          options.modal?.ondismiss?.();
          resolve(null);
        },
      },
    });

    paymentObject.on('payment.failed', (response) => {
      reject(response.error || new Error('Payment failed'));
    });

    paymentObject.open();
  });
};
