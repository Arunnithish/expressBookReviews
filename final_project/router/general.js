const axios = require('axios');
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users.find(user => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
   const author = req.params.author.toLowerCase();
  let matchedBooks = [];

  Object.keys(books).forEach(key => {
    if (books[key].author.toLowerCase() === author) {
      matchedBooks.push({ id: key, ...books[key] });
    }
  });

  if (matchedBooks.length > 0) {
    return res.status(200).json(matchedBooks);
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
   const title = req.params.title.toLowerCase();
  let matchedBooks = [];

  Object.keys(books).forEach(key => {
    if (books[key].title.toLowerCase() === title) {
      matchedBooks.push({ id: key, ...books[key] });
    }
  });

  if (matchedBooks.length > 0) {
    return res.status(200).json(matchedBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
   const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});



//Add the code for getting the list of books available in the shop (done in Task 1) using Promise callbacks or async-await with Axios
public_users.get('/async-books', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch books", error: error.message });
  }
});


public_users.get('/async-isbn/:isbn', (req, res) => {
  axios.get(`http://localhost:5000/isbn/${req.params.isbn}`)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      res.status(500).json({ message: "Error fetching book by ISBN", error: error.message });
    });
});


public_users.get('/async-author/:author', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:5000/author/${req.params.author}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books by author", error: error.message });
  }
});


public_users.get('/async-title/:title', (req, res) => {
  axios.get(`http://localhost:5000/title/${req.params.title}`)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      res.status(500).json({ message: "Error fetching books by title", error: error.message });
    });
});

module.exports.general = public_users;
