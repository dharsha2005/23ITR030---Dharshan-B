const http = require('http');
const { logger } = require('../logging middleware/loggingMiddleware');

const NOTIFICATION_URL = 'http://4.224.186.213/evaluation-service/notifications';
const TYPE_WEIGHTS = { 
    Placement: 10, 
    Result: 8, 
    Event: 5 
};
function fetchJson(url, callback) {
  http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        callback(null, JSON.parse(data));
      } catch (error) {
        callback(error);
      }
    });
  }).on('error', (error) => {
    callback(error);
  });
}
function parseTimestamp(timestamp) {
  const fixed = timestamp.replace(' ', 'T') + 'Z';
  const value = Date.parse(fixed);
  if (Number.isNaN(value)) {
    return Date.now();
  }
  return value;
}
function rankNotifications(notifications) {
  for (let i = 0; i < notifications.length; i += 1) {
    const item = notifications[i];
    const weight = TYPE_WEIGHTS[item.Type] || 1;
    const age = Date.now() - parseTimestamp(item.Timestamp);
    const recency = age > 0 ? 1000000 / age : 1000000;
    item.score = weight * 1000 + recency;
  }
  notifications.sort((a, b) => b.score - a.score);
  return notifications.slice(0, 10);
}
function sampleNotifications() {
  return [
    { ID: 'd146095a-0d86-4a34-9e69-3900a14576bc', Type: 'Result', Message: 'mid-sem', Timestamp: '2026-04-22 17:51:30' },
    { ID: 'b283218f-ea5a-4b7c-93a9-1f2f240d64be', Type: 'Placement', Message: 'CSX Corporation hiring', Timestamp: '2026-04-22 17:51:18' },
    { ID: '81589ada-0ad3-4f77-9554-f52fb558e09d', Type: 'Event', Message: 'farewell', Timestamp: '2026-04-22 17:51:06' },
    { ID: '0005513a-142b-4bbc-8678-efec65e1ede', Type: 'Result', Message: 'mid-sem', Timestamp: '2026-04-22 17:50:54' },
    { ID: 'ea836726-c25e-4f21-a72f-544a6af8a37f', Type: 'Result', Message: 'project-review', Timestamp: '2026-04-22 17:50:42' },
    { ID: '008cb427-8fc6-47f7-bb00-be228f6b0d2c', Type: 'Result', Message: 'external', Timestamp: '2026-04-22 17:50:30' },
    { ID: 'e5c4ff28-31bf-4d40-8f02-72fda59e8918', Type: 'Result', Message: 'project-review', Timestamp: '2026-04-22 17:50:18' },
    { ID: '1cfce5ee-ad37-4894-8946-d07627176a5', Type: 'Event', Message: 'tech-fest', Timestamp: '2026-04-22 17:50:06' },
    { ID: 'cf2885a6-45ac-4ba0-b548-6e9e9d4c52c8', Type: 'Result', Message: 'project-review', Timestamp: '2026-04-22 17:49:54' },
    { ID: '8a7412bd-6065-4d09-8501-a37f11cc848b', Type: 'Placement', Message: 'Advanced Micro Devices Inc. hiring', Timestamp: '2026-04-22 17:49:42' },
  ];
}

function start() {
  fetchJson(NOTIFICATION_URL, (error, data) => {
    let notifications;
    if (error || !data || !data.notifications) {
      logger('warn', 'Cannot fetch notifications, using sample data.');
      notifications = sampleNotifications();
    } else {
      notifications = data.notifications;
    }
    const topNotifications = rankNotifications(notifications);
    console.log('===== Top 10 Notifications =====');
    console.log(JSON.stringify(topNotifications, null, 2));
  });
}
start();
