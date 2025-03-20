// Aseguramos que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', () => {
    // Seleccionamos el formulario
    const loginForm = document.getElementById('login-form');

    // Si no encontramos el formulario, se puede agregar una verificación
    if (!loginForm) {
        console.error('Formulario no encontrado.');
        return;
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evitar el comportamiento por defecto del formulario (recarga de página)

        // Recoger los valores de los campos de entrada
        const Usuario = document.getElementById('Usuario').value;
        const Password = document.getElementById('Password').value;

        // Comprobamos que los campos no estén vacíos
        if (!Usuario || !Password) {
            alert('Por favor, ingrese tanto el usuario como la contraseña.');
            return;
        }

        // Mostrar los valores que se están enviando para depuración
        console.log('Usuario:', Usuario);
        console.log('Password:', Password);

        // Realizamos la petición POST al backend
        try {
            const response = await fetch('/usuarios/login', {  // 🔹 Corregí la URL agregando la barra inicial
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',  // ✅ Enviar cookies de sesión
                body: JSON.stringify({ Usuario, Password }),
            });

            // Procesamos la respuesta
            const data = await response.json();
            console.log('Respuesta del servidor:', data);

            if (response.ok) {
                alert('Inicio de sesión exitoso');
                // Redirigir o hacer cualquier acción posterior al inicio de sesión exitoso
                window.location.href = '/inventario'; // Redirige a la página de inventario
            } else {
                alert(data.error || 'Hubo un error en el inicio de sesión');
            }
            
        } catch (error) {
            console.error('Error al enviar la solicitud:', error);
            alert('Hubo un problema al procesar la solicitud');
        }
    });
});

