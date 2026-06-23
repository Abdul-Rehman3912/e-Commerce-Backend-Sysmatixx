import stripe from '../config/stripe.js';
import Order from '../models/order.model.js';

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, shippingAddress, userId, user } = req.body;
    const resolvedUserId = userId || user;

    const totalAmount = products.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    const order = new Order({
      user: resolvedUserId,
      products: products.map(item => ({
        product: item._id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      totalAmount: totalAmount,
      shippingAddress: shippingAddress,
      paymentStatus: 'pending'
    });

    await order.save();

    const lineItems = products.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), 
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment-success?orderId=${order._id}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      metadata: {
        orderId: order._id.toString(),
        userId: resolvedUserId ? resolvedUserId.toString() : ''
      },
    });

    order.paymentIntentId = session.id; 
    await order.save();

    res.status(200).json({
      success: true,
      url: session.url 
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating payment',
      error: error.message
    });
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await handlePaymentSuccess(session);
  } else if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    await handlePaymentFailure(session);
  }

  res.json({ received: true });
};

async function handlePaymentSuccess(session) {
  try {
    const orderId = session.metadata.orderId;
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      orderStatus: 'processing'
    });
    console.log(`Order ${orderId} marked as PAID via webhook`);
  } catch (error) {
    console.error('Error handling webhook success:', error);
  }
}

async function handlePaymentFailure(session) {
  try {
    const orderId = session.metadata.orderId;
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'failed'
    });
    console.log(`Order ${orderId} marked as FAILED via webhook`);
  } catch (error) {
    console.error('Error handling webhook failure:', error);
  }
}

export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error getting payment status' });
  }
};