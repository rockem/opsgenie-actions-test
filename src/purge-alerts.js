const https = require('https');

const commonOptions = {
  hostname: 'api.opsgenie.com',
  headers: {
    Authorization: `GenieKey ${process.env.OPSGENIE_API_KEY}`,
  },
};

const zeroPad = (num, places) => String(num).padStart(places, '0');

const oneDayOldTime = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${zeroPad(d.getUTCDate() + 1, 2)}-${zeroPad(d.getUTCMonth() + 1, 2)}-${zeroPad(d.getUTCFullYear(), 2)}`;
};

const doRequest = async (okStatus, options) => new Promise((resolve, reject) => {
  https.get(options, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    function validateSuccess() {
      if (resp.statusCode !== okStatus) {
        reject(data);
      }
    }

    resp.on('end', () => {
      validateSuccess();
      resolve(JSON.parse(data).data);
    });
  }).on('error', (err) => {
    reject(err.message);
  });
});

const getAlerts = async () => {
  const options = {
    ...commonOptions,
    path: `/v2/alerts?query=${(encodeURIComponent(`createdAt < ${oneDayOldTime()}`))}`,
    method: 'GET',
  };

  return doRequest(200, options);
};

const deleteAlertWithId = async (id) => {
  const options = {
    ...commonOptions,
    path: `/v2/alerts/${id}`,
    method: 'DELETE',
  };
  return doRequest(202, options);
};

getAlerts(`createdAt < ${oneDayOldTime()}`)
  .then((alerts) => alerts.forEach((alert) => deleteAlertWithId(alert.id)))
  .catch((error) => {
    console.log(`ERROR: ${error}`);
    process.exit(1);
  });
