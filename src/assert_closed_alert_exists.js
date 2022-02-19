const { createClient } = require('./opsgenie-axios');

const opsgenieClient = createClient();

const getAlertBy = async (alias, status) => {
  const query = `alias:${alias} AND status:${status}`;
  const response = await opsgenieClient.get(
    `/v2/alerts?query=${(encodeURIComponent(query))}`,
  );
  return response.data.data;
};

const alias = process.argv[2];

getAlertBy(alias, 'closed')
  .then((alerts) => {
    if (alerts.length === 0) {
      console.log(`ERROR: Failed to find closed alert with alias [${alias}]`);
      process.exit(2);
    }
  })
  .catch((error) => {
    console.log(`ERROR: ${error.message}`);
    process.exit(1);
  });
