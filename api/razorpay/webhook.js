import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);

  if (WEBHOOK_SECRET && signature) {
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }
  }

  try {
    const event = req.body;
    console.log('Razorpay webhook received:', event.event);

    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        console.log('Payment captured:', payment.id, 'Order:', payment.order_id);
        break;
      }
      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        console.log('Payment failed:', payment.id, 'Error:', payment.error_description);
        break;
      }
      case 'order.paid': {
        const order = event.payload.order.entity;
        console.log('Order paid:', order.id);
        break;
      }
      case 'refund.created': {
        const refund = event.payload.refund.entity;
        console.log('Refund created:', refund.id, 'Payment:', refund.payment_id);
        break;
      }
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}