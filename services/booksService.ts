import { Client } from "https://deno.land/x/postgres@v0.16.1/mod.ts";
import { QueryObjectResult } from "https://deno.land/x/postgres@v0.16.1/query/query.ts";
import { credentials } from "../config.ts";
import { Book, BookWithBorrow, Id } from "../types.ts";

const client = new Client(credentials);

const booksList = async (availableOnly: boolean) : Promise<BookWithBorrow[]> => {
  const query = `SELECT json_agg(to_json(t)) as books FROM 
  (SELECT books.id, books.title, books.isbn, books.author_name, books.author_surname, books.quantity, 
      (COUNT(borrows.id) - COUNT (borrows.date_to)) as borrowed FROM books
  LEFT JOIN borrows ON borrows.bookid = books.id
  GROUP BY books.id ${availableOnly? "HAVING (COUNT(borrows.id) - COUNT (borrows.date_to))< books.quantity": ""}
  ORDER BY 
  books.title ASC)t`;
  try {
    await client.connect();
    const result : QueryObjectResult<BookWithBorrow[]> = await client.queryObject<BookWithBorrow[]>(query);
    return result.rows[0];
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
};

const insertBook = async (book: Book) : Promise<Id> => {
  try {
    await client.connect();
    const result : QueryObjectResult<Id> = await client.queryObject<Id>`INSERT INTO books(title, author_name, author_surname, isbn, quantity) 
      VALUES (${book.title},${book.author_name}, ${book.author_surname} ,${book.isbn},${book.quantity}) RETURNING books.id`;
    return result.rows[0];
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
};

const changeBook = async (id: number, book: Book) : Promise<Id> => {
  try {
    await client.connect();
    const result : QueryObjectResult<Id> = await client.queryObject<Id>`UPDATE books SET 
      title = ${book.title}, 
      author_name = ${book.author_name},
      author_surname = ${book.author_surname},
      isbn = ${book.isbn}, 
      quantity = ${book.quantity}
      WHERE books.id = ${id} RETURNING books.id`;
    return result.rows[0];
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
};

const findBooks = async (question: { title?: string; isbn?: number }): Promise<BookWithBorrow[]> => {

  const condition = `
    ${question.title || question.isbn ? "WHERE" : ""}
    ${question.title? `LOWER(books.title) LIKE LOWER(CONCAT('%',TRIM('${question.title}'),'%'))`: ""} 
    ${(question.isbn && question.title) ? "OR" : ""}
    ${question.isbn? `books.isbn LIKE CONCAT('%',TRIM('${question.isbn}'),'%')`: ""}`;
  try {
    await client.connect();
    const result : QueryObjectResult<BookWithBorrow[]> = await client.queryObject<BookWithBorrow[]>(`
        SELECT json_agg(to_json(t)) as books FROM 
        (SELECT books.id, books.title, books.isbn, books.author_name, books.author_surname, books.quantity, 
            (COUNT(borrows.id) - COUNT (borrows.date_to)) as borrowed FROM books
        LEFT JOIN borrows ON borrows.bookid = books.id
        ${condition}
        GROUP BY books.id 
        HAVING (COUNT(borrows.id) - COUNT(borrows.date_to)) < books.quantity  
        ORDER BY 
        books.title ASC)t`);
    return result.rows[0];
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
};

export { changeBook, findBooks, booksList, insertBook };
