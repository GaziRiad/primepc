import startDbConnection from "@/lib/db";
import { buildAbandonedCartUnsubscribeUrl } from "@/lib/emailPreferences";
import {
  cancelScheduledEmail,
  scheduleAbandonedCartReminder,
} from "@/lib/notifications";
import Cart from "@/models/Cart";
import User from "@/models/User";
import { getSiteUrl } from "@/lib/site";

const REMINDER_DELAY_MS = 24 * 60 * 60 * 1000;

type PopulatedCartItem = {
  quantity?: number;
  variantId?: string;
  product?: {
    name?: string;
    coverImage?: string;
    finalPrice?: number;
    stock?: number;
    variants?: Array<{
      _id?: unknown;
      label?: string;
      finalPrice?: number;
      stock?: number;
      active?: boolean;
      image?: string;
      options?: Array<{ name?: string; value?: string }>;
    }>;
  } | null;
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
  const reminderAlreadyDue = scheduledAt && scheduledAt.getTime() <= Date.now();

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
      .populate("items.product", "name coverImage finalPrice stock variants")
      .lean(),
    User.findById(userId)
      .select("email name abandonedCartEmailsEnabled")
      .lean(),
  ]);

  if (!cart || !user) return;

  const scheduledAt = cart.recoveryScheduledAt
    ? new Date(cart.recoveryScheduledAt)
    : null;
  const reminderAlreadyDue = scheduledAt && scheduledAt.getTime() <= Date.now();

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

  const rawItems = (
    Array.isArray(cart.items) ? cart.items : []
  ) as PopulatedCartItem[];
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
      const variants = Array.isArray(product?.variants) ? product.variants : [];
      const variant = item.variantId
        ? variants.find(
            (candidate) =>
              String(candidate._id ?? "") === item.variantId &&
              candidate.active !== false,
          )
        : undefined;
      if (variants.length > 0 && !variant) return null;

      const finalPrice = Number(
        variant?.finalPrice ?? product?.finalPrice ?? 0,
      );
      const stock = Number(variant?.stock ?? product?.stock ?? 0);

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
        coverImage: variant?.image || product.coverImage,
        quantity,
        unitPrice: finalPrice,
        finalPrice,
        variantLabel: variant?.label,
        variantOptions: Array.isArray(variant?.options)
          ? variant.options.map((option) => ({
              name: String(option.name ?? ""),
              value: String(option.value ?? ""),
            }))
          : [],
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
