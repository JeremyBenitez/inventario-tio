document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (!loginForm) {
        console.error('Formulario no encontrado.');
        return;
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const Usuario = document.getElementById('Usuario').value;
        const Password = document.getElementById('Password').value;

        if (!Usuario || !Password) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor, ingrese tanto el usuario como la contraseña.'
            });
            return;
        }

        try {
            const response = await fetch('/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Usuario: Usuario, Password: Password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Hubo un error en el inicio de sesión');
            }

            const data = await response.json();
            console.log('Respuesta del servidor:', data);

            // Mostrar mensaje de éxito con SweetAlert2 y redirigir después
            Swal.fire({
                icon: 'success',
                title: '¡Bienvenido!',
                text: 'Inicio de sesión exitoso',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.href = '/inventario';
            });
        } catch (error) {
            console.error('Error al enviar la solicitud:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Hubo un problema al procesar la solicitud'
            });
        }
    });
});