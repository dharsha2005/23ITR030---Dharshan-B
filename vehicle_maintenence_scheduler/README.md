# Vehicle Maintenance Scheduler

This folder contains the Node.js implementation for the vehicle maintenance scheduling microservice.

Key tasks:
- Fetch depot mechanic-hour budgets from the provided API.
- Fetch vehicle task list from the provided API.
- Compute an optimal subset of tasks within budget to maximize total impact.
- Use the logging middleware for all request and scheduling operations.

Run:
- `npm run schedule`
