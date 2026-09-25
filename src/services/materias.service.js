import * as materiasRepository from "../repositories/materias.repositorio.js";
import { HttpError } from "../utils/http-error.js";

/**
 * Obtiene las materias registradas para un usuario específico.
 *
 * @async
 * @function listarMaterias
 * @param {string|number} userId - Identificador único del usuario.
 * @param {Object} [filters] - Filtros opcionales para consultar las materias.
 *
 * @returns {Promise<Object>} Objeto con las materias y la información de paginación.
 */

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

/**
 * Obtiene una materia específica perteneciente a un usuario.
 *
 * @async
 * @function getMateriaById
 * @param {string|number} id - Identificador único de la materia.
 * @param {string|number} userId - Identificador único del usuario dueño de la materia.
 *
 * @returns {Promise<Object>} Materia encontrada.
 *
 * @throws {HttpError} Código 404 (MATERIA_NOT_FOUND) si la materia no existe.
 */

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

/**
 * Crea una nueva materia para un usuario específico.
 *
 * @async
 * @function crearMateria
 * @param {string|number} userId - Identificador único del usuario dueño de la materia.
 * @param {Object} materia - Objeto que contiene los datos de la materia.
 *
 * @returns {Promise<Object>} Materia creada.
 *
 * @throws {HttpError} Código 409 (DUPLICATE_CODE) si el código ya está registrado.
 * @throws {HttpError} Código 409 (DUPLICATE_NAME) si el nombre ya está registrado.
 */

export async function createMateria(userId, materia) {
    await ensureUniqueFields(userId, materia);

    return materiasRepository.createMateria(userId, materia);
}

/**
 * Reemplaza los datos de una materia existente.
 *
 * @async
 * @function replaceMateria
 * @param {string|number} id - Identificador único de la materia.
 * @param {string|number} userId - Identificador único del usuario dueño de la materia.
 * @param {Object} materia - Objeto que contiene los nuevos datos de la materia.
 * @param {string} [materia.codigo] - Código identificador de la materia.
 * @param {string} [materia.nombre] - Nombre de la materia.
 *
 * @returns {Promise<Object>} Materia actualizada.
 *
 * @throws {HttpError} Código 404 (MATERIA_NOT_FOUND) si la materia no existe.
 * @throws {HttpError} Código 409 (DUPLICATE_CODE) si el código ya está registrado para el usuario.
 * @throws {HttpError} Código 409 (DUPLICATE_NAME) si el nombre ya está registrado para el usuario.
 */

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

/**
 * Actualiza parcialmente los datos de una materia existente.
 *
 * @async
 * @function updateMateria
 * @param {string|number} id - Identificador único de la materia.
 * @param {string|number} userId - Identificador único del usuario dueño de la materia.
 * @param {Object} materia - Objeto que contiene los datos que se desean actualizar.
 * @param {string} [materia.codigo] - Código identificador de la materia.
 * @param {string} [materia.nombre] - Nombre de la materia.
 *
 * @returns {Promise<Object>} Materia actualizada.
 *
 * @throws {HttpError} Código 404 (MATERIA_NOT_FOUND) si la materia no existe.
 * @throws {HttpError} Código 409 (DUPLICATE_CODE) si el código ya está registrado para el usuario.
 * @throws {HttpError} Código 409 (DUPLICATE_NAME) si el nombre ya está registrado para el usuario.
 */

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

/**
 * Elimina una materia perteneciente a un usuario específico.
 *
 * @async
 * @function deleteMateria
 * @param {string|number} id - Identificador único de la materia.
 * @param {string|number} userId - Identificador único del usuario dueño de la materia.
 *
 * @returns {Promise<Object>} Materia eliminada.
 *
 * @throws {HttpError} Código 404 (MATERIA_NOT_FOUND) si la materia no existe.
 */

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

/**
 * Valida que el código y el nombre de una materia sean únicos para un usuario específico.
 *
 * @async
 * @function ensureUniqueFields
 * @param {string|number} userId - Identificador único del usuario dueño de la materia.
 * @param {Object} materia - Objeto que contiene los datos de la materia a validar.
 * @param {string} [materia.codigo] - Código identificador de la materia (opcional).
 * @param {string} [materia.nombre] - Nombre de la materia (opcional).
 * @param {string|number} [excludeId] - ID de una materia existente a excluir de la validación (útil en actualizaciones).
 *
 * @returns {Promise} No retorna ningún valor si las validaciones son exitosas.
 *
 * @throws {HttpError} Código 409 (DUPLICATE_CODE) si el código ya está registrado para el usuario.
 * @throws {HttpError} Código 409 (DUPLICATE_NAME) si el nombre ya está registrado para el usuario.
 */

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

/**
 * Obtiene las tareas de una materia perteneciente a un usuario específico.
 *
 * @async
 * @function getTareasByMateriaId
 * @param {string|number} idMateria - Identificador único de la materia.
 * @param {string|number} userId - Identificador único del usuario dueño de la materia.
 *
 * @returns {Promise<Array>} Lista de tareas asociadas a la materia.
 */
export async function getTareasByMateriaId(idMateria, userId) {
    return materiasRepository.getTareasByMateriaId(idMateria, userId);
}