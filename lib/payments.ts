// Stripe Payment Integration
import Stripe from "stripe";

export interface PaymentConfig {
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  platformFeePercent: number; // Platform commission (e.g., 10%)
}

export const paymentConfig: PaymentConfig = {
  platformFeePercent: 10, // 10% platform fee
};

// Initialize Stripe (only if keys are provided)
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

export interface PaymentIntentResult {
  clientSecret: string | null;
  paymentIntentId: string | null;
  error: string | null;
}

export async function createPaymentIntent(
  amount: number,
  courseId: string,
  userId: string,
  courseTitle?: string
): Promise<PaymentIntentResult> {
  // If Stripe is not configured, use mock payment for development
  if (!stripe || !process.env.STRIPE_SECRET_KEY) {
    // Mock payment for development/testing
    const mockPaymentIntentId = `pi_mock_${Date.now()}`;
    return {
      clientSecret: null,
      paymentIntentId: mockPaymentIntentId,
      error: null,
    };
  }

  try {
    // Calculate platform fee
    const platformFee = Math.round(
      amount * (paymentConfig.platformFeePercent / 100)
    );
    const instructorAmount = amount - platformFee;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        courseId,
        userId,
        courseTitle: courseTitle || "",
        platformFee: platformFee.toString(),
        instructorAmount: instructorAmount.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      error: null,
    };
  } catch (error: any) {
    console.error("Stripe payment intent error:", error);
    return {
      clientSecret: null,
      paymentIntentId: null,
      error: error.message || "Failed to create payment intent",
    };
  }
}

export interface PaymentConfirmationResult {
  success: boolean;
  paymentIntentId: string | null;
  error: string | null;
}

export async function confirmPayment(
  paymentIntentId: string
): Promise<PaymentConfirmationResult> {
  // If Stripe is not configured, auto-confirm mock payments
  if (!stripe || !process.env.STRIPE_SECRET_KEY) {
    return {
      success: true,
      paymentIntentId,
      error: null,
    };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        error: null,
      };
    }

    return {
      success: false,
      paymentIntentId: paymentIntent.id,
      error: `Payment status: ${paymentIntent.status}`,
    };
  } catch (error: any) {
    console.error("Stripe payment confirmation error:", error);
    return {
      success: false,
      paymentIntentId: null,
      error: error.message || "Failed to confirm payment",
    };
  }
}

export async function handleWebhook(
  payload: string,
  signature: string
): Promise<{ success: boolean; error?: string }> {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return { success: false, error: "Stripe webhook not configured" };
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        // Payment succeeded - handle enrollment
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // This will be handled by the webhook route
        return { success: true };
      default:
        return { success: true };
    }
  } catch (error: any) {
    console.error("Webhook error:", error);
    return { success: false, error: error.message };
  }
}
