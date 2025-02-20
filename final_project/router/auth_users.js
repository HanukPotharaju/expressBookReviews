const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to validate if the user exists
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// ✅ Middleware for JWT Authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No valid token provided." });
    }

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer "
    try {
        const verified = jwt.verify(token, "secret_key");
        req.user = verified; // Attach decoded user data
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
};

// ✅ User Login - Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // ✅ Generate JWT token
    const token = jwt.sign({ username }, "secret_key", { expiresIn: "1h" });
    return res.status(200).json({ message: "Login successful", token });
});

// ✅ Add or Update a Book Review
regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const username = req.user.username; // Extract username from JWT

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // ✅ Store the review under the username
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added successfully", reviews: books[isbn].reviews });
});

// ✅ Delete a Book Review (Authenticated)
regd_users.delete("/auth/review/:isbn", authenticateToken, (req, res) => {
  const { isbn } = req.params;
  const username = req.user.username; // Extract username from JWT

  if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "No review found for this user" });
  }

  // ✅ Remove the user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
});




module.exports.authenticated = regd_users;
module.exports.users = users;
