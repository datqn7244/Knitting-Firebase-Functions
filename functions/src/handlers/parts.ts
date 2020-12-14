import { db } from "../utils/admin";
import * as express from "express";
import { logger } from "firebase-functions";
import e = require("express");

interface Part {
  user: string;
  projectId: string;
  name: string;
  previous?: string;
  next?: string;
  description?: string;
  row?: number;
  currentRow: number;
  currentRowStitches?: number;
  createdAt: string;
  updatedAt?: string;
}
const createPart = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
    if (!req.body.name) {
      res.status(400).json({ error: "Empty field detected" });
    } else {
      const project = await db
        .collection(`/projects`)
        .doc(req.params.projectId)
        .get();
      if (project.exists) {
        const resProject = {
          projectId: project.id,
          ...project.data(),
        };
        if ((<any>resProject).user === (<any>req).user.email) {
          const newPart: Part = {
            user: (<any>req).user.email,
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
          res.json(resPart);
        } else {
          res.status(404).json({ error: "Project's not found" });
        }
      } else {
        res.status(404).json({ error: "Project's not found" });
      }
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json(error);
  }
};

const getAllParts = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
    // logger.log("Get All triggered");
    const project = await db
      .collection(`/projects`)
      .doc(req.params.projectId)
      .get();
    if (project.exists) {
      const resProject = {
        projectId: project.id,
        ...project.data(),
      };
      if ((<any>resProject).user === (<any>req).user.email) {
        const parts = await db
          .collection("parts")
          .where("projectId", "==", req.params.projectId)
          .get();
        const partsList: Object[] = [];
        parts.forEach((part) => {
          partsList.push({
            partId: part.id,
            ...part.data(),
          });
        });
        res.json(partsList);
      } else {
        res.status(404).json({ error: "Project's not found" });
      }
    } else {
      res.status(404).json({ error: "Project's not found" });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.code });
  }
};

const getPart = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
    const part = await db.collection(`/parts`).doc(req.params.partId).get();
    if (part.exists) {
      const resPart = {
        partId: part.id,
        ...part.data(),
      };
      // logger.log("Hello there", resPart);
      if ((<any>resPart).user === (<any>req).user.email) {
        res.json(resPart);
      } else {
        res.status(404).json({ error: "Part's not found" });
      }
    } else {
      res.status(404).json({ error: "Part's not found" });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.code });
  }
};

const updatePart = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
    const part = await db.collection(`/parts`).doc(req.params.partId).get();
    if (part.exists) {
      const oldPart = {
        ...part.data(),
      };
      const newPart = {
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      if ((<any>oldPart).user === (<any>req).user.email) {
        await db
          .collection("/parts")
          .doc(req.params.partId)
          .set(newPart, { merge: true });
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Part's not found" });
      }
    } else {
      res.status(404).json({ error: "Part's not found" });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.code });
  }
};

const deletePart = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
    const part = await db.collection(`/parts`).doc(req.params.partId).get();
    if (part.exists) {
      const oldPart = {
        ...part.data(),
      };
      if ((<any>oldPart).user === (<any>req).user.email) {
        await db.collection("parts").doc(req.params.partId).delete();
        res.status(200).send();
      } else {
        res.status(404).json({ error: "Part's not found" });
      }
    } else {
      res.status(404).json({ error: "Part's not found" });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.code });
  }
};

const changeCurrentRow = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
    const part = await db.collection("/parts").doc(req.params.partId).get();
    if (part.exists) {
      const updatedPart = { ...part.data() };
      updatedPart.currentRow++;
      updatedPart.updatedAt = new Date().toISOString();
      if ((<any>updatedPart).user === (<any>req).user.email) {
        await db
          .collection("/parts")
          .doc(req.params.partId)
          .set(updatedPart, { merge: true });
        res.json({ message: "Row's added successfully" });
      } else {
        res.status(404).json({ error: "Part's not found" });
      }
    } else {
      res.status(404).json({ error: "Part's not found" });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json(error);
  }
};
export {
  createPart,
  getAllParts,
  getPart,
  updatePart,
  deletePart,
  changeCurrentRow,
};
