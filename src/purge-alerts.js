const axios = require('axios');
const axiosThrottle = require('axios-request-throttle');

axiosThrottle.use(axios, { requestsPerSecond: 5 });

const opsgenieClient = axios.create({
  baseURL: 'https://api.opsgenie.com',
  headers: {
    Authorization: `GenieKey ${process.env.OPSGENIE_API_KEY}`,
  },
});

const zeroPad = (num, places) => String(num).padStart(places, '0');

const oneDayOldTime = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${zeroPad(d.getUTCDate() + 1, 2)}-${zeroPad(d.getUTCMonth() + 1, 2)}-${zeroPad(d.getUTCFullYear(), 2)}`;
};

const getAlerts = async () => {
  const response = await opsgenieClient.get(
    `/v2/alerts?query=${(encodeURIComponent(`createdAt < ${oneDayOldTime()}`))}`,
  );
  return response.data.data;
};

const deleteAlertWithId = async (id) => {
  await opsgenieClient.delete(`/v2/alerts/${id}`);
};

getAlerts(`createdAt < ${oneDayOldTime()}`)
  .then((alerts) => alerts.forEach((alert) => deleteAlertWithId(alert.id)))
  .catch((error) => {
    console.log(`ERROR: ${error.message}`);
    process.exit(1);
  });
