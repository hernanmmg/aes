import { renderToString } from "react-dom/server";
import { runQuery, Params } from "./todos";

const server = Bun.serve({
  port: 8080,
  hostname: "localhost",
  fetch: handler
});

async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname === '' || url.pathname === '/')
    return new Response(Bun.file("./src/index.html"))

  if (url.pathname === '/todos' && request.method === 'POST') {
    const form: {company: string, application: string} = await request.json();
    if (!form.company.length && !form.application.length) return new Response('Invalid input', { status: 500 })
    
    const params: Params = {
      empresa: form.company,
      aplicacion: form.application
    }
    const queryResult = await runQuery(params);
    const accesskey: string = queryResult.accessKey[0][0];
    const matriz: any[][] = queryResult.matriz;

    const datos: any[] = matriz.map((todo) => {
      const array = [
        ...todo,
        accesskey,
      ];
      return array;
    });
    
    return new Response(JSON.stringify(datos));
    /*return new Response(
      renderToString(<TodoList todos={matriz} accesskey={"a"} />)
    );*/
  }

  /*if (request.method === "GET" && url.pathname === "/todos") {
    const todos:any[] = [];
    const accesskey: string = "";
    

    return new Response(
      renderToString(<TodoList todos={todos} accesskey={accesskey}/>)
    );
  }*/
  
  return new Response("NotFound", { status: 404 });
}

Bun.write(
  Bun.stdout,
  `Server is listening on http://${server.hostname}:${server.port}\n\n`
)


function TodoList(props: { todos: any[], accesskey: string }) {
  if (!props.todos) {
    return <ul>No items added</ul>
  }

  return <></>
}
