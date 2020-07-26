const express = require('express')
const bodyParser = require('body-parser')
// TODO: Need to remove this
const cors = require('cors')
const { randomBytes } = require('crypto')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())
app.use(cors())
const PORT = process.env.NODE_ENV | 4000
const posts = {}

app.get('/posts', (req,res) => { 
    res.send(posts)
})

app.post('/posts', async (req,res) => { 
    const id = randomBytes(4).toString('hex')
    const { title } = req.body
    posts[id] = {
        id, title
    } 

    await axios.post('http://localhost:4005/events', {
        type: 'PostCreated',
        data: {
            id, title
        }
    })

    res.status(201).send(posts[id])
})

app.post('/events', (req,res) => {
    console.log('Received event', req.body)

    res.send({})
})

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})

