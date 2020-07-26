const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { randomBytes } = require('crypto')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())
app.use(cors())
const PORT = process.env.NODE_ENV | 4001

const commentsByPostId = {}

app.get('/posts/:id/comments', (req,res) => { 
    const { id } = req.params;

    res.send(commentsByPostId[id] || [])
})

app.post('/posts/:id/comments', async (req,res) => { 
    const commentId = randomBytes(4).toString('hex')
    const { content } = req.body
    const { id } = req.params

    const comments = commentsByPostId[id] || []

    comments.push({id: commentId, content, status: 'pending'})

    commentsByPostId[id] = comments

    await axios.post('http://localhost:4005/events', {
        type: 'CommentCreated',
        data: {
            id: commentId,
            content,
            postId: id,
            status: 'pending'
        }
    })

    res.status(201).send(comments)

})

app.post('/events', async (req,res) => {
    console.log('Received event: ', req.body)

    const { type, data } = req.body

    if (type == 'CommentModerated') {

        console.log(data)
        const { postId, id, status, content } = data

        const comments = commentsByPostId[postId]
        console.log('checl comments'
        )
        console.log(postId)
        console.log(comments)

        const comment = comments.find(comment => {
            return comment.id === id
        })
        comment.status = status;

        await axios.post('http://localhost:4005/events', {
            type:'CommentUpdated',
            data: {
                id,
                status,
                postId,
                content
            }
        })
    }

    res.send({})
})

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})