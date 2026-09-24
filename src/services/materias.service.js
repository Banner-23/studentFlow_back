import * as materiasRepository from "../repositories/materias.repositorio.js";
import { HttpError } from "../utils/http-error.js";

export async function listMaterias(userId, filters) {
    const { materias, total } =
        await materiasRepository.findAllByUserId(userId, filters);

    return {
        data: materias,
        meta: {
            page: filters.page,
            limit: filters.limit,
            total,
            pages: Math.ceil(total / filters.limit)
        }
    };
}

export async function getMateriaById(id, userId) {
    const materia =
        await materiasRepository.findByIdAndUserId(id, userId);

    if (!materia) {
        throw new HttpError(
            404,
            "MATERIA_NOT_FOUND",
            "La materia no fue encontrada"
        );
    }

    return materia;
}

export async function createMateria(userId, materia) {
    await ensureUniqueFields(userId, materia);

    return materiasRepository.createMateria(userId, materia);
}

export async function replaceMateria(id, userId, materia) {
    // Verificar que la materia exista
    await getMateriaById(id, userId);

    // Verificar que no se repitan código ni nombre
    await ensureUniqueFields(userId, materia, id);

    const updatedMateria =
        await materiasRepository.replaceMateria(id, userId, materia);

    if (!updatedMateria) {
        throw new HttpError(
            404,
            "MATERIA_NOT_FOUND",
            "La materia no fue encontrada"
        );
    }

    return updatedMateria;
}

export async function updateMateria(id, userId, materia) {
    // Verificar que la materia exista
    await getMateriaById(id, userId);

    // Verificar únicamente los campos que vienen en el PATCH
    await ensureUniqueFields(userId, materia, id);

    const updatedMateria =
        await materiasRepository.updateMateria(id, userId, materia);

    if (!updatedMateria) {
        throw new HttpError(
            404,
            "MATERIA_NOT_FOUND",
            "La materia no fue encontrada"
        );
    }

    return updatedMateria;
}

export async function deleteMateria(id, userId) {
    // Verificar que exista antes de eliminar
    await getMateriaById(id, userId);

    const deleted =
        await materiasRepository.deleteMateria(id, userId);

    if (!deleted) {
        throw new HttpError(
            404,
            "MATERIA_NOT_FOUND",
            "La materia no fue encontrada"
        );
    }

    return;
}

async function ensureUniqueFields(userId, materia, excludeId) {
    if (materia.codigo) {
        const duplicatedCode =
            await materiasRepository.existsByCode(
                userId,
                materia.codigo,
                excludeId
            );

        if (duplicatedCode) {
            throw new HttpError(
                409,
                "DUPLICATE_CODE",
                "Ya existe una materia con ese codigo."
            );
        }
    }

    if (materia.nombre) {
        const duplicatedName =
            await materiasRepository.existsByName(
                userId,
                materia.nombre,
                excludeId
            );

        if (duplicatedName) {
            throw new HttpError(
                409,
                "DUPLICATE_NAME",
                "Ya existe una materia con ese nombre."
            );
        }
    }
}