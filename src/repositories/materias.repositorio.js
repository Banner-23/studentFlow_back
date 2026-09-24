import { pool } from "../config/database.js";

const sortableFields = {
    id: "m.id_materia",
    nombre: "m.nombre",
    codigo: "m.codigo",
    creditos: "m.creditos",
    color: "m.color",
    activa: "m.activa",
    createdAt: "m.created_at",
    updatedAt: "m.updated_at"
};

function normalizeSort(sort, order) {
    const column = sortableFields[sort] || sortableFields.nombre;
    const direction =
        String(order).toLowerCase() === "desc" ? "DESC" : "ASC";

    return `${column} ${direction}`;
}

function mapMateria(row) {
    return {
        id: row.id,
        nombre: row.nombre,
        codigo: row.codigo,
        creditos: row.creditos,
        color: row.color,
        activa: row.activa,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    };
}

export async function findAllByUserId(userId, filters = {}) {
    const conditions = ["m.id_usuario = ?"];
    const params = [userId];

    if (typeof filters.activa === "boolean") {
        conditions.push("m.activa = ?");
        params.push(filters.activa ? 1 : 0);
    }

    if (filters.search) {
        conditions.push("(m.nombre LIKE ? OR m.codigo LIKE ?)");
        params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const [countRows] = await pool.execute(
        `SELECT COUNT(*) AS total
         FROM materia m
         WHERE ${conditions.join(" AND ")}`,
        params
    );

    const orderBy = normalizeSort(filters.sort, filters.order);
    const limit = filters.limit;
    const offset = (filters.page - 1) * limit;

    const [rows] = await pool.execute(
        `SELECT
            m.id_materia AS id,
            m.id_usuario AS usuarioId,
            m.nombre,
            m.codigo,
            m.color,
            m.creditos,
            m.activa,
            m.created_at AS createdAt,
            m.updated_at AS updatedAt
         FROM materia m
         WHERE ${conditions.join(" AND ")}
         ORDER BY ${orderBy}
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
    );

    return {
        materias: rows.map(mapMateria),
        total: countRows[0].total
    };
}

export async function findByIdAndUserId(id, userId) {
    const [rows] = await pool.execute(
        `SELECT
            m.id_materia AS id,
            m.id_usuario AS usuarioId,
            m.nombre,
            m.codigo,
            m.color,
            m.creditos,
            m.activa,
            m.created_at AS createdAt,
            m.updated_at AS updatedAt
         FROM materia m
         WHERE m.id_materia = ? AND m.id_usuario = ?`,
        [id, userId]
    );

    return rows[0] ? mapMateria(rows[0]) : null;
}

export async function existsByCode(userId, codigo, excludeId = null) {
    let query = `
        SELECT 1
        FROM materia
        WHERE id_usuario = ?
        AND codigo = ?
    `;

    const params = [userId, codigo];

    if (excludeId !== null && excludeId !== undefined) {
        query += ` AND id_materia <> ?`;
        params.push(excludeId);
    }

    query += ` LIMIT 1`;

    const [rows] = await pool.execute(query, params);

    return rows.length > 0;
}

export async function existsByName(userId, nombre, excludeId = null) {
    let query = `
        SELECT 1
        FROM materia
        WHERE id_usuario = ?
        AND nombre = ?
    `;

    const params = [userId, nombre];

    if (excludeId !== null && excludeId !== undefined) {
        query += ` AND id_materia <> ?`;
        params.push(excludeId);
    }

    query += ` LIMIT 1`;

    const [rows] = await pool.execute(query, params);

    return rows.length > 0;
}

export async function createMateria(userId, materia) {
    const [result] = await pool.execute(
        `INSERT INTO materia
            (id_usuario, nombre, codigo, creditos, color, activa)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            userId,
            materia.nombre,
            materia.codigo,
            materia.creditos,
            materia.color,
            materia.activa
        ]
    );

    return findByIdAndUserId(result.insertId, userId);
}

export async function replaceMateria(id, userId, materia) {
    const [result] = await pool.execute(
        `UPDATE materia
         SET
            nombre = ?,
            codigo = ?,
            creditos = ?,
            color = ?,
            activa = ?,
            updated_at = CURRENT_TIMESTAMP
         WHERE id_materia = ?
         AND id_usuario = ?`,
        [
            materia.nombre,
            materia.codigo,
            materia.creditos,
            materia.color,
            materia.activa,
            id,
            userId
        ]
    );

    if (result.affectedRows === 0) {
        return null;
    }

    return findByIdAndUserId(id, userId);
}

export async function updateMateria(id, userId, materia) {
    const fields = [];
    const values = [];

    if (materia.nombre !== undefined) {
        fields.push("nombre = ?");
        values.push(materia.nombre);
    }

    if (materia.codigo !== undefined) {
        fields.push("codigo = ?");
        values.push(materia.codigo);
    }

    if (materia.creditos !== undefined) {
        fields.push("creditos = ?");
        values.push(materia.creditos);
    }

    if (materia.color !== undefined) {
        fields.push("color = ?");
        values.push(materia.color);
    }

    if (materia.activa !== undefined) {
        fields.push("activa = ?");
        values.push(materia.activa);
    }

    if (fields.length === 0) {
        return findByIdAndUserId(id, userId);
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");

    values.push(id, userId);

    const [result] = await pool.execute(
        `UPDATE materia
         SET ${fields.join(", ")}
         WHERE id_materia = ?
         AND id_usuario = ?`,
        values
    );

    if (result.affectedRows === 0) {
        return null;
    }

    return findByIdAndUserId(id, userId);
}

export async function deleteMateria(id, userId) {
    const [result] = await pool.execute(
        `DELETE FROM materia
         WHERE id_materia = ?
         AND id_usuario = ?`,
        [id, userId]
    );

    return result.affectedRows > 0;
}