const express = require('express');
const bodyParser = require('body-parser');

const { getStoredPosts, storePosts } = require('./data/posts');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  // Menambahkan header CORS
  // Diperlukan saat menggunakan backend terpisah (yang berjalan di domain berbeda)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/posts', async (req, res) => {
  const storedPosts = await getStoredPosts();
  // await new Promise((resolve, reject) => setTimeout(() => resolve(), 1500));
  res.json({ posts: storedPosts });
});

app.get('/posts/:id', async (req, res) => {
  const storedPosts = await getStoredPosts();
  const post = storedPosts.find((post) => post.id === req.params.id);
  res.json({ post });
});

app.post('/posts', async (req, res) => {
  const existingPosts = await getStoredPosts();
  const postData = req.body;
  const newPost = {
    ...postData,
    id: Math.random().toString(),
  };
  const updatedPosts = [newPost, ...existingPosts];
  await storePosts(updatedPosts);
  res.status(201).json({ message: 'Stored new post.', post: newPost });
});

app.delete('/posts/:id', async (req, res) => {
  const postId = req.params.id;
  const existingPosts = await getStoredPosts();
  const updatedPosts = existingPosts.filter((post) => post.id !== postId);

  if (updatedPosts.length === existingPosts.length) {
    return res.status(404).json({ message: 'Post not found.' });
  }

  await storePosts(updatedPosts);
  res.status(200).json({ message: 'Post deleted.' });
});

app.listen(8080);
