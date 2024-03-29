const express = require('express');
const router = express.Router();

const client = require('../es/client')

router.get('/', async (req, res) => {
  const query = req.query;

  const result = await client.search({ index: 'books', body: {
      query: {
        match: {
          title: query.title
        }
      }
    }
  })

  client
    .bulk({ operations: [
        { index: { _index: 'logs' } },
        { description: `Search for Books with: ${query.title}`, date: new Date().toDateString() },
      ] })
    .then(res => console.log(JSON.stringify(res)))
    .catch(console.error)

  res.status(200).send(result?.hits?.hits?.map(hit => hit._source))
});

module.exports = router;
