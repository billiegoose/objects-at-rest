# *Objects@REST*
Need to test some AJAX code, but don't have an API to test it against?
Look no further!
Why mock your API using cumbersome tools,
when you could generate your dummy data using the very AJAX commands you want to test?

*Objects@REST* is a simple in-memory [object store](https://en.wikipedia.org/wiki/Object_storage) server for REST API play-testing.

### Features
- **What You PUT Is What You GET (WYPIWYG).** It's that simple.
- Handle GET, POST, PUT, PATCH, and DELETE methods.
- Return `200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, and `404 Not Found` statuses.
- Create dummy data from POST, PUT, and PATCH bodies.
- Import and export dummy data as JSON.
- Written in [Node](https://nodejs.org/en/) using [Express](http://expressjs.com).

The module comes with a demo server, but can also be `require`'d to return an Express router
you can mount on a path in your own Node application.

## Installation

With npm (latest official release):
```bash
npm install objects-at-rest
```

With git (most recent code):
```bash
git clone https://github.com/wmhilton/objects-at-rest
cd objects-at-rest
npm install
```

## Run demo server
```
npm start
```
This will run server.js, an instance of [Express](http://expressjs.com/) running on localhost:3000.
When you hit Ctrl+C it will dump the *store* to store.json.
The next time the server starts, it will read store.json to populate the *store*.

## The Module
The module exports the following:

 Method     | Description                  | Inputs      | Output
------------|-------------------------------------------------------
 *router()* | The Express router           | none        | [Router](http://expressjs.com/en/4x/api.html#router)
 *save()*   | Export the *store*           | none        | JSON string
 *load()*   | Import the *store*           | JSON String | none

### Example Usage
```JavaScript
var fs = require('fs')
var express = require('express')
var app = express()

// Example - require
var rest = require('objects-at-rest')

// Example - mount router
app.use('/api/v1/', rest.router())

// Example - load store.json on start
rest.load(fs.readFileSync('store.json'))

var server = app.listen()

// Example - Export store on exit.
server.on('close', function(){
  fs.writeFileSync('store.json', rest.save())
})
```
## The REST API
There are two kinds of resources: *items* & *collections*.
They are analogous to documents & collections (in MongoDB),
objects & buckets (in Amazon S3), objects & containers (in Rackspace Cloud File)...
you get the picture.
There is a single global *store* that holds the collections.
It pretty much looks like this:

```JavaScript
// The global store
var store = {
  bananas: {         // A collection of bananas
    "0": { item },   // created by POSTing to /bananas
    "1": { item },
    "2": { item },
    ...
  },
  people: {                  // A collection of persons
    john_snow: { item },     // created by PUTing to /people/john_snow, etc
    "Arya Stark": { item },
    "any valid JavaScript key": { item },
    ...
  },
  ...
}
```

#### For ALL requests
- For simplicity, request bodies are assumed to be JSON.
- A `400 Bad Request` and error object will be returned if the request body contains invalid JSON.
- A `400 Bad Request` and error object will be returned if the requested operation is not supported.


### Item Resource
An item is a JSON document. It has an *id* that is unique within its collection.
*id* can be any valid object key, not just a number.

#### GET /:foobar/:id
Retrieve *store.foobar[id]*
- If it exists returns: `200 OK` and item
- If not, returns: `404 Not Found` and error object

#### PUT /:foobar/:id
Create or replace *store.foobar[id]* with the one in the request body.
- Implicitly create *foobar* collection if it didn't exist before
- Returns: `200 OK` and item

#### PATCH /:foobar/:id
Create or update *store.foobar[id]* by overwriting its current properties with those in the request body.
It uses *Object.assign(store.foobar[id], req.body)* which is similar to *$.extend()* from jQuery or *_.assign()* from lodash if you are familiar with those libraries.
- Implicitly create *foobar* collection if it didn't exist before
- Returns: `200 OK` and (full) item

#### DELETE /:foobar/:id
Delete *store.foobar[id]*
- Returns: `204 No Content` regardless of whether *foobar[id]* existed or not


### Collection Resource
A collection is an array of items.
Except really it is a hash table of items, so it is returned as a JSON object,
not an array.

#### GET /:foobar
Retrieve all the *foobars*. Response contains a JSON object (not an array!)
where the keys are the item *id*'s.
- If the collection exists, returns: `200 OK` and *store.foobar* (even if *foobar* is empty)
- If not, returns: `404 Not Found` and error object

#### POST /:foobar
Append the object in the request body to *store.foobar*. The object's *id* is assigned by
taking "largest Integer property key" + 1.
- Implicitly create *foobar* collection if it didn't exist before
- Returns: `201 Created` with the URL of the new resource in the HTTP `Location` header

#### DELETE /:foobar
Delete *store.foobar*.
- Returns: `400 Bad Request` if the collection is not empty.
- Returns: `204 No Content` if *store.foobar* was deleted or did not exist
