const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.json());

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
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

// Feed API
app.get("/api/posts", (req, res) => {
  res.json([
    {
      user: "Lucky",
      text: "Welcome to LuckySocial 🚀",
      likes: 120
    },
    {
      user: "Admin",
      text: "Instagram style social app is working!",
      likes: 56
    }
  ]);
});

app.listen(PORT, () => {
  console.log(`LuckySocial running on port ${PORT}`);
});
