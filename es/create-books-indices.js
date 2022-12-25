const parse = require('csv-parser');
const fs = require ('fs');
const path = require('path');
const { chunk, flatten } = require('lodash');

const client = require('./client');

(async () => {
  const isBooksIndexExists = await client.indices.exists({ index: 'books' });

  if (!isBooksIndexExists) {
   await client.indices.create({
     index: 'books',
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
         "title": {
           "type": "text",
           "analyzer": "autocomplete",
           "search_analyzer": "standard"
         }
       }
     }
    })
  }

  const books = [];


  fs.createReadStream(path.resolve(process.cwd(), './data/books.csv'))
    .pipe(parse())
    .on('data', (book) => {
      books.push([{
        index: {
          _index: 'books',
          _id: book.id
        }
      }, book])
    })
    .on('end', async () => {
      const chunks = chunk(flatten(books), 2500);

      for await (const chunk of chunks) {
        await client.bulk ({ operations: chunk }).catch(e => console.log(e))
      }
    })
})()