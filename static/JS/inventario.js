document.addEventListener('DOMContentLoaded', function () {
  const btnsDepositos = document.querySelectorAll('.deposito-btn-rediseno');

  // Configurar eventos para los botones de depósito
  btnsDepositos.forEach(btn => {
    btn.addEventListener('click', function () {
      const deposito = this.id === 'btn-todos' ? 'todos' : this.id === 'btn-principal' ? 'principal' : 'secundario';
      filterRows(deposito);
      setActiveButton(this);
    });
  });

  // Función para filtrar las filas según el depósito
  function filterRows(deposito) {
    const rows = document.querySelectorAll('#tabla-inventario tbody tr');
    rows.forEach(row => {
      const rowDeposito = row.getAttribute('data-deposito');
      row.style.display = (deposito === 'todos' || rowDeposito === deposito) ? '' : 'none';
    });
  }

  // Función para resaltar el botón activo
  function setActiveButton(activeButton) {
    btnsDepositos.forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
  }

  // Llamada inicial para obtener productos
  obtenerProductos();
});

let productos = [];


async function obtenerProductos() {
  try {
    const response = await fetch('http://localhost:3000/inventario/consultar');

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    productos = await response.json();

    // Validación de datos básica
    if (!Array.isArray(productos)) {
      throw new Error('La respuesta no es un array de productos');
    }

    mostrarProductos();
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    alert(`Error al cargar productos: ${error.message}`);
  }
}

