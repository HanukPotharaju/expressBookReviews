const axios = require("axios");
const express = require("express");
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;

const public_users = express.Router();

// ✅ Register a new user
public_users.post("/register", (req, res) => {
    console.log("🔹 Register route hit!");
    const { username, password } = req.body;

    if (!username || !password) {
        console.log("⚠️ Missing username or password.");
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the user already exists
    if (users.some(u => u.username === username)) {
        console.log("⚠️ Username already exists.");
        return res.status(400).json({ message: "Username already exists" });
    }

    // Add new user
    users.push({ username, password });
    console.log("✅ User registered successfully:", username);
    return res.status(201).json({ message: "User registered successfully" });
});

// ✅ Get the book list using Axios & async-await
// ✅ Get the book list available in the shop (Fixed)
public_users.get("/", async function (req, res) {
    try {
        console.log("📚 Fetching book list...");
        return res.status(200).json({ books }); // ✅ Directly return books instead of using Axios
    } catch (error) {
        console.error("❌ Error fetching books:", error.message);
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});


// ✅ Get book details based on ISBN using Promises 
public_users.get("/isbn/:isbn", (req, res) => {
    const { isbn } = req.params;
    console.log(`🔍 Fetching book details for ISBN: ${isbn}`);

    axios.get("http://localhost:5000/")
        .then(response => {
            const booksData = response.data.books;
            const book = booksData[isbn];

            if (!book) {
                return res.status(404).json({ message: "Book not found" });
            }

            return res.status(200).json({ book });
        })
        .catch(error => {
            console.error("❌ Error fetching book by ISBN:", error.message);
            return res.status(500).json({ message: "Error fetching book", error: error.message });
        });
});




// ✅ Get books by author using promises
public_users.get("/author/:author", (req, res) => {
    const author = req.params.author.toLowerCase();
    console.log(`🔍 Fetching books by author: ${author}`);

    axios.get("http://localhost:5000/")
        .then(response => {
            const booksData = response.data.books;

            let booksByAuthor = Object.keys(booksData)
                .map((isbn) => ({ isbn, ...booksData[isbn] }))
                .filter((book) => book.author.toLowerCase() === author);

            if (booksByAuthor.length > 0) {
                return res.status(200).json({ booksByAuthor });
            } else {
                return res.status(404).json({ message: "No books found for this author" });
            }
        })
        .catch(error => {
            console.error("❌ Error fetching books by author:", error.message);
            return res.status(500).json({ message: "Error fetching books by author", error: error.message });
        });
});


// ✅ Get books by title using async/await (Task 13)
public_users.get("/title/:title", async function (req, res) {
    try {
        const title = req.params.title.toLowerCase();
        console.log(`🔍 Fetching books with title: ${title}`);

        // Fetch all books
        const response = await axios.get("http://localhost:5000/");
        const booksData = response.data.books;

        // Filter books by title
        let booksByTitle = Object.keys(booksData)
            .map((isbn) => ({ isbn, ...booksData[isbn] }))
            .filter((book) => book.title.toLowerCase() === title);

        if (booksByTitle.length > 0) {
            return res.status(200).json({ booksByTitle });
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        console.error("❌ Error fetching books by title:", error.message);
        return res.status(500).json({ message: "Error fetching books by title", error: error.message });
    }
});


// ✅ Get book review
public_users.get("/review/:isbn", function (req, res) {
    const isbn = req.params.isbn;
    console.log(`🔍 Fetching reviews for ISBN: ${isbn}`);

    const book = books[isbn];
    if (book) {
        return res.status(200).json({ reviews: book.reviews });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Debug route to check registered users (TEMPORARY)
public_users.get("/users", (req, res) => {
    return res.status(200).json({ users });
});

module.exports = public_users;
