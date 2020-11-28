import * as functions from "firebase-functions";
import * as express from "express";
import * as cors from "cors";
import * as project from "./handlers/projects";
import * as part from "./handlers/parts";

const app = express();
app.use(cors({ origin: true }));

// Routes
// Project Related route
// Create
app.post("/projects", project.createProject);
// Get All
app.get("/projects", project.getAllProjects);
// Get one
app.get("/projects/:projectId", project.getOneProject);

// Update
app.put("/projects/:projectId", project.updateProject);
// Delete
app.delete("/projects/:projectId", project.deleteProject);

// Part Related Route
// Create
app.post("/projects/:projectId/parts", part.createPart);
// Get All
app.get("/projects/:projectId/parts", part.getAllParts);
// Get one
app.get("/parts/:partId", part.getPart);

// Update
app.put("/parts/:partId", part.updatePart);
// Delete
app.delete("/parts/:partId", part.deletePart);
// Change current row
app.get("/parts/:partId/increaseCurrent", part.changeCurrentRow);
// Export API to Firebase
export const knitting = functions.https.onRequest(app);
