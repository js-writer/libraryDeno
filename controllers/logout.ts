import {
  getCookies,
  setCookie,
} from "https://deno.land/std@0.151.0/http/cookie.ts";
import { Context } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { validateToken } from "../utils/token.ts";
import { deleteRefreshTokenFromDB, getUser } from "../services/loginService.ts";
import { UserProfile } from "../types.ts";

const deleteHttpOnlyCookie = (ctx: Context): void => {
  setCookie(ctx.response.headers, {
    name: "jwt",
    value: "",
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
};

const logoutUser = async (ctx: Context) : Promise<204 | 401 | undefined> => {
  const cookies : Record<string, string> = getCookies(ctx.request.headers);

  if (!cookies.jwt) {
    return ctx.response.status = 204;
  }
  const refreshToken : string = cookies.jwt;

  try {
    const login: string | undefined = await validateToken(refreshToken, true);

    if (!login) {
      deleteHttpOnlyCookie(ctx);
      return ctx.response.status = 204;
    }
    const user : UserProfile | undefined = await getUser(login);

    if (user?.refresh_token !== refreshToken) {
      deleteHttpOnlyCookie(ctx);
      return ctx.response.status = 204;
    }

    await deleteRefreshTokenFromDB(login);
    deleteHttpOnlyCookie(ctx);
    return ctx.response.status = 204;
  } catch (err) {
    if (err instanceof RangeError) {
      return ctx.response.status = 401;
    }
  }
};

export { logoutUser };
