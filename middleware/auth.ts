import { Context } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { NextFn } from "../types.ts";
import { validateToken } from "../utils/token.ts";

const auth = async (ctx: Context, next: NextFn): Promise<401 | undefined>  => {
  const token : string | undefined = ctx.request.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return ctx.response.status = 401;
  }

  try {
    const login: string | undefined = await validateToken(token);
    if (!login) {
      return ctx.response.status = 401;
    }
    await next();
  } catch (err) {
    ctx.response.status = 401;
    if (err instanceof Deno.errors.NotFound) {
      ctx.response.body = "User does not exists";
    }

    if (err instanceof RangeError) {
      return ctx.response.status = 401;
    }
  }
};

export { auth };
