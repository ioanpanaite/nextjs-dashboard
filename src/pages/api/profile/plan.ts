import { Collections, Status } from "@/constants/database";
import corsMiddleware from "@/cors";
import connectToDatabase from "@/lib/clientDB";
import type { NextApiRequest, NextApiResponse } from "next";
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await corsMiddleware(req, res);
  const { origin } = req.headers;

  try {
    const data = req.body;

    const { client, db } = await connectToDatabase();
    // Check existing user by email
    const existingUser = await db.collection(Collections.User).findOne({ email: data.email });
    if (!existingUser) {
      client.close();
      res.status(422).json({ success: false, message: "Invalid user." })
      return;
    }

    if (existingUser.lookupKey === data.lookup_key) {
      client.close();
      res.status(422).json({ success: false, message: "You have already the plan." })
      return;
    }

    if (existingUser.lookupKey) {
      const existingSub = await db.collection(Collections.Subscription)
        .findOne({
          $and: [
            { userId: existingUser._id.toString() },
            { status: Status.ACTIVE }
          ]
        })

      if (existingSub?.checkoutId) {
        const checkoutSession = await stripe.checkout.sessions.retrieve(existingSub?.checkoutId);
        if (checkoutSession?.subscription) {
          const subscription = await stripe.subscriptions.retrieve(checkoutSession?.subscription);
          const currentTime = new Date().getTime()
          const currentDifferent = (subscription.current_period_end * 1000) - currentTime
          const aWeek = 3 * 24 * 60 * 60 * 1000

          if (currentDifferent < aWeek) {
            client.close();
            res.status(422).json({ success: false, message: "Current plan entered the queue." })
            return;
          } else {
            await stripe.subscriptions.cancel(checkoutSession?.subscription);
            await db.collection(Collections.Subscription).updateOne(
              {
                $and: [
                  { userId: existingUser._id.toString() },
                  { status: Status.ACTIVE }
                ]
              },
              {
                $set: {
                  status: Status.CANCELLED,
                  updatedAt: new Date().toISOString()
                }
              }
            )
          }
        }
      }
    }

    const timeAt = new Date().toISOString();
    if (data.lookup_key) {
      const prices = await stripe.prices.list({
        lookup_keys: [data.lookup_key],
        expand: ['data.product'],
      });
      const priceId = prices.data[0].id;

      if (!priceId) {
        res.status(422).json({ success: false, message: "Something went wrong in payment setting. Please contact to support team." }); return;
      }

      const subCollection = db.collection(Collections.Subscription);
      const subscription = await subCollection.findOne({ userId: existingUser._id.toString() })

      if (subscription) {
        if (priceId === subscription.stripePriceId) {
          client.close();
          res.status(422).json({ success: false, message: "You have already membership." })
          return;
        } else {
          await db.collection(Collections.Subscription).updateOne(
            {
              $and: [
                { userId: existingUser._id.toString() },
                { status: Status.ACTIVE }
              ]
            },
            {
              $set: {
                status: Status.UPGRADE,
                updatedAt: timeAt,
              }
            }
          )
        }
      }

      // Create stripe checkout session
      const session = await stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        line_items: [
          {
            price: priceId,
            // For metered billing, do not pass quantity
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${origin}/profile/thank-you`,
        cancel_url: `${origin}/profile/cancelled`,
        metadata: { user: existingUser._id.toString(), lookupKey: data.lookup_key, prevCheckoutId: subscription?.checkoutId }
      });

      // Create subscription into db
      await subCollection.insertOne({
        userId: existingUser._id.toString(),
        checkoutId: session.id,
        stripePriceId: priceId,
        status: Status.PENDING,
        createdAt: timeAt,
        updatedAt: timeAt,
      })
      
      client.close();
      res.status(200).json({ success: true, url: session.url });
    }

    res.end()
  } catch (error) {
    console.log("PAYMENT: ", error);
    res.status(400).send({ success: false, message: "Something went wrong." });
  }
}