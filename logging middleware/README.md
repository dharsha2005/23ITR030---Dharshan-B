# Logging Middleware

This folder contains the Node.js logging middleware used by both assessment services.

Requirements:
- Use this middleware in all backend code paths.
- Avoid direct logger calls outside of the middleware wrapper.
- Log request/response details and errors consistently.

Usage:
- `const { logOperation, logger } = require('../logging middleware/loggingMiddleware');`
