document.addEventListener('DOMContentLoaded', function () {
    // Establecer fecha mínima (hoy)
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        const today = new Date().toISOString().split('T')[0];
        fechaInput.setAttribute('min', today);
    }
    
    const despachoForm = document.querySelector('.despacho-form');

    if (despachoForm) {
        despachoForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            // Obtener valores del formulario
            const numero_despacho = document.getElementById('numero_despacho').value;
            const fecha_despacho = document.getElementById('fecha').value;
            const destinatario = document.getElementById('destinatario').value;
            const cantidad = document.getElementById('cantidad').value;
            const deposito_origen = document.getElementById('deposito').value;
            const observaciones = document.getElementById('observaciones').value;

            const data = {
                despacho: numero_despacho,
                fecha: fecha_despacho,
                destinatario,
                cantidad,
                deposito: deposito_origen,
                observaciones,
            };

            try {
                const response = await fetch('http://localhost:3000/despachorecepcion/guardar_despacho', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                // Manejar la respuesta del servidor
                if (response.ok) {
                    // Intentar parsear como JSON, si falla usar mensaje genérico
                    let responseData;
                    try {
                        responseData = await response.json();
                    } catch (e) {
                        responseData = { mensaje: 'Despacho registrado con éxito' };
                    }
                    
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Éxito!',
                        text: responseData.mensaje || 'Despacho registrado correctamente',
                        confirmButtonText: 'Aceptar'
                    });
                    
                    despachoForm.reset();
                } else {
                    // Manejar errores del servidor
                    let errorData;
                    try {
                        errorData = await response.json();
                    } catch (e) {
                        errorData = { error: 'Error al procesar la respuesta del servidor' };
                    }
                    throw new Error(errorData.error || 'Error al guardar el despacho');
                }
            } catch (error) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Hubo un problema al guardar el despacho',
                    confirmButtonText: 'Aceptar'
                });
            }
        });
    }
});



document.getElementById('close-btn').addEventListener('click', function () {
    console.log('Botón de cerrar sesión clickeado');

    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((response) => {
            console.log('Respuesta del servidor:', response);
            if (response.ok) {
                // Redirige manualmente a la página principal
                window.location.href = '/';
            }
        })
        .catch((error) => {
            console.error('Error al cerrar sesión:', error);
        });
});