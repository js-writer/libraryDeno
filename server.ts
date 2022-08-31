import { Application } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import {router, publicRouter} from "./routes.ts";
import { auth } from './middleware/auth.ts';

const port = Deno.env.get("PORT") || 5000;

const app = new Application();

app.use(
    oakCors({
      origin: true,
      credentials: true
    }),
  );
app.use(publicRouter.routes());
app.use(auth, router.routes());
app.use(router.allowedMethods());

console.log(`Deno running on port ${port}`);

await app.listen({ port : +port });
