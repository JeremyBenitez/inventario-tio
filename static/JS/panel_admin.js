// Modal functions
function openModal() {
    document.getElementById('editModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}


window.onclick = function (event) {
    const modal = document.getElementById('editModal');
    if (event.target == modal) {
        closeModal();
    }
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.password-toggle');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
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
            document.getElementById('addUserBtn').style.display = 'none';
        }

    } catch (error) {
        console.error('Error al mostrar usuario:', error.message);
        const userSpan = document.querySelector('.user-info span');
        if (userSpan) {
            userSpan.textContent = 'Invitado';
        }
    }
}

// Funciones del modal
function openModal(user = null) {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('userForm');

    if (user) {
        // Modo edición
        modalTitle.innerHTML = '<i class="fas fa-user-edit"></i> Editar Usuario';
        document.getElementById('userId').value = user.id;
        document.getElementById('username').value = user.Usuario;
        document.getElementById('department').value = user.departmento;
        document.getElementById('role').value = user.roles;
    } else {
        // Modo creación
        modalTitle.innerHTML = '<i class="fas fa-user-plus"></i> Crear Usuario';
        form.reset();
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('userModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Modal de confirmación
function openConfirmModal(message, action) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmActionBtn').onclick = action;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.password-toggle');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
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

// Renderizar tabla de usuarios
function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
     tbody.innerHTML = '';
    
    users.forEach(user => {
;
        
        const tr = document.createElement('tr');

        // Avatar y nombre
        tr.innerHTML = `
            <td>
                <div class="user-avatar">
                    <span>${user.Usuario}</span>
                </div>
            </td>
            <td>${user.email}</td>
            <td>
                <div class="department">
                    <i class="fas ${getDepartmentIcon(user.department)}"></i>
                    <span>${user.roles}</span>
                </div>
            </td>
       
                <div class="action-buttons">
                    <button class="action-btn edit-btn" data-id="${user._id}">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${user._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });

    // Agregar event listeners a los botones
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editUser(btn.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => confirmDeleteUser(btn.dataset.id));
    });
}

// Obtener ícono según departamento
function getDepartmentIcon(department) {
    const icons = {
        'Logística': 'fa-truck',
        'Almacén': 'fa-warehouse',
        'Compras': 'fa-shopping-cart',
        'Ventas': 'fa-chart-line',
        'TI': 'fa-laptop-code',
        'RH': 'fa-users'
    };
    return icons[department] || 'fa-building';
}

// Obtener nombre legible del rol
function getRoleName(role) {
    const roles = {
        'user': 'Usuario',
        'supervisor': 'Supervisor',
        'admin': 'Administrador',
      
    };
    return roles[role] || role;
}

function openModal(userData) {
    const modal = document.getElementById('editModal');

    if (userData) {
        // Rellenar el formulario con los datos del usuario
        document.getElementById('userId').value = userData.id || '';
        document.getElementById('editName').value = userData.username || '';
        document.getElementById('editDepartment').value = userData.department || 'Almacén';
        document.getElementById('editRole').value = userData.role || 'Usuario';
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

async function editUser(userId) {
    try {
        console.log(`Intentando cargar usuario ID: ${userId}`); // Debug
        const response = await fetch(`http://localhost:5000/usuarios/usuario/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        console.log('Respuesta del servidor:', response); // Debug

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Contenido del error:', errorText); // Debug
            try {
                const errorData = JSON.parse(errorText);
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            } catch {
                throw new Error(errorText || `Error ${response.status}: ${response.statusText}`);
            }
        }

        const user = await response.json();
        console.log('Usuario recibido:', user); // Debug

        const userData = {
            id: user.ID,
            username: user.Usuario,
            role: user.roles
        };

        openModal(userData);
    } catch (error) {
        console.error('Error completo en editUser:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        alert(`No se pudo cargar el usuario: ${error.message}`);
    }
}


// Confirmar eliminación de usuario
function confirmDeleteUser(userId) {
    openConfirmModal('¿Estás seguro de que deseas eliminar este usuario?', () => deleteUser(userId));
}

// Eliminar usuario
async function deleteUser(userId) {
    try {
        const response = await fetch(`http://localhost:5000/allUser/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al eliminar usuario');
        }

        closeConfirmModal();
        loadUsers(); // Recargar la lista
        alert('Usuario eliminado correctamente');
    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo eliminar el usuario');
    }
}

// Guardar usuario (crear o actualizar)
async function saveUser() {
    const form = document.getElementById('userForm');
    const userId = document.getElementById('userId').value;
    const isEdit = !!userId;

    const userData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        department: document.getElementById('department').value,
        role: document.getElementById('role').value
    };

    // Solo incluir password si se proporcionó
    const password = document.getElementById('password').value;
    if (password) {
        userData.password = password;
    }

    try {
        const url = isEdit ? `http://localhost:5000/registro/${userId}` : '/api/users';
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al guardar usuario');
        }

        closeModal();
        loadUsers(); // Recargar la lista
        alert(`Usuario ${isEdit ? 'actualizado' : 'creado'} correctamente`);
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Error al guardar usuario');
    }
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
