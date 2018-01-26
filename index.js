var config = require('./config/config.json')

console.log(config.name)

var models = require('./models')

new models.User()
new models.Product()