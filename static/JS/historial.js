// Función para abrir pestañas
function openTab(tabName, event) {
    console.log('Pestaña clickeada:', tabName);
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
    
    // Cargar datos dinámicamente
    loadTabData(tabName);
}

// Función para formatear fecha
function formatDateFromBackend(dateString) {
    if (!dateString) return 'N/A';
    
    // Si ya viene formateada del backend
    if (dateString.includes('/')) return dateString;
    
    // Si viene en formato ISO (YYYY-MM-DD)
    const dateObj = new Date(dateString);
    return isNaN(dateObj.getTime()) 
        ? dateString 
        : dateObj.toLocaleDateString('es-ES');
}

// Función para cargar datos de la pestaña
async function loadTabData(tabType) {
    try {
        const response = await fetch(`/historial/${tabType}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const data = await response.json();
        console.log('Estructura de datos recibidos:', data[0]); // ← Muestra el primer registro
        renderTableData(tabType, data);
    } catch (error) {
        console.error(`Error al cargar datos de ${tabType}:`, error);
        const tableId = `${tabType}Table`;
        const table = document.getElementById(tableId);
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = `<tr><td colspan="4" class="error-message">Error al cargar datos: ${error.message}</td></tr>`;
    }
}

function renderTableData(tabType, data) {
    const tableId = `${tabType}Table`;
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">No hay registros</td></tr>`;
        return;
    }
    
    data.forEach(item => {
        const row = document.createElement('tr');
        const formattedDate = formatDateFromBackend(item.fecha);
        
        if (tabType === 'recepcion') {
            // Asignación para recepción
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${item.descripcion || 'N/A'}</td>
                <td><span class="badge badge-reception">${item.deposito || 0}</span></td>
                <td>${item.cantidad || 'N/A'}</td>
            `;
        } else { 
            // Asignación CORREGIDA para despacho
            row.innerHTML = `
                <td>${formattedDate}</td>      
                <td>${item.descripcion || 'N/A'}</td> 
                <td>${item.destinatario || 'N/A'}</td> <!-- Mostrar destinatario como descripción -->
                <td><span class="badge badge-dispatch">${item.cantidad || 0}</span></td>
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

// Manejador del botón Cerrar Sesión
document.getElementById('close-btn').addEventListener('click', function() {
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then((response) => {
        if (response.ok) {
            window.location.href = '/';
        }
    })
    .catch((error) => {
        console.error('Error al cerrar sesión:', error);
    });
});

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Cargar primera pestaña por defecto
    loadTabData('recepcion');
    
    // Configurar evento para botones de pestaña
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => openTab(btn.dataset.tab, e));
    });
});