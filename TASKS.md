# Backend Assessment Task Plan

## Tasks

1. Setup project task tracker and repository structure
   - Create task list and workspace folder READMEs
   - Confirm current files and directories
   - Mark as completed once skeleton files exist

2. Implement logging middleware scaffold
   - Add logging middleware module in `logging middleware/`
   - Ensure task requirements mention use of logging middleware
   - Document usage expectations

3. Build Vehicle Maintenance Scheduler
   - Implement API client to fetch depots and vehicles
   - Solve task selection with mechanic-hour budget
   - Output selected tasks and total impact
   - Add screenshots instructions in `vehicle scheduling` folder

4. Write Campus Notification system design
   - Complete `notification_system_design.md` for Stages 1-6
   - Cover REST API design, DB choice, query optimization, performance, notify-all redesign, priority inbox
   - Use requested format and headings

5. Implement Priority Inbox code
   - Add stage 6 implementation in `notification_app_be/`
   - Read notifications API response and compute top N by type weight + recency
   - Include example script and usage notes

---

## Current status

- [x] Task tracker and workspace skeleton
- [x] Logging middleware scaffold
- [x] Vehicle scheduler implementation
- [x] Notification system design document
- [x] Priority inbox code

## Notes

- Implemented backend in Node.js per request.
- This environment does not expose Git through the shell, so I cannot make actual commits here.
- After each completed task, you should run `git add .` and `git commit -m "Complete <task name>"` locally.
