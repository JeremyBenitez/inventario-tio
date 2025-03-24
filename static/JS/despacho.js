document.addEventListener('DOMContentLoaded', function () {
    const despachoForm = document.querySelector('.despacho-form');
    const recepcionForm = document.querySelector('.recepcion-form');

    if (despachoForm) {
        despachoForm.addEventListener('submit', async function (event) {
            event.preventDefault();

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

                if (!response.ok) {
                    throw new Error('Error al guardar el despacho');
                }

                const responseData = await response.text();
                alert(responseData);
                despachoForm.reset();
            } catch (error) {
                alert(error.message);
            }
        });
    }

});