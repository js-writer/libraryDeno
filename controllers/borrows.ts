import { Context } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { getQuery } from "https://deno.land/x/oak@v10.6.0/helpers.ts";
import { Borrow, Id } from "../types.ts";
import { borrowsList, changeBorrow, insertBorrow } from "../services/borrowsService.ts";

const getBorrows = async (ctx: Context): Promise<void> => {
  try {
    const result : Borrow[] = await borrowsList(); 
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

const addBorrows = async (ctx: Context): Promise<void> => {
  try {
    const borrow: Borrow = await ctx.request.body().value;
    const result : Id = await insertBorrow(borrow);
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

const updateBorrow = async (ctx: Context): Promise<void> => {
  try {
    const { timestamp } = await ctx.request.body().value;
    const { id } : Record<string, string> = getQuery(ctx, {mergeParams: true});
    const result : Id = await changeBorrow(parseInt(id), timestamp);

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

export { addBorrows, getBorrows, updateBorrow };
