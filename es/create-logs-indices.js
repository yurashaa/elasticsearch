const client = require('./client');

(async () => {
  const isLogsIndexExists = await client.indices.exists({ index: 'logs' });

  if (!isLogsIndexExists) {
    await client.indices.create({
      index: 'logs',
      "mappings": {
        "properties": {
          "description": {
            "type": "text",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          }
        }
      }
    })
  }
})()