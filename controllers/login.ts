import { Context } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { checkCredential, saveRefreshToken } from "../services/loginService.ts";
import { setCookie } from "https://deno.land/std@0.151.0/http/cookie.ts";
import { LoginData } from "../types.ts";

const loginUser = async (ctx: Context) : Promise<void> => {
  try {
    const data : LoginData = await ctx.request.body().value;

    if (!(data.login && data.password)) {
      ctx.response.status = 400;
      return;
    }

    const token : string | null = await checkCredential(data);
    if (token) {
      const refreshToken : string = await saveRefreshToken(data.login);
      ctx.response.body = {
        "accessToken": token,
      };
      setCookie(ctx.response.headers, {
        name: "jwt",
        value: refreshToken,
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge : 24 * 60 *60 * 1000
      });
    }
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      ctx.response.status = 401;
      ctx.response.body = "User not found";
    }
    if (err instanceof Deno.errors.PermissionDenied) {
      ctx.response.status = 403;
      ctx.response.body = "Wrong login or password";
    }
  }
};

export { loginUser };
