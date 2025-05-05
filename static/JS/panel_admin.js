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
        const response = await fetch('/api/users', {
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
                <div class="password">
                    <span>${user.Password}</span>
                </div>
            </td>
            <td>
                <div class="department">
                    <span>${user.roles}</span>
                </div>
            </td>
           
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" data-id="${user.id}" 
                            data-username="${user.Usuario}" data-role="${user.roles}">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${user.id}">
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
        console.log(`Cargando usuario ID: ${userId}`);
        const response = await fetch(`http://localhost:5000/Usuario/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error del servidor:', errorText);
            throw new Error(`Error al cargar usuario: ${response.status} ${response.statusText}`);
        }

        const user = await response.json();
        console.log('Datos del usuario:', user);

        // Mapear los campos del backend al frontend
        document.getElementById('userId').value = user.ID; // Usar ID como viene del backend
        document.getElementById('editName').value = user.Usuario; // Campo Usuario
        document.getElementById('editRole').value = user.roles; // Campo roles
        
        // Limpiar el campo de contraseña por seguridad (no mostramos la actual)
        document.getElementById('editPassword').value = '';

        // Mostrar el modal
        document.getElementById('editModal').style.display = 'block';

    } catch (error) {
        console.error('Error en editUser:', error);
        alert(error.message || 'Error al cargar el usuario');
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

        

        console.log('Enviando datos:', userData);

        const response = await fetch(`http://localhost:5000/usuario/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al actualizar usuario');
        }

        const result = await response.json();
        alert(result.message);
        closeModal();
        loadUsers(); // Recargar la lista de usuarios

    } catch (error) {
        console.error('Error en saveUser:', error);
        alert(error.message || 'Error al guardar los cambios');
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
