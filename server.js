var fs = require('fs')
var express = require('express')

var app = express()
app.set('x-powered-by', false)

var rest = require('./router')

// Compose server routes
app.use('/api/v1', rest.router)
app.post('/save', function(req, res) {
  fs.writeFile('store.json', rest.save(), function(err){
    if (err) {
      return res.status(500).send()
    }
    return res.status(200).send()
  })
})
app.post('/load', function(req, res) {
  fs.readFile('store.json', function(err, text){
    if (err) {
      return res.status(500).send()
    }
    try {
      rest.load(text)
    } catch (err) {
      return res.status(500).send()
    }
    return res.status(200).send()
  })
})

// Run server
var server = app.listen(3000, 'localhost', function () {
  console.log('Server listening at http://'+server.address().address+':'+server.address().port);
});