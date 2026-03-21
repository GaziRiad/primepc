import mongoose from "mongoose";
import type { Connection } from "mongoose";

let connection: Connection | null = null;

const startDbConnection = async () => {
  const url = process.env?.MONGODB_URI?.replace(
    "<db_password>",
    process.env.DB_PASSWORD || "",
  );

  if (!connection) {
    if (!url) {
      throw new Error("MONGODB_URI environment variable is not set");
    }
    await mongoose.connect(url, { dbName: "primepc" });
    connection = mongoose.connection;
    console.log("Connected to Database");
  }
  return connection;
};

export default startDbConnection;
