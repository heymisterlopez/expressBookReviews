const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    { username: "joemartin", password: "secret" }
];

const isValid = (username) => {
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ username }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = { accessToken, username };
        return res.status(200).json({ message: "User successfully logged in" });
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    if (!isbn || !review) {
        return res.status(400).json({ message: "ISBN and review are required" });
    }

    const token = req.session.authorization?.accessToken;
    if (!token) {
        return res.status(403).json({ message: "User not authenticated" });
    }

    jwt.verify(token, 'access', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token verification failed" });
        }

        const username = decoded.username;
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        const book = books[isbn];
        if (!book.reviews) {
            book.reviews = {};
        }

        book.reviews[username] = review;

        return res.status(200).json({ message: "Review added/updated successfully" });
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    if (!isbn) {
        return res.status(400).json({ message: "ISBN is required" });
    }

    const token = req.session.authorization?.accessToken;
    if (!token) {
        return res.status(403).json({ message: "User not authenticated" });
    }

    jwt.verify(token, 'access', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token verification failed" });
        }

        const username = decoded.username;
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        const book = books[isbn];
        if (!book.reviews || !book.reviews[username]) {
            return res.status(404).json({ message: "Review not found" });
        }

        delete book.reviews[username];

        return res.status(200).json({ message: "Review deleted successfully" });
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
