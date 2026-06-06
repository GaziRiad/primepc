import startDbConnection from "@/lib/db";
import { buildAbandonedCartUnsubscribeUrl } from "@/lib/emailPreferences";
import {
  cancelScheduledEmail,
  scheduleAbandonedCartReminder,
} from "@/lib/notifications";
import Cart from "@/models/Cart";
import User from "@/models/User";

const REMINDER_DELAY_MS = 24 * 60 * 60 * 1000;

type PopulatedCartItem = {
  quantity?: number;
  product?:
    | {
        name?: string;
        coverImage?: string;
        finalPrice?: number;
        stock?: number;
      }
    | null;
};

const getSiteUrl = () => {
  const configured =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "";

  return configured
    ? `${configured.startsWith("http") ? "" : "https://"}${configured}`.replace(
        /\/$/,
        "",
      )
    : "";
};

const clearRecoveryState = async (userId: string, completed = false) => {
  await Cart.updateOne(
    { user: userId },
    {
      $set: {
        recoveryEmailId: "",
        recoveryReminderCompleted: completed,
      },
      $unset: { recoveryScheduledAt: "" },
    },
  );
};

export const cancelAbandonedCartReminder = async (
  userId: string,
  resetLifecycle = true,
) => {
  await startDbConnection();

  const cart = await Cart.findOne({ user: userId })
    .select("recoveryEmailId recoveryScheduledAt")
    .lean();

  const scheduledAt = cart?.recoveryScheduledAt
    ? new Date(cart.recoveryScheduledAt)
    : null;
  const reminderAlreadyDue =
    scheduledAt && scheduledAt.getTime() <= Date.now();

  if (cart?.recoveryEmailId && !reminderAlreadyDue) {
    await cancelScheduledEmail(cart.recoveryEmailId);
  }

  await clearRecoveryState(
    userId,
    resetLifecycle ? false : Boolean(reminderAlreadyDue),
  );
};

export const syncAbandonedCartReminder = async (userId: string) => {
  await startDbConnection();

  const [cart, user] = await Promise.all([
    Cart.findOne({ user: userId })
      .select(
        "items recoveryEmailId recoveryScheduledAt recoveryReminderCompleted updatedAt",
      )
      .populate("items.product", "name coverImage finalPrice stock")
      .lean(),
    User.findById(userId)
      .select("email name abandonedCartEmailsEnabled")
      .lean(),
  ]);

  if (!cart || !user) return;

  const scheduledAt = cart.recoveryScheduledAt
    ? new Date(cart.recoveryScheduledAt)
    : null;
  const reminderAlreadyDue =
    scheduledAt && scheduledAt.getTime() <= Date.now();

  if (reminderAlreadyDue) {
    await clearRecoveryState(userId, true);
    return;
  }

  let cancelledPreviousReminder = false;

  if (cart.recoveryEmailId) {
    const cancelled = await cancelScheduledEmail(cart.recoveryEmailId);
    if (!cancelled) return;
    cancelledPreviousReminder = true;
  }

  const rawItems = (Array.isArray(cart.items) ? cart.items : []) as PopulatedCartItem[];
  if (
    rawItems.length === 0 ||
    cart.recoveryReminderCompleted ||
    user.abandonedCartEmailsEnabled === false
  ) {
    if (cancelledPreviousReminder) {
      await clearRecoveryState(userId, false);
    }
    return;
  }

  const siteUrl = getSiteUrl();
  const email = typeof user.email === "string" ? user.email.trim() : "";
  if (!siteUrl || !email) {
    if (cancelledPreviousReminder) {
      await clearRecoveryState(userId, false);
    }
    return;
  }

  const items = rawItems
    .map((item) => {
      const product = item.product;
      const quantity = Math.max(1, Math.floor(Number(item.quantity ?? 1)));
      const finalPrice = Number(product?.finalPrice ?? 0);
      const stock = Number(product?.stock ?? 0);

      if (
        !product?.name ||
        !Number.isFinite(finalPrice) ||
        finalPrice < 0 ||
        !Number.isFinite(stock) ||
        stock <= 0
      ) {
        return null;
      }

      return {
        name: product.name,
        coverImage: product.coverImage,
        quantity,
        unitPrice: finalPrice,
        finalPrice,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (items.length === 0) {
    if (cancelledPreviousReminder) {
      await clearRecoveryState(userId, false);
    }
    return;
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.finalPrice * item.quantity,
    0,
  );
  const reminderAt = new Date(Date.now() + REMINDER_DELAY_MS);
  const unsubscribeUrl = buildAbandonedCartUnsubscribeUrl(userId, siteUrl);
  const result = await scheduleAbandonedCartReminder({
    email,
    name: user.name,
    items,
    subtotal,
    cartUrl: `${siteUrl}/cart`,
    unsubscribeUrl,
    scheduledAt: reminderAt.toISOString(),
  });

  if (!result.ok || !result.id) {
    if (cancelledPreviousReminder) {
      await clearRecoveryState(userId, false);
    }
    return;
  }

  const saved = await Cart.updateOne(
    {
      _id: cart._id,
      user: userId,
      updatedAt: cart.updatedAt,
      "items.0": { $exists: true },
    },
    {
      $set: {
        recoveryEmailId: result.id,
        recoveryScheduledAt: reminderAt,
        recoveryReminderCompleted: false,
      },
    },
  );

  if (saved.modifiedCount !== 1) {
    await cancelScheduledEmail(result.id);
  }
};
