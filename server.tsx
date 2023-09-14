/** @jsx jsx */
import { Hono } from "https://deno.land/x/hono@v3.5.6/mod.ts";
import { jsx } from "https://deno.land/x/hono@v3.5.6/middleware.ts";

interface Todo {
  text: string;
}

const kv = await Deno.openKv();

// Connect to a Deno Deploy KV database
// const dbId = "7dd0d727-3fb0-4c06-84ff-a7062921f940";
// const dbUrl = `https://api.deno.com/databases/${dbId}/connect`;
// const kv = await Deno.openKv(dbUrl);

const app = new Hono();

app.get("/", async (c) => {
  const iter = await kv.list<Todo>({ prefix: ["todos"] });
  const todos = [];
  for await (const res of iter) todos.push(res.value);

  return c.html(
    <html>
      <head>
        <title>Deno KV TODOs</title>
      </head>
      <body>
        <main style={{ maxWidth: 600, margin: "0 auto" }}>
          <h1>TODO List</h1>
          <form action="/todo" method="POST">
            <input type="text" name="todo" required></input>
            <button type="submit" style={{ margin: "5px" }}>
              Add TODO
            </button>
          </form>

          {todos.map((todo) => (
            <div style={{ margin: "10px 0" }}>
              <form
                style={{ display: "inline", marginRight: "10px" }}
                action="/todo/delete"
                method="POST"
              >
                <input type="hidden" name="todo" value={todo.text}></input>
                <button type="submit">X</button>
              </form>
              <span>{todo.text}</span>
            </div>
          ))}
        </main>
      </body>
    </html>,
  );
});

app.post("/todo", async (c) => {
  const body = await c.req.parseBody<{ todo: string }>();
  const todo: Todo = {
    text: body.todo,
  };

  await kv.set(["todos", todo.text], todo);

  return c.redirect("/", 303);
});

app.post("/todo/delete", async (c) => {
  const body = await c.req.parseBody<{ todo: string }>();

  await kv.delete(["todos", body.todo]);

  return c.redirect("/", 303);
});

Deno.serve(app.fetch);
