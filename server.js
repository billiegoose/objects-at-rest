var fs = require('fs')
var express = require('express')

var app = express()
app.set('x-powered-by', false)

// Mount Objects@REST API
var rest = require('./router')
app.use('/', rest.router)

// Import store.json on start.
try {
  var data = fs.readFileSync('store.json')
  rest.load(data)
} catch (e) {
  // No store.json
}

// Run server
var server = app.listen(3000, 'localhost', function () {
  console.log('Server listening at http://'+server.address().address+':'+server.address().port)
})

// Export store on exit.
process.on('SIGINT', function(){
  console.log('bye')
  fs.writeFileSync('store.json', rest.save())
  process.exit()
})
