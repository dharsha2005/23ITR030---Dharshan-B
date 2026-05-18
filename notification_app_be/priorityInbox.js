const http = require('http');
const { logger } = require('../logging middleware/loggingMiddleware');

const NOTIFICATION_URL =
  'http://4.224.186.213/evaluation-service/notifications';

const TYPE_WEIGHTS = {
  Placement: 10,
  Result: 8,
  Event: 5
};

// Fetch notifications from API
function fetchJson(url, callback) {
  logger('info', 'Fetching notifications from: ' + url);

  http
    .get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          logger('info', 'Successfully fetched notifications');
          callback(null, JSON.parse(data));
        } catch (error) {
          logger('error', 'Failed to parse notifications: ' + error.message);
          callback(error);
        }
      });
    })
    .on('error', (error) => {
      logger('error', 'Network error: ' + error.message);
      callback(error);
    });
}

// Convert timestamp to milliseconds
function parseTimestamp(timestamp) {
  const fixed = timestamp.replace(' ', 'T') + 'Z';
  const value = Date.parse(fixed);

  if (Number.isNaN(value)) {
    return Date.now();
  }

  return value;
}

// Rank notifications
function rankNotifications(notifications) {
  logger(
    'info',
    'Starting to rank ' + notifications.length + ' notifications'
  );

  for (let i = 0; i < notifications.length; i++) {
    const item = notifications[i];

    const weight = TYPE_WEIGHTS[item.Type] || 1;

    const age = Date.now() - parseTimestamp(item.Timestamp);

    const recency = age > 0 ? 1000000 / age : 1000000;

    item.score = weight * 1000 + recency;
  }

  notifications.sort((a, b) => b.score - a.score);

  const top10 = notifications.slice(0, 10);

  logger('info', 'Ranking complete. Top 10 notifications selected');

  return top10;
}

// Sample fallback notifications
function sampleNotifications() {
  return [
    {
      ID: 'd146095a-0d86-4a34-9e69-3900a14576bc',
      Type: 'Result',
      Message: 'mid-sem',
      Timestamp: '2026-04-22 17:51:30'
    },
    {
      ID: 'b283218f-ea5a-4b7c-93a9-1f2f240d64be',
      Type: 'Placement',
      Message: 'CSX Corporation hiring',
      Timestamp: '2026-04-22 17:51:18'
    },
    {
      ID: '81589ada-0ad3-4f77-9554-f52fb558e09d',
      Type: 'Event',
      Message: 'farewell',
      Timestamp: '2026-04-22 17:51:06'
    },
    {
      ID: '8a7412bd-6065-4d09-8501-a37f11cc848b',
      Type: 'Placement',
      Message: 'AMD hiring',
      Timestamp: '2026-04-22 17:49:42'
    }
  ];
}

// Main function
function start() {
  logger('info', 'Priority Inbox application started');

  fetchJson(NOTIFICATION_URL, (error, data) => {
    let notifications;

    if (error || !data || !data.notifications) {
      logger('warn', 'Cannot fetch notifications, using sample data.');
      notifications = sampleNotifications();
    } else {
      logger(
        'info',
        'Fetched ' + data.notifications.length + ' notifications from API'
      );

      notifications = data.notifications;
    }

    const topNotifications = rankNotifications(notifications);

    console.log('===== Top 10 Notifications =====');

    console.log(JSON.stringify(topNotifications, null, 2));

    logger('info', 'Priority Inbox processing complete');
  });
}

// Start app
logger('info', 'Initializing Priority Inbox');

start();