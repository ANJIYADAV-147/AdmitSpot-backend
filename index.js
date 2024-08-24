const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const dbPath = path.join(__dirname, "database.db");

const app = express();
const port = 3004;

app.use(cors());
app.use(express.json());

// Initialize Sequelize with SQLite database
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
});

// Define a posts model
const Post = sequelize.define('Post', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {  
        type: DataTypes.STRING,
    },
    
},
{
    timestamps:true,
});

// Synchronize the database and create tables
sequelize.sync({ force: false })
    .then(() => {
        console.log('Database and tables synced.');
    })
    .catch((err) => {
        console.log('Error syncing database:', err);
    });

// Create a new post
app.post('/posts', async (request, response) => {
    try {
        const newPost = await Post.create({
            title: request.body.title,
            content: request.body.content,
        });
        response.status(201).json(newPost);
    } catch (e) {
        console.error('Error creating post:', e);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

// Read all posts
app.get('/posts', async (request, response) => {
    try {
        const posts = await Post.findAll();  
        console.log(posts)
        response.json(posts);
    } catch (e) {
        console.error('Error fetching posts:', e);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

// Read a specific post by ID
app.get('/posts/:id', async (request, response) => {
    const postId = request.params.id;
    try {
        const post = await Post.findByPk(postId);  // Corrected 'taskId' to 'postId'
        if (post) {
            response.json(post);
        } else {
            response.status(404).json({ error: 'Post Not Found' });
        }
    } catch (e) {
        console.error('Error fetching post:', e);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update a post by ID
app.put('/posts/:id', async (request, response) => {
    const postId = request.params.id;
    try {
        const [updatedRows] = await Post.update({  // Corrected 'Posts' to 'Post'
            title: request.body.title,
            content: request.body.content,
        },
        {
            where: { id: postId }
        });
        if (updatedRows > 0) {
            response.json({ message: 'Post updated successfully' });
        } else {
            response.status(404).json({ error: 'Post not found' });
        }
    } catch (e) {
        console.error('Error updating post:', e);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
