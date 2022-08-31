import { credentials } from "../config.ts";
import {
  create,
  getNumericDate,
  Payload,
  verify
} from "https://deno.land/x/djwt@v2.7/mod.ts";
import type { Header as JWTHeader } from "https://deno.land/x/djwt@v2.7/mod.ts";

const jwtKey : CryptoKey = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(credentials.jwtSecret),
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);

const jwtRefreshKey:CryptoKey = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(credentials.jwtRefreshSecret),
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);

const header: JWTHeader = {
  alg: "HS512",
  typ: "JWT",
};

const getHash = async (src: string) : Promise<string> => {
  const strBytes = new TextEncoder().encode(src);
  const rawHash = await crypto.subtle.digest("SHA-1", strBytes);
  const bufArr = new Uint8Array(rawHash);
  const hexString = Array.from(bufArr).map((b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
  return hexString;
};

const createToken = async (login: string, key: CryptoKey, time: number) : Promise<string> => {
  const payload : Payload = {
    exp: getNumericDate(time),
    login,
  };
  return await create(header, payload, key);
};

const getToken = async (login: string): Promise<string> => {
  return await createToken(login, jwtKey, 900);
};

const getRefreshToken = async (login: string): Promise<string> => {
  return await createToken(login, jwtRefreshKey, 604800);
};

const validateToken = async (token: string, refresh?: boolean) : Promise<string | undefined> => {
  try {
    const payload : Payload = await verify(token, refresh? jwtRefreshKey :jwtKey);
    if (!payload) {
      return;
    }
    return payload.login as string;
  } catch (err) {
    throw err;
  }
};

export { getHash, getToken, validateToken, getRefreshToken };
