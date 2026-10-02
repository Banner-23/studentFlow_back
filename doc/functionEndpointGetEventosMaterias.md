# Endpoint GET de eventos por materia

## Objetivo

Agregar el endpoint `GET /api/v1/materias/:id/eventos` al backend de
`studentFlow_back` para consultar los eventos de una materia que
pertenece al usuario de la solicitud.

-   `id`: identificador de materia recibido en `request.params.id`.
-   `userId`: identificador del usuario obtenido de `request.user.id`.
-   Respuesta: HTTP 200 con `{ "success": true, "data": [...] }`.
-   Si la consulta no encuentra coincidencias, `data` será `[]`.

Se reutiliza la estructura existente del backend y se adicionan las
funciones necesarias para conectar la ruta, el controlador, el servicio
y el repositorio.

------------------------------------------------------------------------

## Archivos modificados

Se modifican cuatro partes del backend:

1.  `src/routes/materias.routes.js`
2.  `src/controllers/materias.controller.js`
3.  `src/services/materias.service.js`
4.  `src/repositories/materias.repositorio.js`

Los fragmentos siguientes se adicionan al código existente; no
reemplazan las funciones actuales.

------------------------------------------------------------------------

## 1. `src/routes/materias.routes.js`

### Función a adicionar o modificar

Se adiciona `listEventosByMateria` a la importación existente del
controlador.

``` js
import {
    listMaterias,
    getMaterias,
    createMateria,
    replaceMateria,
    updateMateria,
    deleteMateria,
    getTareasByMateriaId,
    listEventosByMateria
} from "../controllers/materias.controller.js";
```

### Registro de la nueva ruta

Se adiciona la siguiente ruta:

``` js
router.get("/:id/eventos", listEventosByMateria);
```

La ruta de tareas existente se mantiene:

``` js
router.get("/:id/tareas", getTareasByMateriaId);
```

El endpoint completo queda:

``` text
GET /api/v1/materias/:id/eventos
```

`app.js` ya monta este router bajo `/api/v1/materias`.

------------------------------------------------------------------------

## 2. `src/controllers/materias.controller.js`

### Función a adicionar

Se adiciona la función `listEventosByMateria(request, response, next)`.

### Responsabilidades

-   Validar el identificador de materia con `validateMateriaId`.
-   Obtener el identificador del usuario desde `request.user.id`.
-   Invocar el servicio `listEventosByMateria`.
-   Enviar los eventos utilizando `sendSuccess`.
-   Propagar los errores mediante `next(error)`.

``` js
export async function listEventosByMateria(request, response, next) {
    try {
        const id = validateMateriaId(request.params.id);

        const eventos = await materiasService.listEventosByMateria(
            id,
            request.user.id
        );

        return sendSuccess(response, eventos);
    } catch (error) {
        return next(error);
    }
}
```

Las importaciones existentes de `materiasService`, `validateMateriaId` y
`sendSuccess` se reutilizan.

------------------------------------------------------------------------

## 3. `src/services/materias.service.js`

### Función a adicionar

Se adiciona la función `listEventosByMateria(id, userId)`.

### Responsabilidad

Solicitar al repositorio los eventos filtrados por materia y usuario y
devolver el arreglo obtenido.

``` js
export async function listEventosByMateria(id, userId) {
    return materiasRepository.findEventosByMateriaAndUserId(id, userId);
}
```

Se reutiliza la importación existente de `materiasRepository`.

------------------------------------------------------------------------

## 4. `src/repositories/materias.repositorio.js`

### Función a adicionar

Se adiciona la función `findEventosByMateriaAndUserId(id, userId)`.

### Responsabilidades

-   Seleccionar explícitamente los campos de la tabla `evento`.
-   Utilizar alias para devolver los nombres de los campos en camelCase.
-   Relacionar la tabla `evento` con la tabla `materia`.
-   Filtrar por el identificador de la materia.
-   Verificar que la materia pertenezca al usuario.
-   Ejecutar la consulta utilizando parámetros.
-   Devolver todas las filas encontradas.

``` js
export async function findEventosByMateriaAndUserId(id, userId) {
    const [rows] = await pool.execute(
        `SELECT
            e.id_evento AS id,
            e.id_materia AS materiaId,
            e.titulo,
            e.descripcion,
            e.fecha,
            e.hora_inicio AS horaInicio,
            e.hora_fin AS horaFin,
            e.tipo,
            e.created_at AS createdAt,
            e.updated_at AS updatedAt
         FROM evento e
         INNER JOIN materia m ON m.id_materia = e.id_materia
         WHERE m.id_materia = ? AND m.id_usuario = ?`,
        [id, userId]
    );

    return rows;
}
```

La importación existente de `pool` se reutiliza.

------------------------------------------------------------------------

## Componentes existentes que se reutilizan

  ---------------------------------------------------------------------------------------------------------
  Archivo                                           Función o configuración         Cambio requerido
                                                    reutilizada                     
  ------------------------------------------------- ------------------------------- -----------------------
  `src/validators/materias.validator.js`            `validateMateriaId(id)`         Ninguno

  `src/utils/api-response.js`                       `sendSuccess(response, data)`   Ninguno

  `src/config/database.js`                          `pool`                          Ninguno

  `src/app.js`                                      Registro de `/api/v1/materias`  Ninguno

  `src/middlewares/request-context.middleware.js`   `request.user.id`               Ninguno

  `src/middlewares/error.middleware.js`             Manejo centralizado de errores  Ninguno
  ---------------------------------------------------------------------------------------------------------

El identificador del usuario no se recibe como parámetro de consulta. El
controlador obtiene el identificador mediante `request.user.id`.

------------------------------------------------------------------------

## Flujo del endpoint

``` text
GET /api/v1/materias/:id/eventos
        ↓
materias.routes.js
        ↓
listEventosByMateria
        ↓
validateMateriaId
        ↓
materiasService.listEventosByMateria
        ↓
materiasRepository.findEventosByMateriaAndUserId
        ↓
MySQL
        ↓
sendSuccess
        ↓
{ success: true, data: eventos }
```

------------------------------------------------------------------------

## Verificación al implementar

Para verificar el funcionamiento del endpoint se utilizó:

``` text
GET http://localhost:3000/api/v1/materias/1/eventos
```

El endpoint respondió correctamente con los eventos asociados a la
materia con identificador `1`.

La respuesta obtenida fue:

``` json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "materiaId": 1,
            "titulo": "Clase de Algoritmos",
            "descripcion": "Sesión presencial sobre árboles y recorridos.",
            "fecha": "2026-08-20T05:00:00.000Z",
            "horaInicio": "08:00:00",
            "horaFin": "10:00:00",
            "tipo": "CLASE",
            "createdAt": "2026-09-03T22:58:05.000Z",
            "updatedAt": "2026-09-03T22:58:05.000Z"
        }
    ]
}
```

La respuesta demuestra que el endpoint consulta correctamente los
eventos asociados a la materia.

Cuando no existan eventos para una materia, el resultado será:

``` json
{
    "success": true,
    "data": []
}
```

------------------------------------------------------------------------

## Resultado

Se agregó exitosamente el endpoint:

``` text
GET /api/v1/materias/:id/eventos
```

El procedimiento conecta las cuatro capas del backend:

``` text
Route → Controller → Service → Repository
```

De esta manera se pueden consultar los eventos de una materia
verificando también que la materia pertenezca al usuario
correspondiente.
