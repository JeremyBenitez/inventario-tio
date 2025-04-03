// Función para abrir pestañas
function openTab(tabName, event) {
    // console.log('Pestaña clickeada:', tabName);
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

function formatDateFromBackend(dateString) {
    if (!dateString) return 'N/A';
    
    // Si la fecha ya está en formato local (dd/mm/yyyy)
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) return dateString;
    
    try {
        // Crear fecha en UTC para evitar desplazamientos
        const dateObj = new Date(dateString);
        if (isNaN(dateObj.getTime())) return dateString;
        
        // Formatear en UTC
        return dateObj.toLocaleDateString('es-ES', {
            timeZone: 'UTC',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch {
        return dateString;
    }
}

// Función para cargar datos de la pestaña
async function loadTabData(tabType) {
    try {
        const response = await fetch(`/historial/${tabType}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const data = await response.json();
        console.log('Datos recibidos para', tabType, ':', data); // ← Verifica la estructura
        console.log('Fechas recibidas del backend:', data.map(item => item.fecha));
        renderTableData(tabType, data);
        // Verificación específica para despachos
        if (tabType === 'despacho') {
            console.log('Datos de despacho ordenados:', 
                data.map(item => item.fecha)); // Verifica fechas en consola
        }
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
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${item.descripcion || 'N/A'}</td>
                <td><span class="badge badge-reception">${item.deposito || 'N/A'}</span></td>
                <td>${item.cantidad || 'N/A'}</td>
            `;
        } else { 
            // Estructura para despachos
            row.innerHTML = `
                <td>${formattedDate}</td>      
                <td>${item.descripcion || 'N/A'}</td> 
                <td>${item.destinatario || 'N/A'}</td>
                <td><span class="badge badge-dispatch">${item.cantidad || 'N/A'}</span></td>
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