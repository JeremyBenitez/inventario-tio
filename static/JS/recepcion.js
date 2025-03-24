document.addEventListener('DOMContentLoaded', function () {
    const recepcionForm = document.querySelector('.recepcion-form');

    if (recepcionForm) {
        recepcionForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            // Obtener valores del formulario
            const fecha = document.getElementById('fecha').value;
            const descripcion = document.getElementById('descripcion').value;
            const destino = document.getElementById('destino').value;
            const cantidad = document.getElementById('cantidad').value;
            const deposito = document.getElementById('deposito').value;
            const observaciones = document.getElementById('observaciones').value;

            const data = {
                fecha,
                descripcion,
                destino,
                cantidad,
                deposito,
                observaciones,
            };

            try {
                const response = await fetch('http://localhost:3000/despachorecepcion/guardar_recepcion', {
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
                        responseData = { mensaje: 'Recepción registrada con éxito' };
                    }
                    
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Éxito!',
                        text: responseData.mensaje || 'Recepción registrada correctamente',
                        confirmButtonText: 'Aceptar',
                        timer: 2000,
                        timerProgressBar: true
                    });
                    
                    recepcionForm.reset();
                } else {
                    // Manejar errores del servidor
                    let errorData;
                    try {
                        errorData = await response.json();
                    } catch (e) {
                        errorData = { error: await response.text() || 'Error al procesar la respuesta del servidor' };
                    }
                    throw new Error(errorData.error || 'Error al guardar la recepción');
                }
            } catch (error) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Hubo un problema al guardar la recepción',
                    confirmButtonText: 'Aceptar'
                });
            }
        });
    }
});