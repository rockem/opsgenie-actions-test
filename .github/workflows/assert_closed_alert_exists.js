const https = require('https');


const alias = process.argv[2];
console.log(`alias: ${alias}`)


const options = {
    hostname: 'api.opsgenie.com',
    path: `/v2/alerts/${alias}?identifierType=alias`,
    headers: {
        Authorization: `GenieKey ${process.env.OPSGENIE_API_KEY}`
    }
}

https.get(options, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        if(resp.statusCode !== 200) {
            console.log(`ERROR: ${data}`)
            process.exit(1)
        }
        if(JSON.parse(data)['data']['status'] !== 'closed') {
            console.log(`Alert with alias: "${alias}" isn't closed`)
            process.exit(2)
        }
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
    process.exit(1);
});