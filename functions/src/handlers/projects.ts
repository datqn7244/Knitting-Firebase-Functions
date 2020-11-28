import { db } from "../utils/admin";
import * as express from "express";
import { logger } from "firebase-functions";

interface Project {
  user: string;
  name: string;
  description?: string;
  yarnName?: string;
  yarnSize?: number;
  needleSize?: number;
  createdAt: string;
  updatedAt?: string;
}
// TODO: Authentication
const createProject = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
    if (!req.body.user || !req.body.name) {
      res.status(400).json({ error: "Empty field detected" });
    } else {
      const newProject: Project = {
        user: req.body.user,
        name: req.body.name,
        description: req.body.description,
        yarnName: req.body.yarnName,
        yarnSize: req.body.yarnSize,
        needleSize: req.body.needleSize,
        createdAt: new Date().toISOString(),
      };
      const document = await db.collection("projects").add(newProject);

      const resProject = { ...newProject, projectId: document.id };
      res.json(resProject);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json(error);
  }
};

const getAllProjects = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
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
    res.json(projectsList);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.code });
  }
};

const getOneProject = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
    const project = await db
      .collection(`/projects`)
      .doc(req.params.projectId)
      .get();
    if (project.data()) {
      const resProject = {
        projectId: project.id,
        ...project.data(),
      };
      res.json(resProject);
    } else {
      res.status(404).json({ error: "Project's not found" });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.code });
  }
};

const updateProject = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
    const project = await db
      .collection(`/projects`)
      .doc(req.params.projectId)
      .get();
    if (project.data()) {
      const newProject = {
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      await db
        .collection("/projects")
        .doc(req.params.projectId)
        .set(newProject, { merge: true });
      res.json({ message: "Project's updated successfully" });
    } else {
      res.status(404).json({ error: "Project's not found" });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.code });
  }
};

const deleteProject = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
    const project = await db
      .collection(`/projects`)
      .doc(req.params.projectId)
      .get();
    if (project.data()) {
      await db.collection("projects").doc(req.params.projectId).delete();
      res.status(204);
    } else {
      res.status(404).json({ message: "Project's not found" });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.code });
  }
};
export {
  createProject,
  getAllProjects,
  getOneProject,
  updateProject,
  deleteProject,
};
