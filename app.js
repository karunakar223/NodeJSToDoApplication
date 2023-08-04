const express = require("express");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;
app.use(express.json());

const todoObjects = (todoObj) => {
  return {
    id: todoObj.id,
    todo: todoObj.todo,
    priority: todoObj.priority,
    status: todoObj.status,
  };
};

const priorityAndStatusObjects = (priorAndStatObj) => {
  return (
    priorAndStatObj.priority !== undefined &&
    priorAndStatObj.status !== undefined
  );
};

const priorityObject = (priorObj) => {
  return priorObj.priority !== undefined;
};

const statusObject = (statObj) => {
  return statObj.status !== undefined;
};

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3003, () => {
      console.log("Server running at http://localhost:3003");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1
app.get("/todos/", async (req, res) => {
  let applyQuery = "";
  const { search_q = "", priority, status } = req.query;
  let data = null;

  switch (true) {
    case priorityAndStatusObjects(req.query):
      applyQuery = `
            SELECT * FROM todo 
            WHERE
            todo LIKE '%${search_q}%' AND 
            status = '${status}' AND
            priority = '${priority}';
            `;
      break;
    case priorityObject(req.query):
      applyQuery = `
            SELECT * FROM todo 
            WHERE
            todo LIKE '%${search_q}%' AND 
            priority = '${priority}';
            `;
      break;
    case statusObject(req.query):
      applyQuery = `
            SELECT * FROM todo 
            WHERE
            todo LIKE '%${search_q}%' AND 
            status = '${status}';
            `;
      break;

    default:
      applyQuery = `
                SELECT 
                * 
                FROM 
                todo 
                WHERE 
                todo LIKE '%${search_q}%';
            `;
      break;
  }

  data = await db.all(applyQuery);
  res.send(data.map((eachTodo) => todoObjects(eachTodo)));
});

//API 2
app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const getTodosQuery = `
        SELECT * FROM 
        todo 
        WHERE 
        id = ${todoId};
    `;
  const todos = await db.get(getTodosQuery);
  res.send(todoObjects(todos));
});

//API 3
app.post("/todos/", async (req, res) => {
  const todosDetails = req.body;
  const { id, todo, priority, status } = todosDetails;
  const createTodoQuery = `
        INSERT INTO 
        todo (id, todo, priority, status)
        VALUES
        (
            ${id},'${todo}','${priority}','${status}'
        );
    `;
  await db.run(createTodoQuery);
  res.send("Todo Successfully Added");
});

//API 4
app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  let updateVal = "";
  const todoDetails = req.body;
  switch (true) {
    case todoDetails.status !== undefined:
      updateVal = "Status";
      break;
    case todoDetails.priority !== undefined:
      updateVal = "Priority";
      break;
    case todoDetails.todo !== undefined:
      updateVal = "Todo";
      break;
    default:
      break;
  }

  const getQuery = `
        SELECT 
        * 
        FROM 
        todo
        WHERE 
        id = ${todoId};
    `;

  const beforeQuery = await db.get(getQuery);

  const {
    todo = beforeQuery.todo,
    priority = beforeQuery.priority,
    status = beforeQuery.status,
  } = req.body;

  const updateTodoQuery = `
    UPDATE 
        todo 
    SET
       todo = '${todo}',
       priority = '${priority}',
       status = '${status}'
    WHERE 
         id = ${todoId};

`;
  await db.run(updateTodoQuery);
  res.send(`${updateVal} Updated`);
});

//API 5
app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const deleteTodoQuery = `
        SELECT 
        * 
        FROM 
        todo 
        WHERE
        id = ${todoId};
    `;
  await db.run(deleteTodoQuery);
  res.send("Todo Deleted");
});

module.exports = app;
