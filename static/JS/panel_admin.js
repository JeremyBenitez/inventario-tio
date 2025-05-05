function showEditModal(userId, username, role, password) {
    // Llenar los campos del modal
    document.getElementById('userId').value = userId;
    document.getElementById('editName').value = username;
    document.getElementById('editRole').value = role;
    document.getElementById('editPassword').value = password || ''; // Si no hay contraseña, dejar vacío

    // Mostrar el modal
    document.getElementById('editModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Mostrar modal de creación
function showCreateModal() {
    document.getElementById('createUserModal').style.display = 'block';
    document.getElementById('createUserForm').reset();
}

// Cerrar modal de creación
function closeCreateModal() {
    document.getElementById('createUserModal').style.display = 'none';
}

// Función para crear usuario
async function createUser() {
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('userRole').value;

    // Validaciones
    if (!username.trim()) {
        alert('El nombre de usuario es requerido');
        return;
    }

    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/usuarios/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Usuario: username,
                password: password,
                roles: role
            })
        });

        if (!response.ok) {
            throw new Error('Error al crear el usuario');
        }

        // Cerrar el modal y actualizar la tabla
        closeCreateModal();
        fetchUsers(); // Función que recarga los usuarios

    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al crear el usuario');
    }
}

// Asignar evento al botón "Nuevo Usuario"
document.getElementById('addUserBtn').addEventListener('click', showCreateModal);

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Mostrar usuario logueado
function displayLoggedUser() {
    try {
        const userDataStr = localStorage.getItem('userData');
        if (!userDataStr) {
            throw new Error('No hay datos de usuario');
        }

        const userData = JSON.parse(userDataStr);
        const username = userData.username || userData.Usuario || userData.user || 'Invitado';
        const userRole = userData.role || 'user';

        // Mostrar en el DOM
        const userSpan = document.querySelector('.user-info span');
        if (userSpan) {
            userSpan.textContent = username;
        }

        // Ocultar elementos según el rol
        if (userRole !== 'admin') {
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        }

    } catch (error) {
        console.error('Error al mostrar usuario:', error.message);
        const userSpan = document.querySelector('.user-info span');
        if (userSpan) {
            userSpan.textContent = 'Invitado';
        }
    }
}



// Cargar usuarios desde la API
async function loadUsers() {
    try {
        const response = await fetch('http://localhost:5000/usuarios/allUser', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar usuarios');
        }

        const users = await response.json();

        renderUsersTable(users);
    } catch (error) {
        console.error('Error:', error);
        alert('No se pudieron cargar los usuarios');
    }
}

// Renderizar la tabla de usuarios
function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>
                <div class="user-avatar">
                    <span>${user.Usuario}</span>
                </div>
            </td>
            
            <td>
                <div class="department">
                    <span>${user.roles}</span>
                </div>
            </td>
           
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" data-id="${user.ID}" 
                            data-username="${user.Usuario}" data-role="${user.roles}">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                   <button class="action-btn delete-btn" data-id="${user.ID}">
                       <i class="fas fa-trash"></i>
                    </button>
                 
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });

    // Agregar event listeners a los botones de editar
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.getAttribute('data-id');
            const username = btn.getAttribute('data-username');
            const role = btn.getAttribute('data-role');

            showEditModal(userId, username, role);
        });
    });
}

async function editUser(userId) {
    try {
        console.log(`Intentando cargar usuario ID: ${userId}`);
        const response = await fetch(`http://localhost:5000/usuarios/usuario/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        // Primero obtener el texto de la respuesta para debug
        const responseText = await response.text();
        console.log('Respuesta cruda:', responseText);

        // Verificar si la respuesta es JSON válido
        let user;
        try {
            user = JSON.parse(responseText);
        } catch (e) {
            console.error('La respuesta no es JSON válido:', e);
            throw new Error(`El servidor respondió con formato inválido: ${responseText.substring(0, 50)}...`);
        }

        if (!response.ok) {
            console.error('Error del servidor:', {
                status: response.status,
                statusText: response.statusText,
                errorData: user
            });
            throw new Error(user.error || user.message || `Error ${response.status}: ${response.statusText}`);
        }

        // Validar estructura de datos
        if (!user.ID || !user.Usuario || !user.roles) {
            console.error('Estructura de datos incorrecta:', user);
            throw new Error('Datos del usuario incompletos o formato incorrecto');
        }

        console.log('Datos del usuario recibidos:', user);

        // Mapear campos al formulario
        document.getElementById('userId').value = user.ID;
        document.getElementById('editName').value = user.Usuario;
        document.getElementById('editRole').value = user.roles;
        document.getElementById('editPassword').value = ''; // Limpiar campo contraseña

        // Mostrar modal
        document.getElementById('editModal').style.display = 'block';

    } catch (error) {
        console.error('Error en editUser:', {
            message: error.message,
            stack: error.stack
        });

        // Mostrar mensaje de error más descriptivo
        let errorMessage = error.message;
        if (error.message.includes('JSON.parse')) {
            errorMessage = 'El servidor respondió con un formato inesperado. Por favor, intente nuevamente.';
        }

        showNotification(errorMessage, 'error');
    }
}

async function saveUser() {
    const userId = document.getElementById('userId').value;
    const username = document.getElementById('editName').value;
    const password = document.getElementById('editPassword').value;
    const role = document.getElementById('editRole').value;

    // Validaciones básicas
    if (!username.trim()) {
        alert('El nombre de usuario es requerido');
        return;
    }
    if (!role) {
        alert('Debe seleccionar un rol');
        return;
    }

    try {
        // Preparar datos para enviar al backend
        const userData = {
            username: username,
            password: password,
            role: role
        };

        console.log(userId);
        

        console.log('Enviando datos:', userData);

        const response = await fetch(`http://localhost:5000/usuarios/usuario/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            console.log('Error en la respuesta:', response.status, response.statusText);
            
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al actualizar usuario');
        }

        const result = await response.json();
        console.log();
        
        alert(result.message);
        closeModal();
        loadUsers(); // Recargar la lista de usuarios

    } catch (error) {
        console.error('Error en saveUser:', error);
        alert(error.message || 'Error al guardar los cambios');
    }
}