function mostrarProductos() {
  const tbody = document.querySelector('#tabla-inventario tbody');
  tbody.innerHTML = '';

  // Ordenar los productos por ID descendente (últimos primero)
  const productosOrdenados = [...productos].sort((a, b) => b.ID - a.ID);

  productosOrdenados.forEach(producto => {
    const row = document.createElement('tr');

    // Manejo seguro de Depósito
    const deposito = producto.Deposito?.toLowerCase()?.replace(/\s+/g, '-') || 'sin-deposito';
    row.setAttribute('data-deposito', deposito);

    // Manejo seguro de Estado con valor por defecto
    const estado = producto.Estado?.toLowerCase() || 'desconocido';

    // Configuración de estilos según estado
    let estadoClass = 'status-new';
    let estadoIcon = '<i class="fas fa-certificate"></i>';

    if (estado === 'usado') {
      estadoClass = 'status-used';
      estadoIcon = '<i class="fas fa-history"></i>';
    } else if (estado === 'dañado') {
      estadoClass = 'status-damaged';
      estadoIcon = '<i class="fas fa-exclamation-triangle"></i>';
    } else if (estado === 'desconocido') {
      estadoClass = 'status-unknown';
      estadoIcon = '<i class="fas fa-question-circle"></i>';
    }

    // Template seguro con valores por defecto
    row.innerHTML = `
      <td>${producto.ID ?? 'N/A'}</td>
      <td>${producto.Nombre ?? 'Sin nombre'}</td>
      <td>${producto.Categoria ?? 'Sin categoría'}</td>
      <td>${producto.Serial ?? 'N/A'}</td>
      <td>${producto.Modelo ?? 'N/A'}</td>
      <td>${producto.Marca ?? 'N/A'}</td>
      <td>${producto.Deposito ?? 'No especificado'}</td>
      <td><span class="status ${estadoClass}">${estadoIcon}${producto.Estado ?? 'Desconocido'}</span></td>
      <td>${producto.Stock ?? '0'}</td>
      <td class="action-buttons">
        <div class="action-group">
          <button class="action-btn edit-btn" data-id="${producto.ID ?? ''}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" data-id="${producto.ID ?? ''}" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="action-group">
          <button class="action-btn receive-btn" data-id="${producto.ID ?? ''}" title="Registrar Recepción">
            <i class="fas fa-truck-loading"></i>
          </button>
          <button class="action-btn dispatch-btn" data-id="${producto.ID ?? ''}" title="Registrar Despacho">
            <i class="fas fa-shipping-fast"></i>
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(row);
  });

  // Llama a agregarEventosBotones después de llenar la tabla
  agregarEventosBotones();
}

// Llama a obtenerProductos al cargar la página
obtenerProductos();


function agregarEventosBotones() {
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', () => eliminarProducto(button.getAttribute('data-id')));
  });

  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', () => abrirModalEditar(button.getAttribute('data-id')));
  });

  // Agregar eventos para los nuevos botones
  document.querySelectorAll('.receive-btn').forEach(button => {
    button.addEventListener('click', () => registrarRecepcion(button.getAttribute('data-id')));
  });

  document.querySelectorAll('.dispatch-btn').forEach(button => {
    button.addEventListener('click', () => registrarDespacho(button.getAttribute('data-id')));
  });
}


// Función para eliminar un producto
async function eliminarProducto(id) {
  const confirmacion = await Swal.fire({
    title: '<i class="fas fa-trash" style="color: #e74c3c"></i> ¿Eliminar Producto?',
    html: `
      <div class="text-center" style="padding: 20px;">
        <div style="font-size: 5rem; color: #e74c3c; margin-bottom: 20px;">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <p style="font-size: 1.2rem; margin-bottom: 10px;">¿Estás seguro que deseas eliminar este producto?</p>
        <p style="color: #7f8c8d;">Esta acción no se puede deshacer y eliminará permanentemente el registro.</p>
      </div>
    `,
    background: '#f8f9fa',
    width: '600px',
    padding: '0',
    showCancelButton: true,
    confirmButtonColor: '#e74c3c',
    cancelButtonColor: '#95a5a6',
    confirmButtonText: '<i class="fas fa-trash"></i> Sí, eliminar',
    cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
    customClass: {
      popup: 'action-modal modal-eliminar',
      title: 'modal-title',
      confirmButton: 'btn-submit',
      cancelButton: 'btn-cancel'
    }
  });

  if (confirmacion.isConfirmed) {
    try {
      const response = await fetch(`http://localhost:3000/inventario/eliminar/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: '¡Eliminado!',
          text: data.mensaje,
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        obtenerProductos(); // Recargar productos
      } else {
        await Swal.fire({
          title: 'Error',
          text: data.error || 'Error al eliminar el producto',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al eliminar el producto',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  }
}

// Función para agregar un nuevo producto
document.addEventListener('DOMContentLoaded', function () {
  const modalElement = document.getElementById('modalAgregarItem');
  const modal = new bootstrap.Modal(modalElement);
  const btnNuevoItem = document.getElementById('nuevoItemBtn');

  btnNuevoItem.addEventListener('click', () => modal.show());

  document.getElementById('formNuevoItem').onsubmit = async function (event) {
    event.preventDefault();

    const nuevoItem = {
      nombre: document.getElementById('nombre').value,
      categoria: document.getElementById('categoria').value,
      serial: document.getElementById('serial').value,
      modelo: document.getElementById('modelo').value,
      marca: document.getElementById('marca').value,
      deposito: document.getElementById('deposito').value,
      stock: document.getElementById('stock').value,
      estado: document.getElementById('estado').value
    };

    try {
      const response = await fetch('http://localhost:3000/inventario/agregar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoItem)
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: '¡Éxito!',
          text: data.mensaje || 'Ítem agregado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });

        // Limpiar el formulario
        this.reset();

        modal.hide();
        obtenerProductos();
      } else {
        await Swal.fire({
          title: 'Error',
          text: data.error || 'Hubo un problema al agregar el ítem',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    } catch (error) {
      console.error('Error al agregar el ítem:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al agregar el ítem',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };
});

// Función para buscar productos
function buscarProductos(termino) {
  const rows = document.querySelectorAll('#tabla-inventario tbody tr');
  rows.forEach(row => {
    let encontrado = false;
    // Buscar en todas las celdas excepto en las acciones (última columna)
    const celdas = row.querySelectorAll('td:not(:last-child)');
    
    celdas.forEach(celda => {
      if (celda.textContent.toLowerCase().includes(termino)) {
        encontrado = true;
      }
    });
    
    row.style.display = encontrado ? '' : 'none';
  });
}

// Evento para el formulario de búsqueda
document.getElementById('formBuscar').addEventListener('submit', function (event) {
  event.preventDefault();
  const termino = document.getElementById('inputBuscar').value.toLowerCase();
  buscarProductos(termino);
});

// Evento para limpiar la búsqueda
document.getElementById('inputBuscar').addEventListener('input', function () {
  const termino = this.value.toLowerCase();
  if (termino === '') {
    const rows = document.querySelectorAll('#tabla-inventario tbody tr');
    rows.forEach(row => row.style.display = '');
  }
});

// Función para abrir el modal de edición
async function abrirModalEditar(id) {
  try {
    const response = await fetch(`http://localhost:3000/inventario/consultar/${id}`);
    const producto = await response.json();

    document.getElementById('editNombre').value = producto.Nombre;
    document.getElementById('editCategoria').value = producto.Categoria;
    document.getElementById('editSerial').value = producto.Serial;
    document.getElementById('editModelo').value = producto.Modelo;
    document.getElementById('editMarca').value = producto.Marca;
    document.getElementById('editDeposito').value = producto.Deposito;
    document.getElementById('editStock').value = producto.Stock;
    document.getElementById('editEstado').value = producto.Estado;

    const modalEditar = new bootstrap.Modal(document.getElementById('modalEditarItem'));
    modalEditar.show();

    document.getElementById('formEditarItem').onsubmit = async function (event) {
      event.preventDefault();

      const productoEditado = {
        nombre: document.getElementById('editNombre').value,
        categoria: document.getElementById('editCategoria').value,
        serial: document.getElementById('editSerial').value,
        modelo: document.getElementById('editModelo').value,
        marca: document.getElementById('editMarca').value,
        deposito: document.getElementById('editDeposito').value,
        stock: document.getElementById('editStock').value,
        estado: document.getElementById('editEstado').value
      };

      try {
        const response = await fetch(`http://localhost:3000/inventario/actualizar/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productoEditado)
        });

        const data = await response.json();

        if (response.ok) {
          await Swal.fire({
            title: '¡Éxito!',
            text: data.mensaje || 'Producto actualizado correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });

          modalEditar.hide();
          obtenerProductos();
        } else {
          await Swal.fire({
            title: 'Error',
            text: data.error || 'Hubo un problema al actualizar el producto',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      } catch (error) {
        console.error('Error al actualizar el producto:', error);
        await Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al actualizar el producto',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    };
  } catch (error) {
    console.error('Error al obtener los datos del producto:', error);
    await Swal.fire({
      title: 'Error',
      text: 'Hubo un problema al cargar los datos del producto',
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
  }
}

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

// Modificar la función registrarRecepcion
async function registrarRecepcion(id) {
  try {
    const response = await fetch(`http://localhost:3000/inventario/consultar/${id}`);
    const producto = await response.json();

    // Determinar el texto a mostrar basado en el depósito actual del producto
    let depositoMostrar;
    if (producto.Deposito.toLowerCase() === 'principal') {
      depositoMostrar = 'Depósito Principal';
    } else if (producto.Deposito.toLowerCase() === 'secundario') {
      depositoMostrar = 'Depósito Secundario';
    } else {
      depositoMostrar = producto.Deposito; // Por si acaso hay otros valores
    }

    const { value: formValues } = await Swal.fire({
      title: `<i class="fas fa-truck-loading"></i> Recepción`,
      html: `
        <div class="compact-form">
          <div class="form-row">
            <div class="form-group">
              <label for="swal-producto" class="form-label">Producto</label>
              <input type="text" id="swal-producto" class="swal2-input" 
                     value="${producto.Nombre}" readonly>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="swal-cantidad" class="form-label">Cantidad</label>
              <input type="number" id="swal-cantidad" class="swal2-input quantity-input" 
                     placeholder="Cantidad" value="1" min="1">
            </div>
            <div class="form-group">
              <label for="swal-deposito" class="form-label">Depósito Actual</label>
              <input type="text" id="swal-deposito" class="swal2-input"
                     value="${depositoMostrar}" readonly>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
                <label for="swal-fecha-recepcion" class="form-label">Fecha</label>
                <input type="date" id="swal-fecha-recepcion" class="swal2-input"
                      value="${new Date().toISOString().split('T')[0]}">
            </div>
          </div>
        </div>
      `,
      background: '#ffffff',
      width: '450px',
      padding: '0',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#2ecc71',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: '<i class="fas fa-save"></i> Registrar',
      cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
      customClass: {
        popup: 'compact-action-modal recepcion-modal',
        title: 'modal-title',
        confirmButton: 'btn-submit',
        cancelButton: 'btn-cancel',
        container: 'modal-container'
      },
      preConfirm: () => {
        const cantidad = document.getElementById('swal-cantidad').value;
        const fecha = document.getElementById('swal-fecha-recepcion').value;
        const productoNombre = document.getElementById('swal-producto').value;

        if (!cantidad || cantidad <= 0) {
          Swal.showValidationMessage('La cantidad debe ser mayor a 0');
          return false;
        }
        if (!fecha) {
          Swal.showValidationMessage('Debe seleccionar una fecha');
          return false;
        }

        return {
          inventario_id: id,
          descripcion: productoNombre,
          destino: depositoMostrar, // Enviamos el formato "Depósito X"
          cantidad: cantidad,
          deposito_destino: producto.Deposito, // Mantenemos el valor original para la BD
          fecha_recepcion: fecha
        };
      }
    });

    if (formValues) {
      // Mostrar animación de carga
      Swal.fire({
        title: 'Procesando recepción...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch('http://localhost:3000/inventario/guardar_recepcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: '<i class="fas fa-check-circle" style="color: #4CAF50"></i> Recepción Registrada',
          html: `
            <div style="text-align: center;">
              <p>${data.mensaje || 'La recepción se ha registrado correctamente'}</p>
              <div style="margin-top: 20px; font-size: 2em; color: #4CAF50;">
                <i class="fas fa-check-circle"></i>
              </div>
              <p style="margin-top: 10px; font-weight: bold;">Stock actualizado: ${parseInt(producto.Stock) + parseInt(formValues.cantidad)}</p>
              <p style="margin-top: 5px; color: #666;">Fecha: ${formValues.fecha_recepcion}</p>
              <p style="margin-top: 5px; color: #666;">Destino: ${formValues.destino}</p>
            </div>
          `,
          confirmButtonColor: '#4CAF50',
          confirmButtonText: 'Aceptar'
        });

       // Generar PDF elegante
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Configuración de colores corporativos
        const colorPrimario = [0, 51, 102]; // Azul corporativo oscuro (RGB)
        const colorSecundario = [128, 128, 128]; // Gris corporativo (RGB)

        // Encabezado con logo y título
        doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.rect(0, 0, 210, 30, 'F');

        // Título del documento
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.text('NOTA DE RECEPCIÓN', 105, 15, { align: 'center' });

        // Información de la empresa
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text('TIO AMMI', 105, 35, { align: 'center' });
        doc.setFontSize(8);
        doc.text('Sistema de Gestión de Inventario', 105, 40, { align: 'center' });

        // Línea separadora
        doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.setLineWidth(0.5);
        doc.line(20, 45, 190, 45);

        // Información del documento
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.text('INFORMACIÓN DE RECEPCIÓN', 20, 55);

        // Área de datos
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        // Construir tabla de información
        const startY = 65;
        const lineHeight = 8;
        const colWidth = 80;

        // Columna izquierda
        doc.setFont("helvetica", "bold");
        doc.text('Producto:', 20, startY);
        doc.text('Cantidad:', 20, startY + lineHeight);

        // Columna derecha (ahora un campo debajo del otro)
        doc.setFont("helvetica", "bold");
        doc.text('Fecha de Recepción:', 110, startY);
        doc.text('Destino:', 110, startY + lineHeight); // Ahora está una línea más abajo

        // Datos columna izquierda
        doc.setFont("helvetica", "normal");
        doc.text(producto.Nombre, 60, startY);
        doc.text(formValues.cantidad.toString(), 60, startY + lineHeight);

        // Datos columna derecha
        doc.setFont("helvetica", "normal");
        doc.text(formValues.fecha_recepcion, 150, startY);
        doc.text(formValues.destino, 150, startY + lineHeight); // Ahora está una línea más abajo

        // Sección de firmas - ahora colocadas justo antes del pie de página
        const firmasY = 240; // Nueva posición más cercana al pie de página

        // Línea separadora
        doc.setDrawColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
        doc.setLineWidth(0.3);
        doc.line(20, firmasY, 80, firmasY);
        doc.line(130, firmasY, 190, firmasY);

        // Textos de firma
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
        doc.text('Firma del Responsable', 50, firmasY + 5, { align: 'center' });
        doc.text('Firma de Recepción', 160, firmasY + 5, { align: 'center' });

        // Pie de página
        doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.rect(0, 275, 210, 22, 'F');

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text(`Documento generado el ${new Date().toLocaleDateString()}`, 105, 282, { align: 'center' });
        doc.text(`Registro N°: ${formValues.inventario_id}-${new Date().getTime().toString().slice(-6)}`, 105, 287, { align: 'center' });
        doc.text('DOCUMENTO VÁLIDO COMO COMPROBANTE INTERNO', 105, 292, { align: 'center' });

        // Marca de agua en capa de fondo con letra más pequeña y perfectamente centrada
        // Guardamos el estado actual del documento
        doc.saveGraphicsState();
        // Establecemos la opacidad para la marca de agua
        doc.setGState(new doc.GState({opacity: 0.1}));
        doc.setFont("helvetica", "bold");
        doc.setFontSize(55); // Tamaño ligeramente más pequeño
        doc.setTextColor(128, 128, 128); // Gris claro para el fondo
        // Posicionamos exactamente en el centro vertical y horizontal de la página (A4 = 210×297 mm)
        doc.text('RECEPCIÓN', 130, 200, { 
          align: 'center',
          angle: 45
        });
        // Restauramos el estado para que el resto del contenido tenga opacidad normal
        doc.restoreGraphicsState();

        // Guardar el PDF
        doc.save(`Nota_Recepcion_${producto.Nombre}_${formValues.fecha_recepcion}.pdf`);

        // Llamar a la función para obtener productos actualizados
        obtenerProductos();
      } else {
        throw new Error(data.error || 'Error al registrar la recepción');
      }
    }
  } catch (error) {
    await Swal.fire({
      title: '<i class="fas fa-exclamation-circle" style="color: #f44336"></i> Error',
      html: `
        <div style="text-align: center;">
          <p>${error.message || 'Hubo un problema al registrar la recepción'}</p>
          <div style="margin-top: 20px; font-size: 2em; color: #f44336;">
            <i class="fas fa-times-circle"></i>
          </div>
        </div>
      `,
      confirmButtonColor: '#f44336',
      confirmButtonText: 'Entendido'
    });
  }
}

async function registrarDespacho(id) {
  try {
    const response = await fetch(`http://localhost:3000/inventario/consultar/${id}`);
    const producto = await response.json();

    const { value: formValues } = await Swal.fire({
      title: `<i class="fas fa-shipping-fast"></i> Despacho`,
      html: `
        <div class="compact-form">
          <div class="form-row">
            <div class="form-group">
              <label for="swal-producto-despacho" class="form-label">Producto</label>
              <input type="text" id="swal-producto-despacho" class="swal2-input" 
                     value="${producto.Nombre} (Stock: ${producto.Stock})" readonly>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="swal-cantidad-despacho" class="form-label">Cantidad</label>
              <input type="number" id="swal-cantidad-despacho" class="swal2-input quantity-input" 
                     placeholder="Cantidad" value="1" min="1" max="${producto.Stock}">
            </div>
            <div class="form-group">
              <label for="swal-destino" class="form-label">Destino</label>
              <input type="text" id="swal-destino" class="swal2-input" 
                     placeholder="Departamento o persona">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="swal-fecha-despacho" class="form-label">Fecha</label>
              <input type="date" id="swal-fecha-despacho" class="swal2-input"
                     value="${new Date().toISOString().split('T')[0]}">
            </div>
          </div>
        </div>
      `,
      background: '#ffffff',
      width: '450px',
      padding: '0',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#e67e22',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: '<i class="fas fa-paper-plane"></i> Despachar',
      cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
      customClass: {
        popup: 'compact-action-modal despacho-modal',
        title: 'modal-title',
        confirmButton: 'btn-submit',
        cancelButton: 'btn-cancel',
        container: 'modal-container'
      },
      preConfirm: () => {
        const cantidad = document.getElementById('swal-cantidad-despacho').value;
        const destino = document.getElementById('swal-destino').value;
        const fecha = document.getElementById('swal-fecha-despacho').value;
        const depositoOrigen = producto.Deposito;

        if (!cantidad || cantidad <= 0) {
          Swal.showValidationMessage('La cantidad debe ser mayor a 0');
          return false;
        }
        if (cantidad > producto.Stock) {
          Swal.showValidationMessage(`No hay suficiente stock (disponible: ${producto.Stock})`);
          return false;
        }
        if (!destino) {
          Swal.showValidationMessage('Debe especificar un destino');
          return false;
        }
        if (!fecha) {
          Swal.showValidationMessage('Debe seleccionar una fecha');
          return false;
        }

        return {
          inventario_id: id,
          destinatario: destino,
          cantidad: cantidad,
          fecha_despacho: fecha,
          deposito_origen: depositoOrigen,
          descripcion: `Despacho de ${producto.Nombre}` // Agregamos el nombre del producto como descripción
        };
      }
    });

    if (formValues) {
      // Mostrar animación de carga
      // Mostrar animación de carga
      Swal.fire({
        title: 'Procesando despacho...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch('http://localhost:3000/inventario/guardar_despacho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: '<i class="fas fa-check-circle" style="color: #FF9800"></i> Despacho Registrado',
          html: `
            <div style="text-align: center;">
              <p>${data.mensaje || 'El despacho se ha registrado correctamente'}</p>
              <div style="margin-top: 20px; font-size: 2em; color: #FF9800;">
                <i class="fas fa-check-circle"></i>
              </div>
              <p style="margin-top: 10px; font-weight: bold;">Stock restante: ${parseInt(producto.Stock) - parseInt(formValues.cantidad)}</p>
              <p style="margin-top: 5px; color: #666;">Fecha: ${formValues.fecha_despacho}</p>
            </div>
          `,
          confirmButtonColor: '#FF9800',
          confirmButtonText: 'Aceptar'
        });

        /// Generar PDF elegante para Nota de Salida
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();

          // Configuración de colores corporativos
          const colorPrimario = [0, 51, 102]; // Azul corporativo oscuro (RGB)
          const colorSecundario = [128, 128, 128]; // Gris corporativo (RGB)

          // Encabezado con logo y título
          doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
          doc.rect(0, 0, 210, 30, 'F');

          // Título del documento
          doc.setFont("helvetica", "bold");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(20);
          doc.text('NOTA DE SALIDA', 105, 15, { align: 'center' });

          // Información de la empresa
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
          doc.text('TIO AMMI', 105, 35, { align: 'center' });
          doc.setFontSize(8);
          doc.text('Sistema de Gestión de Inventario', 105, 40, { align: 'center' });

          // Línea separadora
          doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
          doc.setLineWidth(0.5);
          doc.line(20, 45, 190, 45);

          // Información del documento
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
          doc.text('INFORMACIÓN DE DESPACHO', 20, 55);

          // Área de datos
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);

          // Construir tabla de información
          const startY = 65;
          const lineHeight = 8;
          const colWidth = 80;

          // Columna izquierda
          doc.setFont("helvetica", "bold");
          doc.text('Producto:', 20, startY);
          doc.text('Cantidad:', 20, startY + lineHeight);

          // Columna derecha
          doc.setFont("helvetica", "bold");
          doc.text('Fecha de Despacho:', 110, startY);
          doc.text('Destino:', 110, startY + lineHeight);

          // Datos columna izquierda
          doc.setFont("helvetica", "normal");
          // Garantizamos que los valores son strings
          doc.text(producto.Nombre || "", 60, startY);
          doc.text(String(formValues.cantidad || ""), 60, startY + lineHeight);

          // Datos columna derecha
          doc.setFont("helvetica", "normal");
          doc.text(String(formValues.fecha_despacho || ""), 150, startY);

          // Verificamos el valor del destino y lo mostramos
          console.log("Valor del destino en el modal:", formValues.destino);
          // Si el valor no existe, intentamos buscar otros posibles nombres de campo
          const destinoFinal = formValues.destinatario || formValues.destinoDespacho || formValues.lugarDestino || "";
          doc.text(String(destinoFinal), 150, startY + lineHeight);

          // Sección de firmas - ahora colocadas justo antes del pie de página
          const firmasY = 240; // Nueva posición más cercana al pie de página

          // Línea separadora
          doc.setDrawColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
          doc.setLineWidth(0.3);
          doc.line(20, firmasY, 80, firmasY);
          doc.line(130, firmasY, 190, firmasY);

          // Textos de firma
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
          doc.text('Firma del Responsable', 50, firmasY + 5, { align: 'center' });
          doc.text('Firma de Entrega', 160, firmasY + 5, { align: 'center' });

          // Pie de página
          doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
          doc.rect(0, 275, 210, 22, 'F');

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          doc.text(`Documento generado el ${new Date().toLocaleDateString()}`, 105, 282, { align: 'center' });
          doc.text(`Registro N°: ${String(formValues.inventario_id || "")}-${new Date().getTime().toString().slice(-6)}`, 105, 287, { align: 'center' });
          doc.text('DOCUMENTO VÁLIDO COMO COMPROBANTE INTERNO', 105, 292, { align: 'center' });

          // Marca de agua en capa de fondo con letra más pequeña y perfectamente centrada
          // Guardamos el estado actual del documento
          doc.saveGraphicsState();
          // Establecemos la opacidad para la marca de agua
          doc.setGState(new doc.GState({opacity: 0.1}));
          doc.setFont("helvetica", "bold");
          doc.setFontSize(55); // Tamaño ligeramente más pequeño
          doc.setTextColor(128, 128, 128); // Gris claro para el fondo
          // Posicionamos exactamente en el centro vertical y horizontal de la página (A4 = 210×297 mm)
          doc.text('DESPACHO', 130, 200, { 
            align: 'center',
            angle: 45
          });
          // Restauramos el estado para que el resto del contenido tenga opacidad normal
          doc.restoreGraphicsState();

          // Guardar el PDF
          doc.save(`Nota_Salida_${producto.Nombre}_${formValues.fecha_despacho}.pdf`);
        
        // Llamar a la función para obtener productos actualizados
        obtenerProductos();
      } else {
        throw new Error(data.error || 'Error al registrar el despacho');
      }
    }
  } catch (error) {
    await Swal.fire({
      title: '<i class="fas fa-exclamation-circle" style="color: #f44336"></i> Error',
      html: `
        <div style="text-align: center;">
          <p>${error.message || 'Hubo un problema al registrar el despacho'}</p>
          <div style="margin-top: 20px; font-size: 2em; color: #f44336;">
            <i class="fas fa-times-circle"></i>
          </div>
        </div>
      `,
      confirmButtonColor: '#f44336',
      confirmButtonText: 'Entendido'
    });
  }
}


document.getElementById('historialBtn').addEventListener('click', function () {
  // Redireccionar a la ruta de historial
  window.location.href = '/historial';
});


