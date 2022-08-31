import { Client } from "https://deno.land/x/postgres@v0.16.1/mod.ts";
import { QueryObjectResult } from "https://deno.land/x/postgres@v0.16.1/query/query.ts";
import { credentials } from "../config.ts";
import { Borrow, Id } from "../types.ts";

const client = new Client(credentials);

const borrowsList = async (): Promise<Borrow[]> => {
  try {
    await client.connect();
    const result : QueryObjectResult<Borrow[]> = await client.queryObject<Borrow[]>`SELECT
      json_agg(to_json(t))
      AS borrowed FROM
      (SELECT  borrows.id,
      readers.name,
      readers.surname, 
      books.id as bookid,
      books.title, 
      books.author_name, 
      books.author_surname,
      borrows.date_from, 
      borrows.date_to FROM borrows
      LEFT JOIN books ON borrows.bookid = books.id
      LEFT JOIN readers ON borrows.readerid = readers.id
      ORDER BY borrows.id)t`;
    return result.rows[0];
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
};

const insertBorrow = async (borrow: Borrow): Promise<Id> => {
  try {
    await client.connect();
    const result : QueryObjectResult<Id> = await client.queryObject<Id>`INSERT INTO borrows(bookid, readerid, date_from) 
    VALUES (${borrow.bookid},${borrow.readerid}, ${borrow.date_from}) RETURNING borrows.id`;
    return result.rows[0];
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
};

const changeBorrow = async (id: number, timestamp: number): Promise<Id> => {
  try {
    await client.connect();
    const result : QueryObjectResult<Id> = await client.queryObject<Id>`UPDATE borrows
      SET date_to = ${timestamp}
      WHERE borrows.id = ${id} RETURNING borrows.id`;
    return result.rows[0];
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
};

export { borrowsList, changeBorrow, insertBorrow };
