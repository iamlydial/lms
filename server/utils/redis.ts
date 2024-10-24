import { Redis } from "ioredis";
require("dotenv").config();

// Utility function to create the Redis client
const redisClient = () => {
  if (process.env.RESIS_URL) {
    console.log("Connecting to Redis...");

    const redis = new Redis(process.env.RESIS_URL);

    // Redis event listeners for debugging
    redis.on("connect", () => {
      console.log("Redis connection established.");
    });

    redis.on("ready", () => {
      console.log("Redis is ready to use.");
    });

    redis.on("error", (err) => {
      console.error("Redis connection error:", err);
    });

    redis.on("end", () => {
      console.log("Redis connection closed.");
    });

    return redis;
  }
  throw new Error("Redis connection failed: REDIS_URL is not defined");
};

// Exporting the Redis client
export const redis = redisClient();
