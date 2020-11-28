import { db } from "../utils/admin";
import * as express from "express";
import { logger } from "firebase-functions";
import e = require("express");

interface Part {
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
    if (!req.body.projectId || !req.body.name) {
      res.status(400).json({ error: "Empty field detected" });
    } else {
      const newPart: Part = {
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
    logger.log("Get All triggered");
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
    logger.log("Hello there", req.params);
    const part = await db.collection(`/parts`).doc(req.params.partId).get();
    if (part.data()) {
      const resPart = {
        partId: part.id,
        ...part.data(),
      };
      res.json(resPart);
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
    if (part.data()) {
      const newPart = {
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      await db
        .collection("/parts")
        .doc(req.params.partId)
        .set(newPart, { merge: true });
      res.json({ message: "Part's updated successfully" });
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
    await db.collection("parts").doc(req.params.partId).delete();
    res.status(204).send("Part's deleted successfully");
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
    if (part.data()) {
      const updatedPart = { ...part.data() };
      updatedPart.currentRow++;
      updatedPart.updatedAt = new Date().toISOString();
      await db
        .collection("/parts")
        .doc(req.params.partId)
        .set(updatedPart, { merge: true });
      res.json({ message: "Row's added successfully" });
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
