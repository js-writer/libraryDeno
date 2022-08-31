import { Context } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { getQuery } from "https://deno.land/x/oak@v10.6.0/helpers.ts";
import { Book, BookWithBorrow, Id } from "../types.ts";
import { findBooks, booksList, insertBook, changeBook } from "../services/booksService.ts";

const getBooks = async (ctx: Context) : Promise<void> => {
  const { availableOnly } : Record<string, string> = getQuery(ctx);
  try {
    const result : BookWithBorrow[] = await booksList(!!availableOnly);
    ctx.response.status = 201;
    ctx.response.body = result
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      msg: err.toString(),
    };
  }
};

const addBook = async (ctx: Context): Promise<void> => {
  try {
    const book: Book = await ctx.request.body().value;
    const result : Id = await insertBook(book);
    ctx.response.status = 201;
    ctx.response.body = result;
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      msg: err.toString(),
    };
  }
};

const updateBook = async (ctx: Context): Promise<void> => {
  try {
    const { id } = getQuery(ctx, {mergeParams: true});
    const book: Book = await ctx.request.body().value;
    const result : Id = await changeBook(parseInt(id), book);
    ctx.response.status = 201;
    ctx.response.body = result;
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      msg: err.toString(),
    };
  }
};

const searchBook = async (ctx: Context): Promise<void> => {
  try {
    const question = await ctx.request.body().value;
    const books : BookWithBorrow[] = await findBooks(question);
    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      data: books
    };
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      msg: err.toString(),
    };
  }
};

export { addBook, getBooks, updateBook, searchBook };
