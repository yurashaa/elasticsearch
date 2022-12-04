const express = require('express');
const router = express.Router();

const client = require('../es/client')

router.get('/', async (req, res) => {
  const query = req.query;

  const [field, value] = Object.entries(query).pop();

  const result = await client.search({ index: 'books', body: {
      query: {
        match: {
          [field]: value
        }
      }
    }
  })

  res.status(200).send(result?.hits?.hits?.map(hit => hit._source))
});

module.exports = router;
