document.addEventListener('DOMContentLoaded', function () {
    const recepcionForm = document.querySelector('.recepcion-form');

    if (recepcionForm) {
        recepcionForm.addEventListener('submit', async function (event) {
            event.preventDefault();

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

                if (!response.ok) {
                    throw new Error('Error al guardar la recepción');
                }

                const responseData = await response.text();
                alert(responseData);
                recepcionForm.reset();
            } catch (error) {
                alert(error.message);
            }
        });
    }
});