// eliminar usuario
let userIdToDelete = null;

// Configurar evento para los botones de eliminar
document.addEventListener('click', function(event) {
    const deleteBtn = event.target.closest('.delete-btn');
    if (!deleteBtn) return;
    
    event.preventDefault();
    userIdToDelete = deleteBtn.dataset.id;
    showConfirmModal(userIdToDelete);
});

// Mostrar modal de confirmación
function showConfirmModal(userId) {
    document.getElementById('confirmMessage').textContent = 
        `¿Estás seguro de eliminar al usuario con ID ${userId}?`;
    document.getElementById('confirmModal').style.display = 'block';
}

// Cerrar modal
function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
    userIdToDelete = null;
}

// Configurar evento del botón confirmar
document.getElementById('confirmActionBtn').addEventListener('click', async function () {
    if (!userIdToDelete) {
        showNotification('Error: No se ha seleccionado ningún usuario para eliminar', 'error');
        closeConfirmModal();
        return;
    }

    // console.log(`Intentando eliminar usuario ID: ${userIdToDelete}`); // Para depuración

    const confirmBtn = document.getElementById('confirmActionBtn');
    const originalContent = confirmBtn.innerHTML;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Eliminando...';
    confirmBtn.disabled = true;

    try {
        const response = await fetch(`http://localhost:5000/Usuarios/usuarios/${userIdToDelete}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al eliminar usuario');
        }

        showNotification('Usuario eliminado correctamente', 'success');
        loadUsers();

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        showNotification(error.message || 'Error al eliminar usuario', 'error');
    } finally {
        confirmBtn.innerHTML = originalContent;
        confirmBtn.disabled = false;
        closeConfirmModal();
    }
});

// Función para mostrar notificaciones
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Función para mostrar notificaciones
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.classList.add('fade-out');
        setTimeout(() => alertDiv.remove(), 500);
    }, 3000);
}

// Cerrar sesión
function setupLogout() {
    document.getElementById('close-btn').addEventListener('click', function (e) {
        e.preventDefault();

        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (response.ok) {
                    localStorage.removeItem('userData');
                    localStorage.removeItem('token');
                    window.location.href = '/';
                }
            })
            .catch((error) => {
                console.error('Error al cerrar sesión:', error);
            });
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    displayLoggedUser();
    loadUsers();
    setupLogout();

    // Event listeners
    document.getElementById('addUserBtn').addEventListener('click', () => openModal());
    document.getElementById('saveUserBtn').addEventListener('click', saveUser);

    // Cerrar modales al hacer clic fuera
    window.onclick = function (event) {
        if (event.target == document.getElementById('userModal')) {
            closeModal();
        }
        if (event.target == document.getElementById('confirmModal')) {
            closeConfirmModal();
        }
    };
});


// Función para abrir el modal de creación
function openCreateModal() {
    document.getElementById('createUserModal').style.display = 'block';
    // Limpiar el formulario al abrir
    document.getElementById('createUserForm').reset();
}

// Función para cerrar el modal de creación
function closeCreateModal() {
    document.getElementById('createUserModal').style.display = 'none';
}

// Función para crear un nuevo usuario
async function createUser() {
    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('userRole').value;

    // Validaciones
    if (!username) {
        alert('El nombre de usuario es requerido');
        return;
    }

    if (!password || password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    if (!role) {
        alert('Debe seleccionar un rol');
        return;
    }

    try {
        // Preparar los datos para enviar al backend
        const userData = {
            Usuario: username,
            Password: password,
            roles: role
        };

        console.log('Enviando datos para nuevo usuario:', userData);

        const response = await fetch('http://localhost:5000/usuarios/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al crear el usuario');
        }

        const result = await response.json();
        alert(result.mensaje || 'Usuario creado exitosamente');

        // Cerrar el modal y recargar la lista de usuarios
        closeCreateModal();
        loadUsers();

    } catch (error) {
        console.error('Error en createUser:', error);
        alert(error.message || 'Error al crear el usuario');
    }
}

// Función para mostrar/ocultar contraseña (puedes reutilizar la misma)
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Agregar evento al botón de crear usuario en tu interfaz
document.getElementById('addUserButton').addEventListener('click', openCreateModal);