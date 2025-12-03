require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const redis = require("redis");

// Create basic app to satisfy Azure immediately
const app = express();
const PORT = process.env.PORT || 5000;

// Diagnostic State
let dbStatus = "Pending...";
let redisStatus = "Pending...";
let envCheck = {};

// 1. START SERVER IMMEDIATELY (Fixes 504 Timeout)
const server = app.listen(PORT, () => {
  console.log(`✅ DIAGNOSTIC SERVER RUNNING ON PORT ${PORT}`);
  console.log(`🔍 View debug info at: ${process.env.APP_URL || 'http://localhost:5000'}/debug`);
  
  // Start tests after server is up
  runDiagnostics();
});

// 2. DEBUG ENDPOINT
app.get("/", (req, res) => res.send("SocialFlow API is Starting... Check /debug for status."));

app.get("/debug", (req, res) => {
  res.json({
    status: "Diagnostic Mode",
    mongo: dbStatus,
    redis: redisStatus,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      // Masking secrets for security
      MONGO_URI_SET: !!process.env.MONGODB_URI,
      REDIS_HOST: process.env.REDIS_HOST,
      REDIS_PORT: process.env.REDIS_PORT,
      REDIS_PASS_SET: !!process.env.REDIS_PASSWORD,
      REDIS_URL_SET: !!process.env.REDIS_URL,
    }
  });
});

app.get("/health", (req, res) => res.json({ status: "alive" }));

// 3. DIAGNOSTIC TESTS
async function runDiagnostics() {
  console.log("--- STARTING CONNECTIVITY TESTS ---");

  // --- TEST MONGODB ---
  try {
    console.log("1. Testing MongoDB Connection...");
    console.log(`   URI present: ${!!process.env.MONGODB_URI}`);
    
    // Enforce 5 second timeout so it doesn't hang forever
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    console.log("   ✅ MongoDB Connected Successfully!");
    dbStatus = "Connected";
  } catch (error) {
    console.error("   ❌ MongoDB Failed:", error.message);
    dbStatus = `Failed: ${error.message}`;
  }

  // --- TEST REDIS ---
  try {
    console.log("2. Testing Redis Connection...");
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;
    const password = process.env.REDIS_PASSWORD;
    
    console.log(`   Host: ${host}`);
    console.log(`   Port: ${port}`);
    console.log(`   Password Length: ${password ? password.length : 0}`);

    const client = redis.createClient({
      socket: {
        host: host,
        port: parseInt(port),
        tls: parseInt(port) === 6380, // Azure requires TLS on 6380
        rejectUnauthorized: false,    // Allow self-signed certs in Azure
        connectTimeout: 5000
      },
      password: password
    });

    client.on('error', (err) => console.log("   Redis Client Error:", err.message));

    await client.connect();
    console.log("   ✅ Redis Connected Successfully!");
    redisStatus = "Connected";
    await client.quit();
  } catch (error) {
    console.error("   ❌ Redis Failed:", error.message);
    redisStatus = `Failed: ${error.message}`;
  }

  console.log("--- DIAGNOSTICS COMPLETE ---");
}