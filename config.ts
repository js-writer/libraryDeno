const credentials = {
    user: Deno.env.get("PGUSER"),
    password: Deno.env.get("PGPASSWORD"),
    database: Deno.env.get("PGDATABASE"),
    hostname: Deno.env.get("PGHOST"),
    port: Deno.env.get("PGPORT"),
    jwtSecret: Deno.env.get("ACCESS_TOKEN"),
    jwtRefreshSecret: Deno.env.get("REFRESH_TOKEN")
}

export { credentials }