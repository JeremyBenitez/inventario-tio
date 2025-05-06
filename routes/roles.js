// backend/config/roles.js
module.exports = {
    ROLES: {
        ADMIN: 'admin',
        TECNOLOGIA: 'tecnologia',
        PRINTOM: 'printom',
        USER: 'usuario'
    },

    PERMISSIONS: {
        admin: {
            dashboard: true,
            users: { view: true, create: true, edit: true, delete: true },
            inventory: { view: true, edit: true, delete: true },
            reports: { view: true, export: true },
            allDepartments: true
        },
        tecnologia: {
            dashboard: true,
            users: { view: false, create: false, edit: false, delete: false },
            inventory: { view: true, edit: true, delete: false },
            reports: { view: true, export: false },
            department: 'tecnologia'
        },
        printom: {
            dashboard: true,
            users: { view: false, create: false, edit: false, delete: false },
            inventory: { view: true, edit: true, delete: false },
            reports: { view: true, export: false },
            department: 'printom'
        },
        usuario: {
            dashboard: true,
            users: { view: false, create: false, edit: false, delete: false },
            inventory: { view: true, edit: false, delete: false },
            reports: { view: false, export: false }
        }
    }
};