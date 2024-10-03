const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

export async function getPaymentInfo() {
  const prices = await stripe.prices.list({
    expand: ['data.product']
  });

  const info = {
    prices: prices.data
  }

  return info;
}

export async function createCustomer(email: string) {
  const customer = await stripe.customers.create({
    email: email,
  });

  return customer;
}

export async function createSubscription(customerId: string, priceId: string) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{
      price: priceId,
    }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });

  return subscription;
}

export async function cancelSubscription(subscriptionId: string) {
  const deletedSubscription = await stripe.subscriptions.del(
    subscriptionId
  );

  return deletedSubscription;
}

export async function getSubscriptions(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    expand: ['data.default_payment_method'],
  });

  return subscriptions;
}