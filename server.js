const express = require("express");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Demo data (अभी database नहीं है)
const users = [];
const posts = [
  {
    id: uuidv4(),
    user: "Lucky",
    text: "Welcome to LuckySocial 🚀",
    likes: 0,
    comments: []
  }
];

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Signup
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const exists = users.find(u => u.username === username);
  if (exists) {
    return res.json({
      success: false,
      message: "Username already exists"
    });
  }

  const hash = await bcrypt.hash(password, 10);

  users.push({
    username,
    password: hash
  });

  res.json({
    success: true,
    message: "Signup successful"
  });
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);

  if (!user) {
    return res.json({
      success: false,
      message: "User not found"
    });
  }

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    return res.json({
      success: false,
      message: "Wrong password"
    });
  }

  res.json({
    success: true,
    message: "Login successful"
  });
});
// Feed API
app.get("/api/posts", (req, res) => {
  res.json(posts);
});

// Create Post
app.post("/api/posts", (req, res) => {
  const { user, text } = req.body;

  posts.unshift({
    id: uuidv4(),
    user,
    text,
    likes: 0,
    comments: []
  });

  res.json({
    success: true,
    message: "Post created"
  });
});

// Like Post
app.post("/api/posts/:id/like", (req, res) => {
  const post = posts.find(p => p.id === req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Post not found"
    });
  }

  post.likes++;

  res.json({
    success: true,
    likes: post.likes
  });
});

// Comment
app.post("/api/posts/:id/comment", (req, res) => {
  const post = posts.find(p => p.id === req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Post not found"
    });
  }

  post.comments.push(req.body.comment);

  res.json({
    success: true,
    comments: post.comments
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`LuckySocial running on port ${PORT}`);
});
