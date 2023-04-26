import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRouthPath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRouthPath("/tasks"),
    handler: (request, response) => {
      const { search } = request.query;
      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );

      return response.end(JSON.stringify(tasks));
    },
  },
  {
    method: "GET",
    path: buildRouthPath("/tasks/:id"),
    handler: (request, response) => {
      const { id } = request.params;

      const task = database.selectById("tasks", id);

      if (task) {
        return response.end(JSON.stringify(task));
      } else {
        return response.writeHead(404).end(JSON.stringify("Task not found."));
      }
    },
  },
  {
    method: "POST",
    path: buildRouthPath("/tasks"),
    handler: (request, response) => {
      const { title, description } = request.body;

      if (!title || !description) {
        return response
          .writeHead(400)
          .end(
            JSON.stringify(
              "Title and description are required to create a task."
            )
          );
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: null,
      };

      database.insert("tasks", task);

      return response.writeHead(201).end();
    },
  },
  {
    method: "PUT",
    path: buildRouthPath("/tasks/:id"),
    handler: (request, response) => {
      const { id } = request.params;
      const { body } = request;
      const task = database.selectById("tasks", id);

      if (task) {
        if (body) {
          const { title, description } = body;

          if (title && description) {
            database.update("tasks", id, {
              title,
              description,
            });
          }
          if (title && !description) {
            database.update("tasks", id, {
              title,
            });
          }
          if (!title && description) {
            database.update("tasks", id, {
              description,
            });
          }
          return response.writeHead(204).end();
        } else {
          return response
            .writeHead(400)
            .end(
              JSON.stringify(
                "Enter at least one item to be updated in the task."
              )
            );
        }
      }
      return response.writeHead(404).end(JSON.stringify("Task not found."));
    },
  },
  {
    method: "DELETE",
    path: buildRouthPath("/tasks/:id"),
    handler: (request, response) => {
      const { id } = request.params;
      const task = database.selectById("tasks", id);

      if (task) {
        database.delete("tasks", id);
        return response.writeHead(204).end();
      }

      return response.writeHead(404).end(JSON.stringify("Task not found."));
    },
  },
  {
    method: "PATCH",
    path: buildRouthPath("/tasks/:id/complete"),
    handler: (request, response) => {
      const { id } = request.params;
      const task = database.selectById("tasks", id);

      if (task) {
        database.updateCompletedAt("tasks", id);
        return response.writeHead(204).end();
      }

      return response.writeHead(404).end(JSON.stringify("Task not found."));
    },
  },
];
