const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

//only registered users can login
regd_users.post("/login", (req,res) => {
   const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ username }, "access", { expiresIn: '1h' });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "Login successful" });
  } else {
    return res.status(401).json({ message: "Invalid login credentials" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.user.username; 
  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!review) {
    return res.status(400).json({ message: "Review content is required in query params" });
  }

  const book = books[isbn];

  if (book) {
    book.reviews[username] = review;
    return res.status(200).json({ message: `Review by ${username} added/updated successfully`, reviews: book.reviews });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({ message: `Review by ${username} deleted successfully` });
  } else {
    return res.status(404).json({ message: "Review by user not found" });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
