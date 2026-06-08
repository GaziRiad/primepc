import mongoose from "mongoose";
import { config } from "dotenv";

import startDbConnection from "../lib/db";
import { restoreOrderStock } from "../lib/orderInventory";
import Order from "../models/Order";

const apply = process.argv.includes("--apply");

const main = async () => {
  config({ path: ".env.local" });
  config();

  await startDbConnection();

  const orders = await Order.find({
    status: { $in: ["cancelled", "failed"] },
    stockRestoredAt: { $exists: false },
  }).select("_id status items");

  console.log(
    `${orders.length} legacy terminal order(s) have no stock restoration marker.`,
  );

  if (!apply) {
    console.log("Dry run only. Re-run with --apply after reviewing live stock.");
    await mongoose.disconnect();
    return;
  }

  for (const order of orders) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await restoreOrderStock(order.items, session);
        order.stockRestoredAt = new Date();
        order.stockRestoredReason = order.status;
        await order.save({ session });
      });
      console.log(`Restored stock for ${order._id}.`);
    } finally {
      await session.endSession();
    }
  }

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => null);
  process.exitCode = 1;
});
