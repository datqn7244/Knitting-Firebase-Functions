import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import * as serviceAccount from "./knitting-development.json";

admin.initializeApp({
  credential: admin.credential.cert(<any>serviceAccount),
  databaseURL: "https://knitting-development.firebaseio.com",
});

const app = express();
app.use(cors({ origin: true }));
const db = admin.firestore();

// Routes
app.get("/hello-world", (req: express.Request, res: express.Response) => {
  return res.status(200).send("Hello World!");
});
// Project Related route
// Create
app.post("/projects", async (req: express.Request, res: express.Response) => {
  try {
    const newProject = {
      user: req.body.user,
      name: req.body.name,
      description: req.body.description,
      yarnName: req.body.yarnName,
      yarnSize: req.body.yarnSize,
      needleSize: req.body.needleSize,
      createdAt: new Date().toISOString(),
    };
    const document = await db.collection("projects").add(newProject);
    functions.logger.log(document);

    const resProject = { ...newProject, projectId: document.id };
    return res.json(resProject);
  } catch (error) {
    functions.logger.error(error);
    return res.status(500).json(error);
  }
});
// Get All
app.get("/projects", async (req: express.Request, res: express.Response) => {
  try {
    const projects = await db
      .collection("projects")
      .orderBy("createdAt", "desc")
      .get();
    const projectsList: Object[] = [];
    projects.forEach((project) => {
      projectsList.push({
        projectId: project.id,
        ...project.data(),
      });
    });
    return res.json(projectsList);
  } catch (error) {
    return res.status(500).json({ error: error.code });
  }
});
// Get one
app.get(
  "/projects/:projectId",
  async (req: express.Request, res: express.Response) => {
    try {
      const project = await db
        .collection(`/projects`)
        .doc(req.params.projectId)
        .get();
      const resProject = {
        projectId: project.id,
        ...project.data(),
      };
      return res.json(resProject);
    } catch (error) {
      return res.status(500).json({ error: error.code });
    }
  }
);

// Update
app.put(
  "/projects/:projectId",
  async (req: express.Request, res: express.Response) => {
    try {
      const newProject = {
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      const updateProject = await db
        .collection("/projects")
        .doc(req.params.projectId)
        .set(newProject, { merge: true });
      return res.json({ message: "Project's updated successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.code });
    }
  }
);
// Delete
app.delete(
  "/projects/:projectId",
  async (req: express.Request, res: express.Response) => {
    try {
      const deleteProject = await db
        .collection("projects")
        .doc(req.params.projectId)
        .delete();
      return res.status(204).send("Project's deleted successfully");
    } catch (error) {
      return res.status(500).json({ error: error.code });
    }
  }
);

// Part Related Route
// Create
app.post(
  "/projects/:projectId/parts",
  async (req: express.Request, res: express.Response) => {
    try {
      const newPart = {
        projectId: req.params.projectId,
        name: req.body.name,
        previous: req.body.previous,
        next: req.body.next,
        description: req.body.description,
        row: req.body.row,
        currentRow: req.body.currentRow,
        currentRowStitches: req.body.currentRowStitches,
        createdAt: new Date().toISOString(),
      };
      const addedPart = await db.collection("parts").add(newPart);

      const resPart = { ...newPart, partId: addedPart.id };
      return res.json(resPart);
    } catch (error) {
      functions.logger.error(error);
      return res.status(500).json(error);
    }
  }
);
// Get All
app.get(
  "/projects/:projectId/parts",
  async (req: express.Request, res: express.Response) => {
    try {
      const parts = await db
        .collection("parts")
        // .orderBy("createdAt", "desc")
        .where("projectId", "==", req.params.projectId)
        .get();
      const partsList: Object[] = [];
      parts.forEach((part) => {
        partsList.push({
          partId: part.id,
          ...part.data(),
        });
      });
      functions.logger.log(parts);

      return res.json(partsList);
    } catch (error) {
      functions.logger.error(error);

      return res.status(500).json({ error: error.code });
    }
  }
);
// Get one
app.get(
  "/parts/:partId",
  async (req: express.Request, res: express.Response) => {
    try {
      const part = await db.collection(`/parts`).doc(req.params.partId).get();
      const resPart = {
        partId: part.id,
        ...part.data(),
      };
      return res.json(resPart);
    } catch (error) {
      return res.status(500).json({ error: error.code });
    }
  }
);

// Update
app.put(
  "/parts/:partId",
  async (req: express.Request, res: express.Response) => {
    try {
      const newPart = {
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      const updatePart = await db
        .collection("/parts")
        .doc(req.params.partId)
        .set(newPart, { merge: true });
      return res.json({ message: "Part's updated successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.code });
    }
  }
);
// Delete
app.delete(
  "/parts/:partId",
  async (req: express.Request, res: express.Response) => {
    try {
      const deletePart = await db
        .collection("parts")
        .doc(req.params.partId)
        .delete();
      return res.status(204).send("Part's deleted successfully");
    } catch (error) {
      return res.status(500).json({ error: error.code });
    }
  }
);
// Change current row
app.get(
  "/parts/:partId/increaseCurrent",
  async (req: express.Request, res: express.Response) => {
    try {
      const parts = await db.collection("/parts").doc(req.params.partId).get();
      const updatedPart = { ...parts.data() };
      updatedPart.currentRow++;
      updatedPart.updatedAt = new Date().toISOString();
      const updatePart = await db
        .collection("/parts")
        .doc(req.params.partId)
        .set(updatedPart, { merge: true });
      return res.json({ message: "Row's added successfully" });
    } catch (error) {
      functions.logger.error(error);
      return res.status(500).json(error);
    }
  }
);
// Export API to Firebase
export const knitting = functions.https.onRequest(app);
