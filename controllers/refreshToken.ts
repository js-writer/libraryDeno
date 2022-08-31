import { getCookies } from "https://deno.land/std@0.151.0/http/cookie.ts";
import { Context } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { validateToken, getToken } from "../utils/token.ts";
import { getUser } from "../services/loginService.ts";
import { UserProfile } from "../types.ts";

const refreshAccessToken = async (ctx: Context) => {
  const cookies : Record<string, string> = getCookies(ctx.request.headers);

  if (!cookies.jwt) {
    return ctx.response.status = 401;
  }
  const refreshToken = cookies.jwt;

  try {  
    const login : string | undefined = await validateToken(refreshToken, true);
    if (!login) {
      return ctx.response.status = 401;
    }

    const user: UserProfile | undefined = await getUser(login);
    
    if (user?.refresh_token !== refreshToken) {
      return ctx.response.status = 401;
    }

    const newAccessToken : string = await getToken(login);
    
    ctx.response.status = 200;
    ctx.response.body = {
      token: newAccessToken,
    };
  } catch (err) {
      return ctx.response.status = 401;
  }
};

export { refreshAccessToken };
