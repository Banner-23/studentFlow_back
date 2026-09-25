import { Router } from "express";

import {
    listMaterias,
    getMaterias,
    createMateria,
    replaceMateria,
    updateMateria,
    deleteMateria,
    getTareasByMateriaId
} from "../controllers/materias.controller.js";

const router = Router();

//http://localhost:3000/api/v1/materias
router.get("/", listMaterias);
router.get("/:id", getMaterias);
router.post("/", createMateria);
router.put("/:id", replaceMateria);
router.patch("/:id", updateMateria);
router.delete("/:id", deleteMateria);
router.get("/:id/tareas", getTareasByMateriaId);

export default router;