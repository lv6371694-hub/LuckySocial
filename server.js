const express = require("express");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB CONNECTED"))
  .catch((err) => console.error("MongoDB ERROR:", err.message));

// Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

const postSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: uuidv4 },
  user: { type: String, required: true },
  text: { type: String, default: "" },
  likes: { type: Number, default: 0 },
  comments: { type: [String], default: [] }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({
        success: false,
        message: "Username and password required"
      });
    }

    const exists = await User.findOne({ username });

    if (exists) {
      return res.json({
        success: false,
        message: "Username already exists"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hash
    });

    res.json({
      success: true,
      message: "Signup successful"
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      success: false,
      message: "Signup failed"
    });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

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
      message: "Login successful",
      username: user.username
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
});

// Feed API
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).lean();

    // Keep the welcome post available if database is empty
    if (posts.length === 0) {
      const welcome = await Post.create({
        id: uuidv4(),
        user: "Lucky",
        text: "Welcome to LuckySocial 🚀",
        likes: 0,
        comments: []
      });

      return res.json([welcome]);
    }

    res.json(posts);
  } catch (err) {
    console.error("Posts error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load posts"
    });
  }
});

// Create Post
app.post("/api/posts", async (req, res) => {
  try {
    const user = req.body.user || req.body.username || "Lucky";
    const text = req.body.text || req.body.content || "";

    if (!text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post text required"
      });
    }

    const post = await Post.create({
      id: uuidv4(),
      user,
      text,
      likes: 0,
      comments: []
    });

    res.json({
      success: true,
      message: "Post created",
      post
    });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create post"
    });
  }
});

// Like Post
app.post("/api/posts/:id/like", async (req, res) => {
  try {
    const post = await Post.findOne({ id: req.params.id });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    post.likes++;
    await post.save();

    res.json({
      success: true,
      likes: post.likes
    });
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to like post"
    });
  }
});

// Comment
app.post("/api/posts/:id/comment", async (req, res) => {
  try {
    const post = await Post.findOne({ id: req.params.id });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const comment = req.body.comment;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Comment required"
      });
    }

    post.comments.push(comment);
    await post.save();

    res.json({
      success: true,
      comments: post.comments
    });
  } catch (err) {
    console.error("Comment error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to comment"
    });
  }
});
// Follow / Unfollow
app.post("/api/users/:username/follow", async (req, res) => {
  try {
    const targetUsername = req.params.username;
    const currentUsername = req.body.username;

    if (!currentUsername) {
      return res.status(400).json({
        success: false,
        message: "Username required"
      });
    }

    if (targetUsername === currentUsername) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself"
      });
    }

    const currentUser = await User.findOne({ username: currentUsername });
    const targetUser = await User.findOne({ username: targetUsername });

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const alreadyFollowing = currentUser.following.includes(targetUsername);

    if (alreadyFollowing) {
      currentUser.following.pull(targetUsername);
      targetUser.followers.pull(currentUsername);
    } else {
      currentUser.following.push(targetUsername);
      targetUser.followers.push(currentUsername);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      success: true,
      following: !alreadyFollowing,
      followers: targetUser.followers.length
    });

  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to follow user"
    });
  }
});
// Start Server
app.listen(PORT, () => {
  console.log(`LuckySocial running on port ${PORT}`);
});
