import { LoginData, UserProfile } from "../types.ts";
import { Client } from "https://deno.land/x/postgres@v0.16.1/mod.ts";
import { credentials } from "../config.ts";
import { getHash, getToken, getRefreshToken } from "../utils/token.ts";
import { QueryObjectResult } from "https://deno.land/x/postgres@v0.16.1/query/query.ts";

const client = new Client(credentials);
await client.connect();

const checkCredential = async (loginData: LoginData) => {
  await client.connect();
  const user = await getUser(loginData.login);

  const passwordHash = await getHash(loginData.password);

  if (passwordHash !== user?.password) {
    throw new Deno.errors.PermissionDenied();
  }

  const token = await getToken(loginData.login);
  
  return token;
};

const getUser = async (login: string) : Promise<UserProfile | undefined> => {
  const result : QueryObjectResult<UserProfile> = await client.queryObject<UserProfile>`SELECT * FROM users WHERE login = ${login}`;
  if (result && result.rows && result.rows.length > 0) {
    return result.rows[0];
  }
};

const saveRefreshToken = async (login: string) : Promise<string>  => {
    const token : string = await getRefreshToken(login);
    await client.queryObject`UPDATE users SET refresh_token = ${token} WHERE login = ${login}`;
    return token;
}

const deleteRefreshTokenFromDB = async (login: string) =>  {
    return await client.queryObject`UPDATE users SET refresh_token = null WHERE login = ${login}`;
}

export { checkCredential, getUser, saveRefreshToken, deleteRefreshTokenFromDB };
