require('dotenv').config()

const { PORT, MONGODB_USER, MONGODB_PASSWORD, MONGODB_CLUSTER, MONGODB_DATABASE } = process.env

const express = require('express')
const app = express()

const mongoose = require('mongoose') // si ya pas de chemin ca sera dans le node modules

mongoose.connect(`mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER}.mongodb.net/${MONGODB_DATABASE}?retryWrites=true&w=majority`)

// Importer les routeurs
const adminRouter = require('./routers/admin-router').router
const recipesRouter = require('./routers/recipes-router').router

const db = mongoose.connection

db.on('error', console.error.bind(console,'ERROR: CANNOT CONNECT TO MONGO-DB'))
db.once('open',() => console.log('CONNECTED TO MANGO DB'))


// API Rest JSON

const bodyParser = require('body-parser')
app.use(bodyParser.json())

// Utiliser les routeurs dans l'application
app.use('/admin/',adminRouter)
app.use('', recipesRouter);




app.listen(PORT, () => 
console.log(`Application lancée sur le port ${PORT} !!!`)
)


