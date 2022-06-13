const express = require("express");
const multer = require("multer");

const {
  getMedications,
  deleteMedications,
  createMedication,
  updateMedication,
  getMedicationById,
} = require("../controllers/medicationsControllers");
const firebase = require("../server/middlewares/firebase/firebase");

const upload = multer({ dest: "images/" });
const medicationsRouter = express.Router();

medicationsRouter.get("/", getMedications);
medicationsRouter.get("/:id", getMedicationById);

medicationsRouter.delete("/:id", deleteMedications);

medicationsRouter.post(
  "/create",
  upload.single("image"),
  firebase,
  createMedication
);
medicationsRouter.put(
  "/update/:id",
  upload.single("image"),
  firebase,
  updateMedication
);

module.exports = medicationsRouter;
