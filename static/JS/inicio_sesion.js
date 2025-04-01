document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (!loginForm) {
        console.error('Formulario no encontrado.');
        return;
    }

    // Configuración global de SweetAlert2 para evitar desplazamientos
    const swalConfig = {
        // Evitar que SweetAlert modifique el padding del body
        heightAuto: false,
        // Prevenir scroll
        scrollbarPadding: false,
        // Clase personalizada para controlar el scroll
        customClass: {
            container: 'swal-no-scroll'
        }
    };

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const Usuario = document.getElementById('Usuario').value;
        const Password = document.getElementById('Password').value;

        if (!Usuario || !Password) {
            await Swal.fire({
                ...swalConfig,
                icon: 'error',
                title: 'Oops...',
                html: '<span style="color: #555;">Por favor, ingrese tanto el <b>usuario</b> como la <b>contraseña</b></span>',
                background: 'rgba(255, 255, 255, 0.95)',
                backdrop: `
                    rgba(110, 142, 251, 0.15)
                    url("/Img/nyan-cat.gif")
                    center top
                    no-repeat
                `,
                showConfirmButton: true,
                confirmButtonText: 'Entendido'
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

            // Animación de éxito personalizada con configuración para evitar desplazamiento
            await Swal.fire({
                ...swalConfig,
                title: `<span style="color: #6e8efb;">¡Bienvenido, ${Usuario}!</span>`,
                html: `
                    <div style="margin: 20px 0; color: #425981;">
                        <p>Inicio de sesión exitoso</p>
                        <div style="margin-top: 15px; font-size: 0.9em; color: #6e8efb;">
                            Redirigiendo al sistema...
                        </div>
                    </div>
                `,
                icon: 'success',
                background: 'rgba(255, 255, 255, 0.95)',
                backdrop: `
                    rgba(110, 142, 251, 0.1)
                    left top
                    no-repeat
                `,
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                didOpen: () => {
                    Swal.showLoading();
                },
                willClose: () => {
                    window.location.href = `/inventario?token=${encodeURIComponent(data.token)}`;
                }
            });

        } catch (error) {
            console.error('Error al enviar la solicitud:', error);
            await Swal.fire({
                ...swalConfig,
                icon: 'error',
                title: 'Error',
                html: `<span style="color: #555;">${error.message || 'Hubo un problema al procesar la solicitud'}</span>`,
                background: 'rgba(255, 255, 255, 0.95)',
                confirmButtonText: 'Intentar nuevamente'
            });
        }
    });
});