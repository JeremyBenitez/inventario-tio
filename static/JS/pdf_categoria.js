// Función para mostrar artículos en la tabla
function mostrarArticulos(articulos) {
    const contenedor = document.getElementById('articulos-container');

    if (articulos.length === 0) {
        contenedor.innerHTML = `
            <div class="alert alert-warning">
                No se encontraron artículos para las categorías seleccionadas
            </div>
        `;
        contenedor.classList.remove('d-none');
        return;
    }

    contenedor.innerHTML = `
        <h5 class="fw-bold mb-3">
            <i class="fas fa-list-check me-2"></i>
            Artículos encontrados: ${articulos.length}
        </h5>
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Cantidad</th>
                        <th>Ubicación</th>
                    </tr>
                </thead>
                <tbody>
                    ${articulos.map(articulo => `
                        <tr>
                            <td>${articulo.Nombre || 'N/A'}</td>
                            <td>${articulo.Categoria || 'N/A'}</td>
                            <td>${articulo.Cantidad || 'N/A'}</td>
                            <td>${articulo.Ubicacion || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    contenedor.classList.remove('d-none');

    // Llama a la función para generar el PDF
    document.getElementById('exportBtn').addEventListener('click', function () {
        generarPDF(articulos);
    });
}

// Función para generar el PDF
// Función para generar el PDF
function generarPDF(articulos) {
    const { jsPDF } = window.jspdf; // Asegúrate de que jsPDF esté disponible
    const doc = new jsPDF();
    const logo = 'https://i.postimg.cc/9MmZJx7v/logo.png'; // Cambia esto por la URL de tu logo

    // Establecer colores
    const colorPrimario = [0, 51, 102];

    // Agregar encabezado
    doc.addImage(logo, 'JPEG', 10, 10, 30, 30); // Logo
    doc.setFontSize(18);
    doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
    doc.text("Reporte de Artículos", 105, 20, { align: 'center' });

    // Agregar información adicional
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total de artículos: ${articulos.length}`, 105, 30, { align: 'center' });

    // Agregar encabezados de la tabla
    const headers = [["Nombre", "Categoría", "Cantidad", "Ubicación"]];
    const data = articulos.map(articulo => [articulo.Nombre || 'N/A', articulo.Categoria || 'N/A', articulo.Cantidad || 'N/A', articulo.Ubicacion || 'N/A']);

    // Verifica si autoTable está disponible
    if (!doc.autoTable) {
        console.log("El plugin autoTable no está instalado correctamente.");
        return;
    }

    // Agregar la tabla al PDF
    doc.autoTable({
        head: headers,
        body: data,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: colorPrimario },
        styles: { cellPadding: 2, fontSize: 10 },
    });

    // Agregar pie de página
    const pieY = doc.lastAutoTable.finalY + 10; // Posición del pie de página
    doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
    doc.rect(0, pieY, 210, 20, 'F'); // Fondo del pie de página
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Documento generado el ${new Date().toLocaleDateString()}`, 105, pieY + 5, { align: 'center' });
    doc.text(`Total de artículos: ${articulos.length}`, 105, pieY + 10, { align: 'center' });

    // Descargar el PDF
    doc.save("articulos.pdf");
}

// Manejar selección/deselección de "Seleccionar todo"
document.getElementById('selectAll').addEventListener('change', function () {
    const checkboxes = document.querySelectorAll('#categoriesContainer .checkbox-custom');
    checkboxes.forEach(checkbox => {
        checkbox.checked = this.checked;
    });
});

// Manejar exportación 
document.getElementById('exportBtn').addEventListener('click', function () {
    const selectedCategories = [];
    document.querySelectorAll('#categoriesContainer .checkbox-custom:checked').forEach(checkbox => {
        selectedCategories.push(checkbox.nextElementSibling.textContent.trim());
    });

    if (selectedCategories.length === 0) {
        alert('Por favor, selecciona al menos una categoría.');
        return;
    }

    // Mostrar estado de carga
    const btnOriginalHTML = this.innerHTML;
    this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Buscando artículos...';
    this.disabled = true;

    // Enviar solicitud al backend
    fetch('http://localhost:5000/inventario/articulos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categorias: selectedCategories })
    })
    .then(async response => {
        const data = await response.json();

        console.log('Respuesta del servidor:', data);

        if (!response.ok) {
            throw new Error(data.error || 'Error desconocido');
        }

        if (!data.success) {
            throw new Error(data.error || 'Error en la respuesta del servidor');
        }

        return data.data; // Extrae el array de artículos
    })
    .then(articulos => {
        console.log("Artículos recibidos:", articulos);
        mostrarArticulos(articulos);
    })
    .catch(error => {
        console.error("Error:", error);
        alert(`Error: ${error.message}`);
    })
    .finally(() => {
        // Restaurar el botón después de la solicitud
        this.innerHTML = btnOriginalHTML;
        this.disabled = false;
    });
});

