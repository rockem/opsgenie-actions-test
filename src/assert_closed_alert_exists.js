const https = require('https');

const alias = process.argv[2];

const options = {
  hostname: 'api.opsgenie.com',
  path: `/v2/alerts?query=${(encodeURIComponent(`alias:${alias} AND status:closed`))}`,
  headers: {
    Authorization: `GenieKey ${process.env.OPSGENIE_API_KEY}`,
  },
};

https.get(options, (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    if (resp.statusCode !== 200) {
      console.log(`ERROR: ${data}`);
      process.exit(2);
    }
    if (JSON.parse(data).data.length === 0) {
      console.log(`ERROR: Failed to find closed alert with alias [${alias}]`);
      process.exit(2);
    }
  });
}).on('error', (err) => {
  console.log(`ERROR: ${err.message}`);
  process.exit(1);
});
