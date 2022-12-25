const express = require('express');
const router = express.Router();

const client = require('../es/client')

router.get('/', async (req, res) => {
  const query = req.query;

  const result = await client.search({ index: 'authors', body: {
      query: {
        match: {
          authorName: query.authorName
        }
      }
    }
  })

  client
    .bulk({ operations: [
        { index: { _index: 'logs' } },
        { description: `Search for Authors with: ${query.authorName}`, date: new Date().toDateString() },
      ] })
    .then(res => console.log(JSON.stringify(res)))
    .catch(console.error)

  res.status(200).send(result?.hits?.hits?.map(hit => hit._source))
});

module.exports = router;
