import { Client } from "https://deno.land/x/postgres@v0.16.1/mod.ts";
import { QueryObjectResult } from "https://deno.land/x/postgres@v0.16.1/query/query.ts";
import { credentials } from "../config.ts";
import { Id, Reader } from "../types.ts";

const client = new Client(credentials);

const readersList = async (withBorrows: boolean): Promise<Reader[]> => {
  const query = withBorrows
    ? `SELECT json_agg(to_json(t)) as readers FROM 
    (SELECT readers.id, readers.name, readers.surname, json_agg(borrows.bookid) as borrowsid
    FROM readers
    LEFT JOIN borrows ON borrows.readerid = readers.id
    AND borrows.date_to IS NULL
    GROUP BY readers.id
    ORDER BY readers.surname ASC)t`
    : `SELECT json_agg(readers ORDER by readers.surname ASC) as readers FROM readers`;
  try {
    await client.connect();
    const result : QueryObjectResult<Reader[]> = await client.queryObject<Reader[]>(query);
    return result.rows[0];
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
};

const insertReader = async (reader: Reader): Promise<Id> => {
  try {
    await client.connect();
    const result : QueryObjectResult<Id> = await client.queryObject<Id>`INSERT INTO 
    readers(name, surname, phonenumber, city, street, house, zipcode) 
    VALUES (${reader.name},${reader.surname},${reader.phonenumber},${reader.city}, ${reader.street}, ${reader.house}, ${reader.zipcode} ) RETURNING readers.id`;
    return result.rows[0];
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
};

const changeReader = async (id: number, reader: Reader): Promise<Id> => {
  try {
    await client.connect();
    const result : QueryObjectResult<Id> = await client.queryObject<Id>`UPDATE readers SET
      name = ${reader.name}, 
      surname = ${reader.surname}, 
      phonenumber = ${reader.phonenumber},
      city = ${reader.city},
      street = ${reader.street},
      house = ${reader.house},
      zipcode = ${reader.zipcode}
      WHERE readers.id = ${id}
      RETURNING readers.id`;
    return result.rows[0];
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
};

export { insertReader, readersList, changeReader };
