const parse = require('csv-parser');
const fs = require ('fs');
const path = require('path');
const { chunk, flatten } = require('lodash');

const client = require('./client');

(async () => {
  const isAuthorsIndexExists = await client.indices.exists({ index: 'authors' });

  if (!isAuthorsIndexExists) {
    await client.indices.create({
      index: 'authors',
      "settings": {
        "analysis": {
          "filter": {
            "autocomplete_filter": {
              "type": "edge_ngram",
              "min_gram": 1,
              "max_gram": 10
            }
          },
          "analyzer": {
            "autocomplete": {
              "type": "custom",
              "tokenizer": "standard",
              "filter": [
                "lowercase",
                "autocomplete_filter"
              ]
            }
          }
        }
      },
      "mappings": {
        "properties": {
          "authorName": {
            "type": "text",
            "analyzer": "autocomplete",
            "search_analyzer": "standard"
          }
        }
      },
    })
  }

  const authors = [];


  fs.createReadStream(path.resolve(process.cwd(), './data/authors.csv'))
    .pipe(parse())
    .on('data', (author) => {
      authors.push([{
        index: {
          _index: 'authors',
          _id: author.id
        }
      }, author])
    })
    .on('end', async () => {
      const chunks = chunk(flatten(authors), 2500);

      for await (const chunk of chunks) {
        await client.bulk ({ operations: chunk }).catch(e => console.log(e))
      }
    })
})()