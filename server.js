// Dummy API (Feed)
app.get("/api/posts", (req, res) => {
  res.json([
    {
      user: "Lucky",
      text: "Welcome to LuckySocial 🚀",
      image: "",
      likes: 120
    },
    {
      user: "Admin",
      text: "Instagram style social app is working!",
      image: "",
      likes: 56
    }
  ]);
});

// Login API
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "1234") {
    return res.json({
      success: true,
      message: "Login successful"
    });
  }

  res.status(401).json({
    success: false,
    message: "Invalid username or password"
  });
});

app.listen(PORT, () => {
  console.log(`LuckySocial running on port ${PORT}`);
});
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Static files
app.use(express.static(__dirname));
app.use(express.json());

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Dummy API (Feed)
app.get("/api/posts", (req, res) => {
  res.json([
    {
      user: "Lucky",
      text: "Welcome to LuckySocial 🚀",
      image: "",
      likes: 120
    },
    {
      user: "Admin",
      text: "Instagram style social app is working!",
      image: "",
      likes: 56
    }
  ]);
});

app.listen(PORT, () => {
  console.log(`LuckySocial running on port ${PORT}`);
});
