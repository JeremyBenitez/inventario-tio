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

// Función para obtener los productos desde el backend
async function obtenerProductos() {
  try {
    const response = await fetch('http://localhost:3000/inventario/consultar');

    // Verificación adicional de respuesta
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const productos = await response.json();
    const tbody = document.querySelector('#tabla-inventario tbody');
    tbody.innerHTML = '';

    // Validación de datos básica
    if (!Array.isArray(productos)) {
      throw new Error('La respuesta no es un array de productos');
    }

    productos.forEach(producto => {
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
      } else if (estado === 'dañado' || estado === 'dañado') {
        estadoClass = 'status-damaged';
        estadoIcon = '<i class="fas fa-exclamation-triangle"></i>';
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

    agregarEventosBotones();
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    // Opcional: Mostrar notificación al usuario
    alert(`Error al cargar productos: ${error.message}`);
  }
}

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
    const id = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
    const nombre = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
    const categoria = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
    const deposito = row.querySelector('td:nth-child(4)').textContent.toLowerCase();

    if (
      id.includes(termino) ||
      nombre.includes(termino) ||
      categoria.includes(termino) ||
      deposito.includes(termino)
    ) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
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


// Modificar las funciones registrarRecepcion y registrarDespacho para incluir validaciones:

// Modificar la función registrarRecepcion
async function registrarRecepcion(id) {
  try {
    const response = await fetch(`http://localhost:3000/inventario/consultar/${id}`);
    const producto = await response.json();
    
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
              <label for="swal-deposito" class="form-label">Depósito</label>
              <input type="text" id="swal-deposito" class="swal2-input"
                     value="${producto.Deposito}" readonly>
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
        
        if (!cantidad || cantidad <= 0) {
          Swal.showValidationMessage('La cantidad debe ser mayor a 0');
          return false;
        }
        if (!fecha) {
          Swal.showValidationMessage('Debe seleccionar una fecha');
          return false;
        }
        
        // Modificar el objeto formValues
        return {
          inventario_id: id,
          descripcion: 'Recepción de productos', // ✅ Valor fijo o dinámico
          destino: 'Almacén central',
          cantidad: cantidad,
          deposito_destino: document.getElementById('swal-deposito').value, // ✅ Usar campo existente
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
            </div>
          `,
          confirmButtonColor: '#4CAF50',
          confirmButtonText: 'Aceptar'
        });
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
        const depositoOrigen = producto.Deposito; // ✅ Usar el depósito del producto
        
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
          deposito_origen: depositoOrigen // ✅ Valor obtenido del producto
        };
      }
    });

    if (formValues) {
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



