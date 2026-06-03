import mongoose from "mongoose";
import type { Connection } from "mongoose";

let connection: Connection | null = null;
let connectionPromise: Promise<Connection> | null = null;

const startDbConnection = async () => {
  const url = process.env?.MONGODB_URI?.replace(
    "<db_password>",
    process.env.DB_PASSWORD || "",
  );

  if (!url) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (connection?.readyState === 1) {
    return connection;
  }

  if (connection && connection.readyState !== 2) {
    connectionPromise = null;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(url, { dbName: "primepc" })
      .then((instance) => {
        connection = instance.connection;
        return connection;
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  connection = await connectionPromise;
  return connection;
};

export default startDbConnection;
