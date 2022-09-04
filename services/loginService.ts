import { LoginData, UserProfile } from "../types.ts";
import { Client } from "https://deno.land/x/postgres@v0.16.1/mod.ts";
import { credentials } from "../config.ts";
import { getHash, getRefreshToken, getToken } from "../utils/token.ts";
import { QueryObjectResult } from "https://deno.land/x/postgres@v0.16.1/query/query.ts";

const client = new Client(credentials);

const checkCredential = async (loginData: LoginData) => {
  try {
    await client.connect();
    const user = await getUser(loginData.login);
    const passwordHash = await getHash(loginData.password);

    if (passwordHash !== user?.password) {
      throw new Deno.errors.PermissionDenied();
    }

    const token = await getToken(loginData.login);

    return token;
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
};

const getUser = async (login: string): Promise<UserProfile | undefined> => {
  try {
    await client.connect();
    const result: QueryObjectResult<UserProfile> = await client.queryObject<
      UserProfile
    >`SELECT * FROM users WHERE login = ${login}`;
    if (result && result.rows && result.rows.length > 0) {
      return result.rows[0];
    }
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
};

const saveRefreshToken = async (login: string): Promise<string> => {
  try {
    await client.connect();
    const token: string = await getRefreshToken(login);
    await client
      .queryObject`UPDATE users SET refresh_token = ${token} WHERE login = ${login}`;
    return token;
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
};

const deleteRefreshTokenFromDB = async (login: string) => {
  try {
    await client.connect();
    return await client
      .queryObject`UPDATE users SET refresh_token = null WHERE login = ${login}`;
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
};

export { checkCredential, deleteRefreshTokenFromDB, getUser, saveRefreshToken };
