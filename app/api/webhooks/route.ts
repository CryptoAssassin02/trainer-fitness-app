import Stripe from 'stripe';
import { stripe } from '@/utils/stripe/config';
import { logger } from '@/utils/logger';
import {
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
  deleteProductRecord,
  deletePriceRecord
} from '@/utils/supabase/admin';

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'product.deleted',
  'price.created',
  'price.updated',
  'price.deleted',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted'
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) {
      logger.error('Webhook secret not found');
      return new Response('Webhook secret not found.', { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    logger.info(`Webhook received: ${event.type}`);
  } catch (err: any) {
    logger.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated':
          await upsertProductRecord(event.data.object as Stripe.Product);
          logger.info(`Product ${event.type}`, { productId: (event.data.object as Stripe.Product).id });
          break;
        case 'price.created':
        case 'price.updated':
          await upsertPriceRecord(event.data.object as Stripe.Price);
          logger.info(`Price ${event.type}`, { priceId: (event.data.object as Stripe.Price).id });
          break;
        case 'price.deleted':
          await deletePriceRecord(event.data.object as Stripe.Price);
          logger.info('Price deleted', { priceId: (event.data.object as Stripe.Price).id });
          break;
        case 'product.deleted':
          await deleteProductRecord(event.data.object as Stripe.Product);
          logger.info('Product deleted', { productId: (event.data.object as Stripe.Product).id });
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === 'customer.subscription.created'
          );
          logger.info(`Subscription ${event.type}`, { 
            subscriptionId: subscription.id,
            customerId: subscription.customer
          });
          break;
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            );
            logger.info('Checkout session completed', { 
              subscriptionId,
              customerId: checkoutSession.customer
            });
          }
          break;
        default:
          logger.warn(`Unhandled event type ${event.type}`);
      }
    } catch (error) {
      logger.error('Webhook handler failed', error);
      return new Response(
        'Webhook handler failed. View your Next.js function logs.',
        {
          status: 400
        }
      );
    }
  } else {
    logger.warn(`Unsupported event type: ${event.type}`);
    return new Response(`Unsupported event type: ${event.type}`);
  }
  return new Response(JSON.stringify({ received: true }));
}
