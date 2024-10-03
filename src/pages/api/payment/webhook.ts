import { Collections, Status } from "@/constants/database";
import connectToDatabase from "@/lib/clientDB";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const endpointSecret = "whsec_pBehdHWloO4IO9oWmgL4vC4lObQFg7hQ";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== 'POST') {
    res.status(420).send('Not correct request.');
    return;
  }
  let event = req.body;
  // Handle the event
  // if (endpointSecret) {
  //   // Get the signature sent by Stripe
  //   const signature = req.headers['stripe-signature'] as string;
  //   console.log(signature, '===signature')

  //   try {
  //     res.status(200).send('Ok');
  //     const body = await buffer(req);
  //     event = stripe.webhooks.constructEvent(
  //       body,
  //       signature,
  //       endpointSecret
  //     );
  //     console.log(event, '===event')
  //   } catch (err) {
  //     console.log(`⚠️  Webhook signature verification failed.`);
  //   }
  // }

  if (event?.type === 'checkout.session.completed') {
    const subscription = event?.data?.object;
    await handleSessionCompleted(subscription, stripe)
  } else {
    console.log(event.type)
  }

  // Return a 200 res to acknowledge receipt of the event
  res.status(200).send('Ok');
}

const buffer = (req: NextApiRequest) => {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    req.on('error', reject);
  });
};

const handleSessionCompleted = async (subscriptionData: any, stripe: Stripe) => {
  try {
    if (subscriptionData.status === 'complete') {
      const { user, lookupKey, prevCheckoutId } = subscriptionData.metadata;
      const { client, db } = await connectToDatabase();
      const userCollection = db.collection(Collections.User);

      const subscribe = await stripe.subscriptions.retrieve(subscriptionData.subscription)
      await userCollection.updateOne({ _id: new ObjectId(user) },
        {
          $set: {
            status: Status.ACTIVE,
            lookupKey: lookupKey,
            subscriptionEnd: subscribe.current_period_end
          }
        })

      // Insert subscription
      const subCollection = db.collection(Collections.Subscription);
      await subCollection.updateOne({ checkoutId: subscriptionData.id }, { $set: { status: Status.ACTIVE } })

      if (prevCheckoutId) {
        // Update subscription status
        await subCollection.updateOne({ checkoutId: prevCheckoutId }, { $set: { status: Status.UPGRADE } })
        const reSession = await stripe.checkout.sessions.retrieve(prevCheckoutId)

        // Cancel subscription
        const subscriptionId = reSession?.subscription as string
        await stripe.subscriptions.cancel(subscriptionId);
      }

      client.close();
    }
  } catch (error) {
    console.log(error)
  }
}
