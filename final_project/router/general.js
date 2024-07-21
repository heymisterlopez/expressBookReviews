const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Get the book list available in the shop using async-await
public_users.get('/', async function (req, res) {
  try {
    const bookList = await new Promise((resolve, reject) => {
      resolve(books);
    });
    res.json(bookList);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving book list", error: error.message });
  }
});

// Get book details based on ISBN using async-await
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = await new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject(new Error("Book not found"));
      }
    });
    res.json(book);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Get book details based on author using async-await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const booksByAuthor = await new Promise((resolve, reject) => {
      const bookList = [];
      for (let key in books) {
        if (books[key].author === author) {
          bookList.push(books[key]);
        }
      }
      if (bookList.length > 0) {
        resolve(bookList);
      } else {
        reject(new Error("Books not found"));
      }
    });
    res.json(booksByAuthor);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Get book details based on title using async-await
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const booksByTitle = await new Promise((resolve, reject) => {
      const bookList = [];
      for (let key in books) {
        if (books[key].title === title) {
          bookList.push(books[key]);
        }
      }
      if (bookList.length > 0) {
        resolve(bookList);
      } else {
        reject(new Error("Books not found"));
      }
    });
    res.json(booksByTitle);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn] && books[isbn].reviews) {
    res.json(books[isbn].reviews);
  } else {
    res.status(404).json({ message: "No reviews found" });
  }
});

module.exports.general = public_users;
