const axios = require('axios');

const createClient = () => axios.create({
  baseURL: 'https://api.opsgenie.com',
  headers: {
    Authorization: `GenieKey ${process.env.OPSGENIE_API_KEY}`,
  },
});

module.exports = {
  createClient,
};
