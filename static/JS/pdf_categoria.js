// Función modificada para NO mostrar la tabla, solo preparar los datos
function mostrarArticulos(articulos) {
    // Verificar si hay artículos
    if (articulos.length === 0) {
        alert('No se encontraron artículos para las categorías seleccionadas');
        return;
    }

    // Generar el PDF directamente sin mostrar la tabla
    generarPDF(articulos);
}

// La función generarPDF se mantiene EXACTAMENTE igual
function generarPDF(articulos) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const logo = 'https://i.postimg.cc/9MmZJx7v/logo.png';

    // Establecer colores
    const colorPrimario = [0, 51, 102];

    // Agregar encabezado
    doc.addImage(logo, 'JPEG', 10, 10, 30, 30);
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
    const pieY = doc.lastAutoTable.finalY + 10;
    doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
    doc.rect(0, pieY, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Documento generado el ${new Date().toLocaleDateString()}`, 105, pieY + 5, { align: 'center' });
    doc.text(`Total de artículos: ${articulos.length}`, 105, pieY + 10, { align: 'center' });

    // Descargar el PDF
    doc.save("articulos.pdf");
}

// El resto del código se mantiene IGUAL
document.getElementById('selectAll').addEventListener('change', function () {
    const checkboxes = document.querySelectorAll('#categoriesContainer .checkbox-custom');
    checkboxes.forEach(checkbox => {
        checkbox.checked = this.checked;
    });
});

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
    fetch('http://172.21.250.22:8000/inventario/articulos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categorias: selectedCategories })
    })
        .then(async response => {
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error desconocido');
            }

            if (!data.success) {
                throw new Error(data.error || 'Error en la respuesta del servidor');
            }

            return data.data;
        })
        .then(articulos => {
            mostrarArticulos(articulos);
        })
        .catch(error => {
            alert(`Error: ${error.message}`);
        })
        .finally(() => {
            this.innerHTML = btnOriginalHTML;
            this.disabled = false;
        });
});