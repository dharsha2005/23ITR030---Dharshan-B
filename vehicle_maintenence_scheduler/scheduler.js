const http = require('http');
const { logger } = require('../logging middleware/loggingMiddleware');

const DEPOTS_URL = 'http://4.224.186.213/evaluation-service/depots';
const VEHICLES_URL = 'http://4.224.186.213/evaluation-service/vehicles';

function fetchJson(url, callback) {
  logger('info', 'Fetching JSON from: ' + url);
  http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        logger('info', 'Successfully fetched and parsed JSON');
        callback(null, json);
      } catch (error) {
        logger('error', 'Failed to parse JSON: ' + error.message);
        callback(error);
      }
    });
  }).on('error', (error) => {
    logger('error', 'Network error fetching ' + url + ': ' + error.message);
    callback(error);
  });
}

function loadSampleData() {
  return {
    depots: [
      { ID: 1, MechanicHours: 60 },
      { ID: 2, MechanicHours: 135 },
      { ID: 3, MechanicHours: 188 },
      { ID: 4, MechanicHours: 97 },
      { ID: 5, MechanicHours: 164 },
    ],
    vehicles: [
      { TaskID: '264e638f-1c7a-4d67-9f9c-53f3d1766d37', Duration: 1, Impact: 5 },
      { TaskID: '73ce9dca-1536-4a7a-9f1e-c67083afad61', Duration: 6, Impact: 2 },
      { TaskID: '4b6e22ee-b4ed-45a4-a6af-5294bd69f37', Duration: 1, Impact: 3 },
      { TaskID: 'd632f32-852b-4689-8e8c-e73oefcc3c22', Duration: 5, Impact: 5 },
      { TaskID: 'ec40b581-bdfc-43e0-a047-871fdafe8167', Duration: 7, Impact: 3 },
      { TaskID: 'fb1e3165-67c9-4e96-a5c3-2d20d85d293b', Duration: 6, Impact: 3 },
      { TaskID: '330065c0-3815-4e10-a18a-b93b117e30a8', Duration: 5, Impact: 1 },
      { TaskID: '72a91abc-4ed7-492c-9e99-348e7437953b', Duration: 5, Impact: 9 },
      { TaskID: '8a7ff5b1-335c-4a2f-96d8-09c4a362e781', Duration: 6, Impact: 10 },
      { TaskID: '08d00114-9506-463d-ba2e-3343ec4e2e89', Duration: 6, Impact: 6 },
      { TaskID: 'a1e0b8e6-1076-4a2f-b83b-5e6017900033', Duration: 6, Impact: 1 },
      { TaskID: '52635341-7c5f-475a-9839-4676f8ef5fd4', Duration: 1, Impact: 5 },
      { TaskID: '9e08defa-7bb5-4a83-9e29-417165922894', Duration: 6, Impact: 9 },
      { TaskID: 'f92b0f39-35ec-47c3-a465-3e49c22185b6', Duration: 2, Impact: 5 },
      { TaskID: '65c0d74a-82ef-4fcc-9d85-9b82bb85310', Duration: 5, Impact: 7 },
      { TaskID: '68ee2f8d-4145-4472-bce9-1d0968a8092a', Duration: 1, Impact: 1 },
      { TaskID: '8a294532-c7ee-4e19-803d-f98b7e73e8bc', Duration: 8, Impact: 7 },
      { TaskID: '18c655b2-380d-4295-8905-863f0de32c8f', Duration: 2, Impact: 9 },
      { TaskID: '436e87a6-2b5b-42b9-9c35-deaa2c8ef54e', Duration: 2, Impact: 3 },
      { TaskID: '0a823f1b-03c3-4722-af40-e17a79ee0ff', Duration: 2, Impact: 5 },
      { TaskID: '0bf780cb-1099-4f61-99bf-dec95a7063b6', Duration: 3, Impact: 10 },
      { TaskID: 'e716fb11-1064-4db7-9d76-06d19f4f6f67', Duration: 5, Impact: 5 },
      { TaskID: '60586e47-ab9c-407d-85ca-1215084f3f41', Duration: 8, Impact: 8 },
      { TaskID: '08635e52-dad5-4b78-8ab1-e55db53c0c18', Duration: 8, Impact: 5 },
      { TaskID: '871ddcf5-0bba-4233-bf12-c776c496e314', Duration: 7, Impact: 10 },
      { TaskID: 'b57f17dc-db77-42bf-a7e9-8fec596ce498', Duration: 7, Impact: 1 },
      { TaskID: '1d893de7-fbba-4c77-92b7-e3076fe805d5', Duration: 1, Impact: 8 },
      { TaskID: '1743e1b5-9dfd-450b-9905-98c3e054aee1', Duration: 5, Impact: 8 },
      { TaskID: '48851915-eaf5-48ec-a20c-5074d7050c5f', Duration: 8, Impact: 8 },
      { TaskID: '7d81e6ca-8f03-4c4a-9ec0-701f820c5655', Duration: 7, Impact: 8 },
    ],
  logger('info', 'Starting schedule computation with budget: ' + budget);
  };
}

