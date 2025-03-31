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
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor, ingrese tanto el usuario como la contraseña.',
                position: 'center',
                backdrop: 'rgba(0,0,0,0.5)',
                allowOutsideClick: false,
                customClass: {
                    container: 'swal-no-scroll'
                }
            });
            return;
        }

        try {
            const response = await fetch('/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Usuario, Password }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Hubo un error en el inicio de sesión');
            }

            const data = await response.json();

            // Agregamos la clase al body para prevenir el scroll
            document.body.classList.add('swal-open');

            await Swal.fire({
                title: '<span style="color: #4CAF50; font-size: 1.5rem;">¡Bienvenido!</span>',
                html: '<div style="margin: 1rem 0; font-size: 1.1rem;">Inicio de sesión exitoso</div>',
                icon: 'success',
                position: 'center',
                backdrop: 'rgba(0,0,0,0.5)',
                showConfirmButton: false,
                timer: 1500,
                customClass: {
                    container: 'swal-fixed-container',
                    popup: 'swal-over-form'
                },
                willClose: () => {
                    // Removemos la clase al cerrar el modal
                    document.body.classList.remove('swal-open');
                }
            });

            // Redirigir después del modal
            window.location.href = `/inventario?token=${encodeURIComponent(data.token)}`;

        } catch (error) {
            console.error('Error al enviar la solicitud:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Hubo un problema al procesar la solicitud',
                position: 'center',
                backdrop: 'rgba(0,0,0,0.5)',
                customClass: {
                    container: 'swal-no-scroll'
                }
            });
        }
    });
});