import { Router } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import {
  addBook,
  getBooks,
  searchBook,
  updateBook,
} from "./controllers/books.ts";
import { addReader, getReaders, updateReader } from "./controllers/readers.ts";
import { addBorrows, getBorrows, updateBorrow } from "./controllers/borrows.ts";
import { loginUser } from "./controllers/login.ts";
import { refreshAccessToken } from "./controllers/refreshToken.ts";
import { logoutUser } from "./controllers/logout.ts";

const router = new Router();
const publicRouter = new Router();

publicRouter
  .post("/login", loginUser)
  .get("/logout", logoutUser)
  .get("/refresh", refreshAccessToken)
  .post("/search", searchBook);

router
  //books
  .get("/books", getBooks)
  .post("/books", addBook)
  .put("/books/:id", updateBook)
  //readers
  .get("/readers", getReaders)
  .post("/readers", addReader)
  .put("/readers/:id", updateReader)
  // borrows
  .get("/borrows", getBorrows)
  .post("/borrows", addBorrows)
  .put("/borrows/:id", updateBorrow);

export { publicRouter, router };
