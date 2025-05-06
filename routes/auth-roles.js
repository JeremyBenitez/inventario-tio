const { ROLES } = require('../routes/roles');
const db = require('../controllers/conexion');

// Versión mejorada con cache y validación extendida
module.exports = (resource, action, options = {}) => {
    return async (req, res, next) => {
        try {
            // 1. Validación básica del request
            if (!req.userId) {
                return res.status(401).json({
                    error: 'No se proporcionó identificación de usuario'
                });
            }

            // 2. Obtener usuario con cache básica
            const user = await getCachedUser(req.userId);
            if (!user) {
                return res.status(401).json({
                    error: 'Usuario no encontrado o inactivo',
                    code: 'USER_NOT_FOUND'
                });
            }

            // 3. Validar rol del usuario
            if (!ROLES[user.roles]) {
                console.warn(`Intento de acceso con rol no reconocido: ${user.roles}`);
                return res.status(403).json({
                    error: 'Rol de usuario no reconocido',
                    code: 'INVALID_ROLE'
                });
            }

            // 4. Verificar permisos
            const { hasAccess, errorMessage } = checkUserAccess(
                user,
                resource,
                action,
                options
            );

            if (!hasAccess) {
                return res.status(403).json({
                    error: errorMessage,
                    code: 'ACCESS_DENIED',
                    required: `${resource}.${action || 'view'}`
                });
            }

            // 5. Adjuntar información de usuario al request
            req.authUser = {
                id: user.ID,
                username: user.Usuario,
                role: user.roles,
                department: user.department,
                permissions: PERMISSIONS[user.roles]
            };

            next();
        } catch (error) {
            console.error('Error en middleware de roles:', {
                error: error.message,
                userId: req.userId,
                route: req.path
            });

            res.status(500).json({
                error: 'Error interno al verificar permisos',
                code: 'PERMISSION_CHECK_ERROR'
            });
        }
    };
};

// --- Funciones auxiliares ---

// Cache simple en memoria (mejorable con Redis)
const userCache = new Map();

async function getCachedUser(userId) {
    if (userCache.has(userId)) {
        return userCache.get(userId);
    }

    const user = await new Promise((resolve, reject) => {
        db.get(
            'SELECT ID, Usuario, roles, department FROM inicio_usuario WHERE ID = ?',
            [userId],
            (err, row) => {
                if (err) reject(err);
                resolve(row);
            }
        );
    });

    if (user) {
        userCache.set(userId, user);
        setTimeout(() => userCache.delete(userId), 300000); // Cache por 5 minutos
    }

    return user;
}

function checkUserAccess(user, resource, action, options) {
    const rolePermissions = PERMISSIONS[user.roles];

    // 1. Verificar acceso al recurso
    if (!rolePermissions[resource]) {
        return {
            hasAccess: false,
            errorMessage: `Tu rol no tiene acceso al recurso: ${resource}`
        };
    }

    // 2. Verificar acción específica
    if (action) {
        const resourcePermissions = rolePermissions[resource];

        if (typeof resourcePermissions === 'object' && !resourcePermissions[action]) {
            return {
                hasAccess: false,
                errorMessage: `Acción no permitida: ${resource}.${action}`
            };
        }
    }

    // 3. Validación por departamento
    if (options.requireDepartment) {
        if (!user.department && user.roles !== 'admin') {
            return {
                hasAccess: false,
                errorMessage: 'Acceso restringido por departamento'
            };
        }

        // Agregar filtro para consultas
        if (user.department && !rolePermissions.allDepartments) {
            req.departmentFilter = { department: user.department };
        }
    }

    return { hasAccess: true };
}