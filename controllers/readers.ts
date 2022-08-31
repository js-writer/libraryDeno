import { Context } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { getQuery } from "https://deno.land/x/oak@v10.6.0/helpers.ts";
import { Id, Reader } from "../types.ts";
import { readersList, insertReader, changeReader } from "../services/readersService.ts";

const getReaders = async (ctx: Context): Promise<void> => {
  try {
    const { withBorrows }: Record<string,string> = getQuery(ctx);
    const result: Reader[] = await readersList(!!withBorrows);
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

const addReader = async (ctx: Context):Promise<void> => {
  try {
    const reader: Reader = await ctx.request.body().value;
    const result: Id = await insertReader(reader);
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

const updateReader = async (ctx : Context): Promise<void> => {
  try {
    const { id } : Record<string,string> = getQuery(ctx, {mergeParams: true});
    const reader: Reader = await ctx.request.body().value;
    const result : Id = await changeReader(parseInt(id), reader);
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

export { addReader, getReaders, updateReader };