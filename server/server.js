import app from "./app.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(` Student Management System - Backend API `);
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Health check:  http://localhost:${PORT}/api/health`);
  console.log(` Students API:  http://localhost:${PORT}/api/students`);
  console.log(` Mode:          ${process.env.NODE_ENV || "development"}`);
  console.log(`========================================`);
});

// Graceful shutdown handlers
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down server gracefully...`);
  server.close(() => {
    console.log("Server stopped successfully.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
