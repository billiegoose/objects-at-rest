// Simple JSON object store with REST API
var express = require('express')
var bodyParser = require('body-parser')

// Create all our routes on a router instance
var router = express.Router()

// Treat everything as JSON
router.use(bodyParser.json({type: '*/*'}))
router.use (function (error, req, res, next){
  if (error instanceof SyntaxError) {
    res.status(400).send({error: 'Invalid JSON'})
  } else {
    next()
  }
})

// In-memory data store
var store = {}
// TODO: Add save and load functions

// TODO: Make this more useful for API discovery
router.get('/', function (req, res) {
  res.status(200).json(Object.keys(store))
})

// Get all of resource
router.get('/:collection', collection, function (req, res) {
  res.status(200).json(Object.assign({}, req.collection))
})

// Get a single resource
router.get('/:collection/:id', collection, item, function (req, res) {
  res.status(200).json(req.item)
})

// Create new resource, auto-assign id
router.post('/:collection', collection, function (req, res) {
  var index = req.collection.push(req.body) - 1
  res.location('/'+req.params.collection+'/'+index.toString())
  res.status(201).send(req.body)
})

// Create or update resource
router.put('/:collection/:id', collection, item, function (req, res) {
  req.collection[req.params.id] = req.body
  res.status(200).json(req.body)
})

// Create or update resource, merge properties
router.patch('/:collection/:id', collection, item, function (req, res) {
  var body = Object.assign(req.item, req.body)
  res.status(200).json(body)
})

// Delete a resource
router.delete('/:collection/:id', collection, item, function (req, res) {
  delete req.collection[req.params.id]
  res.status(204).send()
})

// Unsupported method catchall
router.use(function(req, res){
  res.status(400).json({error: "'"+req.method+" "+req.path+"' is not a supported operation"})
})

// Middleware logic
function collection(req, res, next) {
  var col = req.params.collection
  if (!store.hasOwnProperty(col)) {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      store[col] = []
    } else {
      return res.status(404).json({error: "'/"+col+"' does not exist"})
    }
  }
  req.collection = store[col]
  next()
}

function item(req, res, next) {
  var col = req.params.collection
  var id = req.params.id
  var present = req.collection.hasOwnProperty(id)
  if (!present && (req.method === 'GET')) {
    return res.status(404).json({error: "'/"+col+"/"+id+"' not found"})
  }
  if (!present && (req.method === 'PATCH')) {
    req.collection[id] = {}
  }
  req.item = req.collection[id]
  next()
}

module.exports = {
  router: router,
  save: function() {
    return JSON.stringify(store)
  },
  load: function(json) {
    store = JSON.parse(json)
  }
}