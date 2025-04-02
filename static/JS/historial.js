// Función para abrir pestañas
function openTab(tabName, event) {
    // Hide all tab content
    const tabContent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].classList.remove("active");
    }

    // Remove 'active' class from all tab buttons
    const tabButtons = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    // Show the selected tab and add 'active' class to the button
    document.getElementById(tabName).classList.add("active");
    event.currentTarget.classList.add("active");

    // Cargar datos dinámicamente solo si no se ha cargado antes
    loadTabData(tabName);
}

// Variable para almacenar los datos cargados
const loadedTabs = {};

// Función para cargar datos de la pestaña
async function loadTabData(tabType) {
    // Solo cargar los datos si no se han cargado previamente
    if (loadedTabs[tabType]) return;

    try {
        const response = await fetch(`/historial_despachos/${tabType}`);
        const data = await response.json();
        renderTableData(tabType, data);
        loadedTabs[tabType] = true;  // Marcar que los datos se han cargado
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
}

// Función para renderizar datos en la tabla
function renderTableData(tabType, data) {
    const tableId = `${tabType}Table`;
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');

    // Limpiar tabla antes de llenarla
    tbody.innerHTML = '';

    // Llenar con nuevos datos
    data.forEach(item => {
        const row = document.createElement('tr');
        // Construir las celdas según el tipo de tabla
        if (tabType === 'recepcion') {
            row.innerHTML = `
                <td>${item.fecha}</td>
                <td>${item.descripcion}</td>
                <td>${item.deposito}</td>
                <td><span class="badge badge-reception">${item.cantidad} unidades</span></td>
            `;
        } else {
            row.innerHTML = `
                <td>${item.fecha}</td>
                <td>${item.descripcion}</td>
                <td>${item.destino}</td>
                <td><span class="badge badge-dispatch">${item.cantidad} unidades</span></td>
            `;
        }
        tbody.appendChild(row);
    });
}

// Función para filtrar tabla
function filterTable(tableId, inputId, columnIndex) {
    const input = document.getElementById(inputId);
    const filter = input.value.toUpperCase();
    const table = document.getElementById(tableId);
    const tr = table.getElementsByTagName("tr");

    // Solo filtrar si hay algo en el campo de búsqueda
    if (!filter) {
        for (let i = 0; i < tr.length; i++) {
            tr[i].style.display = "";
        }
        return;
    }

    // Filtrar filas
    for (let i = 0; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName("td")[columnIndex];
        if (td) {
            const txtValue = td.textContent || td.innerText;
            tr[i].style.display = txtValue.toUpperCase().includes(filter) ? "" : "none";
        }
    }
}


// Manejador del botón Volver
document.getElementById('back-btn-header')?.addEventListener('click', () => {
    window.location.href = '/inventario';
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Cargar primera pestaña por defecto
    loadTabData('recepcion');
    
    // Configurar evento para botones de pestaña
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => openTab(btn.dataset.tab, e));
    });
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