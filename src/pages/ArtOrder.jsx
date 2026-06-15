import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, CreditCard, ImagePlus, Package } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StatusPill from '../components/StatusPill';
import { useAuth } from '../hooks/useAuth';
import { useOrders, useStudentOrders } from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import { addOrder, updateOrder, uploadGalleryImage } from '../services/dataService';
import { initiateSecurePayment } from '../services/paymentService';
import { formatCurrency, formatDate } from '../utils/helpers';

const basePriceByStyle = {
  Portrait: 6500,
  Sketch: 4200,
  Painting: 8900,
  Digital: 5600,
};

const sizeMultiplier = {
  A4: 1,
  A3: 1.35,
  Custom: 1.8,
};

function OrderManager() {
  const { orders, loading, setOrders } = useOrders();
  const { showToast } = useToast();

  const handleStatusUpdate = async (orderId, patch) => {
    const nextOrders = orders.map((item) => (item.id === orderId ? { ...item, ...patch } : item));
    setOrders(nextOrders);

    try {
      await updateOrder(orderId, patch);
      showToast({
        type: 'success',
        title: 'Order updated',
        message: 'The order status has been saved.',
      });
    } catch (error) {
      console.error(error);
      showToast({
        type: 'error',
        title: 'Update failed',
        message: 'The order status could not be updated right now.',
      });
    }
  };

  if (loading) {
    return <LoadingSkeleton className="h-80" />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No art orders yet"
        description="Customer portrait, sketch, and painting requests will appear here for review."
      />
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="glass-card rounded-[2rem] border border-white/10 p-6 shadow-soft">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold text-white sm:text-2xl">{order.studentName || order.studentEmail}</h2>
                <StatusPill value={order.status} />
                <StatusPill value={order.paymentStatus} />
              </div>
              <p className="mt-2 text-slate-400">
                {order.style} • {order.size} • {formatCurrency(order.price)}
              </p>
              <p className="mt-4 text-slate-300">{order.description}</p>
              <p className="mt-4 text-sm text-slate-400">
                Ordered on {formatDate(order.createdAt)} • Delivery: {order.deliveryStatus || 'not started'}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <button
                type="button"
                onClick={() => handleStatusUpdate(order.id, { status: 'in-progress', deliveryStatus: 'artist assigned' })}
                className="rounded-full border border-white/10 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/5"
              >
                Mark in progress
              </button>
              <button
                type="button"
                onClick={() => handleStatusUpdate(order.id, { status: 'completed', deliveryStatus: 'delivered', paymentStatus: 'paid' })}
                className="rounded-full bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                Complete order
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderRequestForm() {
  const { user } = useAuth();
  const { orders, loading: ordersLoading, setOrders } = useStudentOrders();
  const { showToast } = useToast();
  const [style, setStyle] = useState('Portrait');
  const [size, setSize] = useState('A4');
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const price = useMemo(
    () => Math.round((basePriceByStyle[style] || 6500) * (sizeMultiplier[size] || 1)),
    [style, size]
  );

  useEffect(() => {
    setName(user?.displayName || '');
    setEmail(user?.email || '');
  }, [user]);

  const openCheckoutForOrder = async (orderId, orderDetails) => {
    try {
      setStatus('Opening secure payment checkout...');
      await initiateSecurePayment({
        amount: orderDetails.price,
        email: orderDetails.studentEmail,
        name: orderDetails.studentName,
        phone: orderDetails.phone,
        orderId,
        notes: {
          style: orderDetails.style,
          size: orderDetails.size,
        },
        onSuccess: async (response) => {
          const paidPatch = {
            status: 'in-progress',
            paymentStatus: 'paid',
            deliveryStatus: 'artist assigned',
            paymentId: response.razorpay_payment_id,
            orderReference: response.razorpay_order_id || '',
            paymentSignature: response.razorpay_signature,
            paidAt: new Date().toISOString(),
          };

          setStatus('Payment successful! Confirming your order...');
          await updateOrder(orderId, paidPatch);
          setOrders((current) => current.map((item) => (item.id === orderId ? { ...item, ...paidPatch } : item)));
          setStatus('Your art order is confirmed. We will contact you soon.');
          showToast({
            type: 'success',
            title: 'Order confirmed',
            message: 'Your payment was captured and the order is now in progress.',
          });
        },
        onDismiss: () => {
          setStatus('Payment canceled. Your order is saved as a pending request.');
          showToast({
            type: 'info',
            title: 'Order saved as pending',
            message: 'You can retry payment later from your order tracking list.',
          });
        },
      });
    } catch (error) {
      console.error('Payment error:', error);
      setStatus(`Payment failed: ${error.message || 'Please try again later.'}`);
      showToast({
        type: 'error',
        title: 'Payment failed',
        message: error.message || 'The payment could not be completed.',
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name || !email || !description.trim()) {
      setStatus('Please fill in your name, email, and order description before continuing.');
      return;
    }

    setProcessing(true);
    setStatus('Preparing your order...');

    try {
      const referenceFile = fileInputRef.current?.files?.[0];
      let referenceUrl = '';

      if (referenceFile) {
        const filePath = `orders/${Date.now()}_${referenceFile.name}`;
        referenceUrl = await uploadGalleryImage(referenceFile, filePath);
      }

      const order = {
        studentId: user?.uid || null,
        studentName: name,
        studentEmail: email,
        phone,
        style,
        size,
        price,
        description: description.trim(),
        referenceUrl,
        status: 'pending',
        paymentStatus: 'pending',
        deliveryStatus: 'awaiting payment',
        createdAt: new Date().toISOString(),
      };

      const orderId = await addOrder(order);
      const localOrder = { ...order, id: orderId };
      setOrders([localOrder, ...orders.filter((item) => !String(item.id).startsWith('order-fallback'))]);
      setStatus('Opening payment checkout...');
      await openCheckoutForOrder(orderId, order);
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error(error);
      if (typeof error === 'object' && error?.code) {
        setStatus(`Payment failed: ${error.description || 'Please try again later.'}`);
      } else {
        setStatus('Unable to submit order or complete payment. Please try again later.');
      }
      showToast({
        type: 'error',
        title: 'Order failed',
        message: 'The order was not fully completed. Please try again.',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRetryPayment = async (order) => {
    try {
      setProcessing(true);
      setStatus('Reopening checkout for your pending order...');
      await openCheckoutForOrder(order.id, order);
    } catch (error) {
      console.error(error);
      setStatus('The pending payment could not be retried right now.');
      showToast({
        type: 'error',
        title: 'Retry failed',
        message: 'The payment window could not be reopened.',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_0.7fr]">
      <div className="glass-card rounded-[3rem] border border-white/10 bg-slate-950/90 p-6 sm:p-8 lg:p-10 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Art order</p>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">Order your custom artwork with clarity.</h1>
        <p className="mt-4 text-slate-400">
          Choose a style, upload a reference, and receive a polished estimate for your commissioned piece.
        </p>
        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[2rem] bg-slate-900/80 p-6">
              <label className="text-sm text-slate-300">Full name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                placeholder="Your name"
                className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-slate-100"
              />
            </div>
            <div className="rounded-[2rem] bg-slate-900/80 p-6">
              <label className="text-sm text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="you@example.com"
                className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-slate-100"
              />
            </div>
          </div>
          <div className="rounded-[2rem] bg-slate-900/80 p-6">
            <label className="text-sm text-slate-300">Phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Optional"
              className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-slate-100"
            />
          </div>
          <div className="rounded-[2rem] bg-slate-900/80 p-6">
            <div className="flex items-center gap-3 text-violet-300">
              <Camera size={20} />
              <span>Reference upload</span>
            </div>
            <label htmlFor="reference-file" className="sr-only">Upload reference image</label>
            <input ref={fileInputRef} id="reference-file" type="file" accept="image/*" className="mt-4 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-slate-100" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[2rem] bg-slate-900/80 p-6">
              <label className="text-sm text-slate-300">Art style</label>
              <select value={style} onChange={(event) => setStyle(event.target.value)} className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-slate-100">
                {Object.keys(basePriceByStyle).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-[2rem] bg-slate-900/80 p-6">
              <label className="text-sm text-slate-300">Size</label>
              <select value={size} onChange={(event) => setSize(event.target.value)} className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-slate-100">
                {Object.keys(sizeMultiplier).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="rounded-[2rem] bg-slate-900/80 p-6">
            <label className="text-sm text-slate-300">Order description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows="4"
              placeholder="Describe your commission request"
              required
              className="mt-4 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-slate-100"
            />
          </div>
          <div className="rounded-[2rem] bg-slate-900/80 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Pricing estimator</p>
                <p className="mt-2 text-xl font-semibold text-white sm:text-2xl lg:text-3xl">{formatCurrency(price)}</p>
              </div>
              <div className="rounded-3xl bg-violet-500/10 px-4 py-3 text-violet-200">{size}</div>
            </div>
            <p className="mt-4 text-slate-400">
              Delivery updates, payment progress, and order tracking are all visible once your request is submitted.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: ImagePlus, label: 'Reference images' },
              { icon: Package, label: 'Delivery status' },
              { icon: CreditCard, label: 'Payment progress' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[2rem] bg-slate-900/80 p-6 text-slate-300 shadow-soft">
                  <div className="flex items-center gap-3 text-violet-300">
                    <Icon size={20} />
                  </div>
                  <p className="mt-4 text-white">{item.label}</p>
                </div>
              );
            })}
          </div>
          {status ? <p className="text-sm text-slate-300">{status}</p> : null}
          <button disabled={processing} className="mt-4 rounded-full bg-violet-500 px-8 py-4 text-base font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-violet-700">
            {processing ? 'Processing...' : 'Submit order request'}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <div className="glass-card rounded-[3rem] border border-white/10 bg-slate-900/80 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Order guide</p>
          <ol className="mt-6 space-y-4 text-slate-300">
            <li className="rounded-3xl bg-slate-950/80 p-5">1. Choose your art style and size.</li>
            <li className="rounded-3xl bg-slate-950/80 p-5">2. Upload clear references and explain your vision.</li>
            <li className="rounded-3xl bg-slate-950/80 p-5">3. Review the estimate and complete checkout to confirm the commission.</li>
          </ol>
        </div>

        <div className="glass-card rounded-[3rem] border border-white/10 bg-slate-900/80 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Your order tracking</p>
          {ordersLoading ? (
            <div className="mt-6 space-y-4">
              <LoadingSkeleton className="h-24" />
              <LoadingSkeleton className="h-24" />
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-6">
              <EmptyState title="No orders yet" description="Your submitted portrait, sketch, and painting requests will appear here." />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="rounded-3xl bg-slate-950/80 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">
                        {order.style} • {order.size}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">{formatCurrency(order.price)}</p>
                    </div>
                    <StatusPill value={order.deliveryStatus || order.status} />
                  </div>
                  {order.paymentStatus === 'pending' ? (
                    <button
                      type="button"
                      onClick={() => handleRetryPayment(order)}
                      disabled={processing}
                      className="mt-4 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:text-slate-500"
                    >
                      Retry payment
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ArtOrder() {
  const { role } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
      {role === 'admin' ? <OrderManager /> : <OrderRequestForm />}
    </div>
  );
}

export default ArtOrder;
