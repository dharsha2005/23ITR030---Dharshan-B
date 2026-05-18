# Campus Notification System Design

## Stage 1: API design and real-time notifications

### Core endpoints

1. `GET /api/v1/notifications`
   - Description: Fetch the current user's unread and recent notifications.
   - Query parameters:
     - `limit` (optional): number of notifications to return
     - `offset` (optional): pagination offset
     - `type` (optional): filter by notification type
     - `unread` (optional): boolean to fetch only unread notifications
   - Response:
     {
       "notifications": [
         {
           "id": "uuid",
           "type": "Placement|Result|Event",
           "message": "string",
           "createdAt": "2026-04-22T17:51:30Z",
           "isRead": false,
           "priority": 0
         }
       ],
       "total": 123,
       "limit": 10,
       "offset": 0
     }

2. `POST /api/v1/notifications/mark-read`
   - Description: Mark one or more notifications as read.
   - Body:
     {
       "notificationIds": ["uuid1", "uuid2"]
     }
   - Response:
     {
       "updated": 2
     }

3. `POST /api/v1/notifications/notify-all`
   - Description: Create notifications for many students and schedule delivery.
   - Body:
     {
       "studentIds": ["id1", "id2"],
       "message": "Placement announced"
     }
   - Response:
     {
       "queued": 2000
     }

### Real-time notification mechanism

- Use WebSocket or Server-Sent Events for browser push delivery.
- On new notification creation, publish an event to a message bus and notify connected clients.
- The frontend subscribes to `/ws/notifications` and receives:
  {
    "type": "notification_created",
    "payload": { "id": "uuid", "type": "Placement", "message": "...", "createdAt": "..." }
  }
- This design avoids page reloads and lets the browser update the notification list immediately.

## Stage 2: Storage choice and schema

### Recommended storage

- Use PostgreSQL for persistent notification storage.
- A relational DB is appropriate because notifications have structured fields, query patterns require filtering, ordering, and updates.

### Schema

```
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  priority_score INTEGER NOT NULL DEFAULT 0
);
```

### Why not NoSQL first?

- NoSQL can work for very high write volume, but this assessment requires query patterns like `student_id + is_read + created_at` and fast sorting.
- PostgreSQL provides strong indexing and easy joins with student metadata.

### Problem as data increases

- Table scans on large notification sets will slow down.
- Sorting and filtering on `created_at`, `student_id`, and `is_read` require efficient indexes.
- If retention grows to millions of rows, pagination and TTL-based cleanup are needed.

## Stage 3: Slow query analysis

Query:
```
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```

### Why it is slow

- It may perform a sequential scan if an index is missing.
- `ORDER BY createdAt DESC` requires sorting every matching row.
- `SELECT *` may read unnecessary columns when only headers are needed.

### Recommended index

- `CREATE INDEX idx_notifications_student_read_created ON notifications(student_id, is_read, created_at DESC);`

### Indexing every column

- Not effective: indexes consume storage and slow writes.
- Index only columns used in filters and ordering.
- A composite index on `(student_id, is_read, created_at DESC)` is the best tradeoff here.

## Stage 4: Performance improvements

### Suggested solutions

1. Use pagination instead of fetching all notifications on every page load.
2. Fetch only unread or recently updated notifications.
3. Cache the notification count in Redis for the badge count.
4. Use incremental sync: retrieve new notifications since the last `createdAt`.
5. Push updates via WebSocket so the client does not poll repeatedly.

### Tradeoffs

- Caching reduces DB reads but requires cache invalidation on writes.
- Pagination improves scalability but increases frontend complexity.
- Push updates reduce load for active clients but need connection management.

## Stage 5: Notify-all redesign

### Current shortcomings

- The pseudocode sends email synchronously in a loop.
- If one request fails, the whole batch may fail or slow down.
- A single process cannot scale to 50,000 students.

### Better design

- Enqueue each notification creation in a background job queue.
- Persist notifications first, then send emails asynchronously.
- Use batching and retries for the email API.
- Avoid blocking the request thread on all sends.

### Revised pseudocode

```
function notifyAll(studentIds, message) {
  for (studentId of studentIds) {
    enqueue('createNotification', { studentId, message });
  }
  return { queued: studentIds.length };
}

worker process:
  job = dequeue('createNotification')
  saveNotification(job.studentId, job.message)
  enqueue('sendEmail', { studentId: job.studentId, message: job.message })

email worker:
  job = dequeue('sendEmail')
  try {
    sendEmail(job.studentId, job.message)
  } catch (error) {
    retry(job)
  }
```

### Why this is better

- Persistence and notification delivery are decoupled.
- Failures in email sending do not block the notification creation path.
- The system can scale across multiple workers.

## Stage 6: Priority inbox approach

### Ranking rules

- Assign weights by notification type:
  - `Placement`: 10
  - `Result`: 8
  - `Event`: 5
- Add a recency component so newer notifications rank higher.
- Compute a priority score for each notification:
  `priority = typeWeight * 1000 + recencyBoost`

### Efficient strategy

- Fetch only unread notifications from `GET /evaluation-service/notifications`.
- Parse timestamps and compute scores in memory.
- Sort and select top N.
- For large datasets, maintain a min-heap of size N to avoid full sort.

### Implementation notes

- The Node.js implementation uses the provided API and falls back to sample data.
- It computes a weighted score and returns the top 10 notifications.
- The same repo contains `notification_app_be/priorityInbox.js` for this stage.
