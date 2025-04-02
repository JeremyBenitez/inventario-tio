document.addEventListener('DOMContentLoaded', () => {
    fetchRecepciones();
    fetchDespachos();

    // Manejar el clic en los botones de pestañas
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            showTab(tabId);
        });
    });
});

function showTab(tabId) {
    // Ocultar todas las pestañas
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });

    // Mostrar la pestaña seleccionada
    const activeTab = document.getElementById(tabId);
    activeTab.classList.add('active');

    // Cambiar la clase activa en los botones
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-tab') === tabId) {
            button.classList.add('active');
        }
    });
}

function fetchRecepciones() {
    fetch('http://10.21.5.26:3000/inventario/Recepciones')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('.recepcion');
            tbody.innerHTML = ''; // Limpiar el contenido anterior
            data.forEach(item => {
                const row = `<tr>
                    <td>${item.Fecha}</td>
                    <td>${item.Descripción}</td>
                    <td>${item.Destino}</td>
                    <td>${item.Cantidad}</td>
                </tr>`;
                tbody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error fetching recepciones:', error));
}

function fetchDespachos() {
    fetch('http://10.21.5.26:3000/inventario/Despachos')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('.despacho');
            tbody.innerHTML = ''; // Limpiar el contenido anterior
            data.forEach(item => {
                const row = `<tr>
                    <td>${item.Fecha}</td>
                    <td>${item.Descripción}</td>
                    <td>${item.Destino}</td>
                    <td>${item.Cantidad}</td>
                </tr>`;
                tbody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error fetching despachos:', error));
}
