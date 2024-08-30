const request = require("supertest");
const app = require("../app");
const db = require("../db");

beforeEach(async function () {
  await db.query("DELETE FROM books");
  await db.query(`
    INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
    VALUES ('1234567890', 'http://a.co/eobPtX2', 'Author Name', 'english', 200, 'Publisher Name', 'Book Title', 2020)
  `);
});

afterAll(async function () {
  await db.end();
});

describe("GET /books", function () {
  test("It should return an array of books", async function () {
    const res = await request(app).get("/books");
    expect(res.statusCode).toBe(200);
    expect(res.body.books.length).toBe(1);
  });
});

describe("POST /books", function () {
  test("It should create a new book", async function () {
    const res = await request(app)
      .post("/books")
      .send({
        isbn: "0987654321",
        amazon_url: "http://a.co/eobPtX3",
        author: "New Author",
        language: "english",
        pages: 250,
        publisher: "New Publisher",
        title: "New Book Title",
        year: 2021
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.book).toHaveProperty("isbn");
  });

  test("It should return an error for missing required fields", async function () {
    const res = await request(app)
      .post("/books")
      .send({
        isbn: "0987654321"
      });
    expect(res.statusCode).toBe(400);
  });
});

describe("PUT /books/:isbn", function () {
  test("It should update an existing book", async function () {
    const res = await request(app)
      .put("/books/1234567890")
      .send({
        isbn: "1234567890",  // Add this if required by the schema
        amazon_url: "http://a.co/eobPtX4",
        author: "Updated Author",
        language: "english",
        pages: 300,
        publisher: "Updated Publisher",
        title: "Updated Title",
        year: 2022
      });

    console.log(res.body);  // Check if the error is resolved

    expect(res.statusCode).toBe(200);
    expect(res.body.book.title).toBe("Updated Title");
  });

  test("It should return an error for invalid data", async function () {
    const res = await request(app)
      .put("/books/1234567890")
      .send({
        pages: -1
      });
    expect(res.statusCode).toBe(400);
  });
});

describe("DELETE /books/:isbn", function () {
  test("It should delete a book", async function () {
    const res = await request(app).delete("/books/1234567890");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Book deleted" });
  });

  test("It should return a 404 for non-existent book", async function () {
    const res = await request(app).delete("/books/nonexistent");
    expect(res.statusCode).toBe(404);
  });
});
