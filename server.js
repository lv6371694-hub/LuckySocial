const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Demo users (अभी database नहीं है)
const users = [
  {
    username: "admin",
    password: "1234"
  }
];

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password"
    });
  }

  res.json({
    success: true,
    message: "Login successful"
  });
});

// Feed
app.get("/api/posts", (req, res) => {
  res.json([
    {
      id: 1,
      user: "Lucky",
      text: "Welcome to LuckySocial 🚀",
      likes: 120
    },
    {
      id: 2,
      user: "Admin",
      text: "This is the first post.",
      likes: 45
    }
  ]);
});

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`LuckySocial running on port ${PORT}`);
});
