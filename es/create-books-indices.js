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