function computeSchedule(tasks, budget) {
  const n = tasks.length;
  const dp = [];

  for (let i = 0; i <= n; i += 1) {
    dp[i] = [];
    for (let j = 0; j <= budget; j += 1) {
      dp[i][j] = 0;
    }
  }

  for (let i = 1; i <= n; i += 1) {
    const task = tasks[i - 1];
    const duration = task.Duration;
    const impact = task.Impact;

    for (let j = 0; j <= budget; j += 1) {
      if (duration <= j) {
        const valueWith = dp[i - 1][j - duration] + impact;
        const valueWithout = dp[i - 1][j];
        dp[i][j] = valueWith > valueWithout ? valueWith : valueWithout;
      } else {
        dp[i][j] = dp[i - 1][j];
      }
    }
  }

  let j = budget;
  const selected = [];

  for (let i = n; i > 0; i -= 1) {
    if (dp[i][j] !== dp[i - 1][j]) {
      selected.unshift(tasks[i - 1]);
      j -= tasks[i - 1].Duration;
    }
  }

  let totalDuration = 0;
  let totalImpact = 0;
  for (let k = 0; k < selected.length; k += 1) {
    totalDuration += selected[k].Duration;
    totalImpact += selected[k].Impact;
  }
logger('info', 'Schedule computed: ' + selected.length + ' tasks selected, duration: ' + totalDuration + ', impact: ' + totalImpact);
  
  return {
    selected,
    totalDuration,
    totalImpact,
  };
}

fulogger('warn', 'Using sample data because API failed.');
  const sample = loadSampleData();
  const totalBudget = sample.depots[0].MechanicHours + sample.depots[1].MechanicHours + sample.depots[2].MechanicHours + sample.depots[3].MechanicHours + sample.depots[4].MechanicHours;
  logger('info', 'Total mechanic hours: ' + totalBudget)
  const totalBudget = sample.depots[0].MechanicHours + sample.depots[1].MechanicHours + sample.depots[2].MechanicHours + sample.depots[3].MechanicHours + sample.depots[4].MechanicHours;
  const schedule = computeSchedule(sample.vehicles, totalBudget);
  console.log('Using sample data because API failed.');
  console.log('Total mechanic hours:', totalBudget);
  console.log(JSON.stringify(schedule, null, 2));
}

fulogger('info', 'Starting Vehicle Maintenance Scheduler');
  fetchJson(DEPOTS_URL, (error, depotResult) => {
    if (error) {
      logger('error', 'Failed to fetch depots API');
      useSampleData();
      return;
    }

    fetchJson(VEHICLES_URL, (error2, vehicleResult) => {
      if (error2) {
        logger('error', 'Failed to fetch vehicles API');
        useSampleData();
        return;
      }

      let totalBudget = 0;
      for (let i = 0; i < depotResult.depots.length; i += 1) {
        totalBudget += depotResult.depots[i].MechanicHours;
      }

      logger('info', 'APIs fetched successfully. Total budget: ' + totalBudget);
      const schedule = computeSchedule(vehicleResult.vehicles, totalBudget);
      console.log('===== Vehicle Scheduling Result =====');
      console.log('Total mechanic hours:', totalBudget);
      console.log(JSON.stringify(schedule, null, 2));
    });
  });
}

logger('info', 'Scheduler application started');}

start();
