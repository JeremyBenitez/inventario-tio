// Variables globales para el modo masivo
let modoMasivoActivo = false;
let seleccionados = new Set(); // Conjunto para guardar los IDs seleccionados
let productos = [];

const token = localStorage.getItem("token");
if (!token) window.location.href = "#"; // Redirige al login si no hay token

document.addEventListener('DOMContentLoaded', function () {
  // 1. Configuración de botones de depósito
  const btnsDepositos = document.querySelectorAll('.deposito-btn-rediseno');
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

  // 2. Configuración del formulario de búsqueda
  const formBuscar = document.getElementById('formBuscar');
  if (formBuscar) {
    formBuscar.addEventListener('submit', function (event) {
      event.preventDefault();
      const termino = document.getElementById('inputBuscar').value.toLowerCase();
      buscarProductos(termino);
    });
  }

  document.getElementById('inputBuscar').addEventListener('input', function () {
    const termino = this.value.toLowerCase();
    if (termino === '') {
      const rows = document.querySelectorAll('#tabla-inventario tbody tr');
      rows.forEach(row => row.style.display = '');
    }
  });

  // 3. Configuración del formulario de nuevo ítem
  const formNuevoItem = document.getElementById('formNuevoItem');
  if (formNuevoItem) {
    formNuevoItem.addEventListener('submit', async function (event) {
      event.preventDefault();

      // Validación manual para Bootstrap
      if (!formNuevoItem.checkValidity()) {
        formNuevoItem.classList.add('was-validated');
        return;
      }

      const nuevoItem = {
        nombre: document.getElementById('nombre').value.trim(),
        categoria: document.getElementById('categoria').value,
        serial: document.getElementById('serial').value.trim(),
        modelo: document.getElementById('modelo').value.trim(),
        marca: document.getElementById('marca').value.trim(),
        deposito: document.getElementById('deposito').value,
        proveedor: document.getElementById('proveedor').value.trim(),
        stock: parseInt(document.getElementById('stock').value, 10),
        estado: document.getElementById('estado').value
      };

      try {
        const response = await fetch('/inventario/agregar', {
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

          formNuevoItem.reset();
          formNuevoItem.classList.remove('was-validated');
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
    });
  }

  // 4. Configuración del botón de historial
  const historialBtn = document.getElementById('historialBtn');
  if (historialBtn) {
    historialBtn.addEventListener('click', function () {
      window.location.href = '/historial';
    });
  } else {
    console.warn('El botón de historial no fue encontrado');
  }

  // 5. Configuración del botón de cerrar sesión
  const closeBtn = document.getElementById('close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
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
            window.location.href = '/';
          }
        })
        .catch((error) => {
          console.error('Error al cerrar sesión:', error);
        });
    });
  }

  // 6. Inicialización de la selección masiva
  inicializarSeleccionMasiva();

  // 7. Obtener productos iniciales
  obtenerProductos();
});



async function obtenerProductos() {
  try {
    const response = await fetch('/inventario/consultar');

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
    // alert(`Error al cargar productos: ${error.message}`);
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
      <td>${producto.Proveedor}</td>
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
        
      </td>
    `;

    tbody.appendChild(row);
  });

  // Llama a agregarEventosBotones después de llenar la tabla
  agregarEventosBotones();

  //obtenerProductos();

}

// Función para inicializar el modo masivo
function inicializarModoMasivo () {
  const toggleBtn = document.getElementById('toggleModoMasivo');
  
  if (toggleBtn) {
    const newToggleBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
    
    newToggleBtn.addEventListener('click', function() {
      modoMasivoActivo = !modoMasivoActivo;
      seleccionados.clear(); // Limpiar selecciones anteriores
      
      // Actualizar apariencia del botón
      if (modoMasivoActivo) {
        newToggleBtn.classList.add('active');
        newToggleBtn.innerHTML = '<i class="fas fa-check-square"></i> Modo Selección Activo';
      } else {
        newToggleBtn.classList.remove('active');
        newToggleBtn.innerHTML = '<i class="fas fa-square"></i> Modo Selección';
      }
      
      // Actualizar la tabla para el modo masivo
      actualizarTablaModoMasivo();
    });
  } else {
    console.error('El botón con id "toggleModoMasivo" no existe en el documento.');
  }
}

// Función para actualizar la tabla según el modo masivo
function actualizarTablaModoMasivo() {
  const tbody = document.querySelector('#tabla-inventario tbody');
  const filas = tbody.querySelectorAll('tr');
  
  filas.forEach(fila => {
    // Eliminar cualquier evento anterior para evitar duplicados
    fila.removeEventListener('click', handleFilaClick);
    
    if (modoMasivoActivo) {
      // Agregar clase para indicar que el modo masivo está activo
      fila.classList.add('seleccion-masiva-disponible');
      
      // Agregar evento de clic a la fila
      fila.addEventListener('click', handleFilaClick);
      
      // Ocultar botones de acción
      const actionButtons = fila.querySelectorAll('.action-buttons .action-btn');
      actionButtons.forEach(btn => {
        btn.style.display = 'none';
      });
      
      // Mostrar checkbox de selección
      const actionCell = fila.querySelector('.action-buttons');
      if (actionCell) {
        // Verificar si ya existe un checkbox para evitar duplicados
        if (!actionCell.querySelector('.checkbox-seleccion')) {
          const checkbox = document.createElement('div');
          checkbox.classList.add('checkbox-seleccion');
          checkbox.innerHTML = '<i class="far fa-square"></i>';
          actionCell.appendChild(checkbox);
        }
      }
    } else {
      // Quitar clase de modo masivo
      fila.classList.remove('seleccion-masiva-disponible');
      fila.classList.remove('seleccionado');
      
      // Mostrar botones de acción de nuevo
      const actionButtons = fila.querySelectorAll('.action-buttons .action-btn');
      actionButtons.forEach(btn => {
        btn.style.display = '';
      });
      
      // Eliminar checkbox de selección
      const checkbox = fila.querySelector('.checkbox-seleccion');
      if (checkbox) {
        checkbox.remove();
      }
    }
  });
  
  // Si se desactiva el modo masivo, mostrar botones y ocultar batones de acción masiva
  const accionesMasivas = document.getElementById('accionesMasivas');
  if (accionesMasivas) {
    accionesMasivas.style.display = modoMasivoActivo ? 'flex' : 'none';
  }
}

// Manejador de eventos para el clic en filas
function handleFilaClick(event) {
  if (!modoMasivoActivo) return;
  
  const fila = event.currentTarget;
  const idProducto = fila.querySelector('td:first-child').textContent;
  
  // Toggle de la selección
  if (seleccionados.has(idProducto)) {
    seleccionados.delete(idProducto);
    fila.classList.remove('seleccionado');
    fila.querySelector('.checkbox-seleccion').innerHTML = '<i class="far fa-square"></i>';
  } else {
    seleccionados.add(idProducto);
    fila.classList.add('seleccionado');
    fila.querySelector('.checkbox-seleccion').innerHTML = '<i class="fas fa-check-square"></i>';
  }
  
  // Actualizar contador de seleccionados
  actualizarContadorSeleccionados();
}

// Función para actualizar el contador de elementos seleccionados
function actualizarContadorSeleccionados() {
  const contador = document.getElementById('contadorSeleccionados');
  if (contador) {
    contador.textContent = seleccionados.size;
  }
}

// Función para obtener los IDs seleccionados (para usar en acciones masivas)
function obtenerSeleccionados() {
  return Array.from(seleccionados);
}

// Función para agregar el HTML necesario para las acciones masivas
function agregarHTMLAccionesMasivas() {
  const tablaContainer = document.querySelector('#tabla-inventario').parentElement;
  
  // Crear el elemento de acciones masivas si no existe
  if (!document.getElementById('accionesMasivas')) {
    const accionesMasivas = document.createElement('div');
    accionesMasivas.id = 'accionesMasivas';
    accionesMasivas.innerHTML = `
      <div class="contador-container">
        <span id="contadorSeleccionados">0</span> elementos seleccionados
      </div>
      <div class="botones-accion-masiva">
        <button id="despachoMasivo" class="btn-accion-masiva">
          <i class="fas fa-shipping-fast"></i> Despacho Masivo
        </button>
        <button id="recepcionMasiva" class="btn-accion-masiva">
          <i class="fas fa-truck-loading"></i> Recepción Masiva
        </button>
      </div>
    `;
    accionesMasivas.style.display = 'none';
    tablaContainer.insertBefore(accionesMasivas, document.querySelector('#tabla-inventario'));
  }
  
  // Crear modales para acciones masivas si no existen
  if (!document.getElementById('modalDespachoMasivo')) {
    const modalDespacho = document.createElement('div');
    modalDespacho.id = 'modalDespachoMasivo';
    modalDespacho.className = 'modal';
    modalDespacho.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <span class="close-modal">&times;</span>
          <h2>Despacho Masivo</h2>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="fechaDespacho">Fecha:</label>
            <input type="date" id="fechaDespacho" class="form-control" value="${obtenerFechaActual()}">
          </div>
          <div class="form-group">
            <label>Elementos seleccionados:</label>
            <div id="listaElementosDespacho" class="elementos-seleccionados"></div>
          </div>
          <div class="form-group">
            <label for="destinoDespacho">Destino:</label>
            <input type="text" id="destinoDespacho" class="form-control" placeholder="Ingrese el destino">
          </div>
        </div>
        <div class="modal-footer">
          <button id="confirmarDespacho" class="btn-confirmar">Confirmar Despacho</button>
          <button class="btn-cancelar close-modal">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalDespacho);
  }
  
  if (!document.getElementById('modalRecepcionMasiva')) {
    const modalRecepcion = document.createElement('div');
    modalRecepcion.id = 'modalRecepcionMasiva';
    modalRecepcion.className = 'modal';
    modalRecepcion.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <span class="close-modal">&times;</span>
          <h2>Recepción Masiva</h2>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="fechaRecepcion">Fecha:</label>
            <input type="date" id="fechaRecepcion" class="form-control" value="${obtenerFechaActual()}">
          </div>
          <div class="form-group">
            <label>Elementos seleccionados:</label>
            <div id="listaElementosRecepcion" class="elementos-seleccionados"></div>
          </div>
          <div class="form-group">
            <label for="origenRecepcion">Origen:</label>
            <input type="text" id="origenRecepcion" class="form-control" placeholder="Ingrese el origen">
          </div>
           <div class="form-group">
            <label for="proveedor">Proveedor:</label>
            <input type="text" id="proveedorRecepcion2" class="form-control" placeholder="Ingrese el proveedor">
          </div>
        </div>
        <div class="modal-footer">
          <button id="confirmarRecepcion" class="btn-confirmar">Confirmar Recepción</button>
          <button class="btn-cancelar close-modal">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalRecepcion);
    // Enlazar evento al botón de Confirmar Recepción
    const confirmarRecepcionBtn = document.getElementById('confirmarRecepcion');
    if (!confirmarRecepcionBtn.hasAttribute('data-click-registered')) {
      confirmarRecepcionBtn.setAttribute('data-click-registered', 'true');
    }
  }
}

// Función para obtener la fecha actual en formato YYYY-MM-DD
function obtenerFechaActual() {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

// Función para agregar los estilos CSS necesarios
function agregarEstilosModoMasivo() {
  if (!document.getElementById('estilosModoMasivo')) {
    const estilos = document.createElement('style');
    estilos.id = 'estilosModoMasivo';
    estilos.textContent = `
      .seleccion-masiva-disponible {
        cursor: pointer;
      }
      
      .seleccion-masiva-disponible:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
      
      .seleccionado {
        background-color: rgba(66, 135, 245, 0.15) !important;
      }
      
      #toggleModoMasivo {
        padding: 8px 12px;
        background-color: #f1f1f1;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
      }
      
      #toggleModoMasivo.active {
        background-color: #4287f5;
        color: white;
        border-color: #3273dc;
      }
      
      #accionesMasivas {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #f8f9fa;
        padding: 10px 15px;
        border-radius: 4px;
        margin-bottom: 10px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .contador-container {
        font-weight: bold;
      }
      
      #contadorSeleccionados {
        color: #4287f5;
        font-size: 1.2em;
      }
      
      .btn-accion-masiva {
        padding: 6px 12px;
        margin-left: 8px;
        background-color: #4287f5;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .btn-accion-masiva:hover {
        background-color: #3273dc;
      }
      
      .checkbox-seleccion {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.2em;
        color: #4287f5;
      }
      
      /* Estilos para los modales */
      .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
      }
      
      .modal-content {
        position: relative;
        background-color: #fff;
        margin: 10% auto;
        padding: 0;
        border-radius: 8px;
        width: 60%;
        max-width: 700px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: modalFadeIn 0.3s;
      }
      
      @keyframes modalFadeIn {
        from {opacity: 0; transform: translateY(-30px);}
        to {opacity: 1; transform: translateY(0);}
      }
      
      .modal-header {
        padding: 15px 20px;
        background-color: #4287f5;
        color: white;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
      }
      
      .modal-header h2 {
        margin: 0;
        font-size: 1.5em;
      }
      
      .modal-body {
        padding: 20px;
        max-height: 60vh;
        overflow-y: auto;
      }
      
      .modal-footer {
        padding: 15px 20px;
        background-color: #f8f9fa;
        border-top: 1px solid #ddd;
        display: flex;
        justify-content: flex-end;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
      }
      
      .close-modal {
        color: white;
        float: right;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
      }
      
      .close-modal:hover {
        color: #f8f9fa;
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      .form-control {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .btn-confirmar {
        padding: 8px 16px;
        background-color: #28a745;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      }
      
      .btn-confirmar:hover {
        background-color: #218838;
      }
      
      .btn-cancelar {
        padding: 8px 16px;
        background-color: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-left: 10px;
      }
      
      .btn-cancelar:hover {
        background-color: #c82333;
      }
      
      .elementos-seleccionados {
        max-height: 150px;
        overflow-y: auto;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 10px;
        margin-top: 5px;
      }
      
      .item-seleccionado {
        padding: 8px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .item-seleccionado:last-child {
        border-bottom: none;
      }
      
      .cantidad-input {
        width: 60px;
        padding: 4px 6px;
        border: 1px solid #ddd;
        border-radius: 4px;
        text-align: center;
      }
    `;
    document.head.appendChild(estilos);
  }
}

// Función para agregar eventos a los botones de acciones masivas
function agregarEventosBotonesAccionesMasivas() {
  const btnDespachoMasivo = document.getElementById('despachoMasivo');
  const btnRecepcionMasiva = document.getElementById('recepcionMasiva');
  
  // Eventos para cerrar los modales
  document.querySelectorAll('.close-modal').forEach(elem => {
    elem.addEventListener('click', function() {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
      });
    });
  });
  
  // Cerrar el modal si se hace clic fuera de él
  window.addEventListener('click', function(event) {
    document.querySelectorAll('.modal').forEach(modal => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
  
  if (btnDespachoMasivo) {
    btnDespachoMasivo.addEventListener('click', function() {
      const seleccionadosArray = obtenerSeleccionados();
      
      if (seleccionadosArray.length === 0) {
        mostrarAlertaSinSeleccion('despacho');
        return;
      }
      
      // Mostrar los elementos seleccionados en el modal
      mostrarElementosSeleccionadosDespacho(seleccionadosArray);
      
      // Mostrar el modal de despacho
      document.getElementById('modalDespachoMasivo').style.display = 'block';
    });
  }
  
  if (btnRecepcionMasiva) {
    btnRecepcionMasiva.addEventListener('click', function() {
      const seleccionadosArray = obtenerSeleccionados();
      
      if (seleccionadosArray.length === 0) {
        mostrarAlertaSinSeleccion('recepcion');
        return;
      }
      
      // Mostrar los elementos seleccionados en el modal
      mostrarElementosSeleccionadosRecepcion(seleccionadosArray);
      
      // Mostrar el modal de recepción
      document.getElementById('modalRecepcionMasiva').style.display = 'block';
    });
  }
  
  // Nueva función para mostrar alerta cuando no hay selección
function mostrarAlertaSinSeleccion(accion) {
  const titulos = {
    'despacho': 'Despacho Masivo',
    'recepcion': 'Recepción Masiva'
  };
  
  const iconos = {
    'despacho': 'fas fa-shipping-fast',
    'recepcion': 'fas fa-truck-loading'
  };
  
  const colores = {
    'despacho': '#e67e22',
    'recepcion': '#2ecc71'
  };
  
  Swal.fire({
    title: `<i class="${iconos[accion]}" style="color: ${colores[accion]}; font-size: 2.5rem;"></i>`,
    html: `
      <div style="text-align: center; margin-top: 20px;">
        <h3 style="color: #333; margin-bottom: 15px;">${titulos[accion]}</h3>
        <p style="color: #666; font-size: 1.1rem;">No has seleccionado ningún elemento</p>
        <div style="margin-top: 25px; animation: bounce 2s infinite;">
          <i class="fas fa-mouse-pointer" style="font-size: 3rem; color: ${colores[accion]};"></i>
        </div>
        <p style="color: #888; margin-top: 20px; font-size: 0.9rem;">Selecciona uno o más items para continuar</p>
      </div>
    `,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: 'Entendido',
    cancelButtonColor: colores[accion],
    background: '#ffffff',
    width: '450px',
    customClass: {
      popup: 'animated fadeIn'
    },
    willOpen: () => {
      // Agregar animación de rebote al icono
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
          40% {transform: translateY(-20px);}
          60% {transform: translateY(-10px);}
        }
      `;
      document.head.appendChild(style);
    }
  });
}
 
  // Evento para confirmar el despacho
  const btnConfirmarDespacho = document.getElementById('confirmarDespacho');
  if (btnConfirmarDespacho) {
    btnConfirmarDespacho.addEventListener('click', function() {
      procesarDespachoMasivo();
    });
  }
  
  // Evento para confirmar la recepción
  const btnConfirmarRecepcion = document.getElementById('confirmarRecepcion');
  if (btnConfirmarRecepcion) {
    btnConfirmarRecepcion.addEventListener('click', function() {
      procesarRecepcionMasiva();
    });
  }
}

// Función para mostrar los elementos seleccionados en el modal de despacho
function mostrarElementosSeleccionadosDespacho(seleccionadosArray) {
  const contenedor = document.getElementById('listaElementosDespacho');
  contenedor.innerHTML = '';
  
  seleccionadosArray.forEach(id => {
    const producto = buscarProductoPorId(id);
    if (producto) {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'item-seleccionado';
      itemDiv.innerHTML = `
        <div>
          <strong>${producto.Nombre}</strong> 
        </div>
        <div>
          <label>Cantidad: </label>
          <input type="number" class="cantidad-input" data-id="${producto.ID}" value="1" min="1" max="${producto.Stock}">
        </div>
      `;
      contenedor.appendChild(itemDiv);
    }
  });
}

// Función para mostrar los elementos seleccionados en el modal de recepción
function mostrarElementosSeleccionadosRecepcion(seleccionadosArray) {
  const contenedor = document.getElementById('listaElementosRecepcion');
  contenedor.innerHTML = '';
  
  seleccionadosArray.forEach(id => {
    const producto = buscarProductoPorId(id);
    if (producto) {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'item-seleccionado';
      itemDiv.innerHTML = `
        <div>
          <strong>${producto.Nombre}</strong>
        </div>
        <div>
          <label>Cantidad: </label>
          <input type="number" class="cantidad-input" data-id="${producto.ID}" value="1" min="1">
        </div>
      `;
      contenedor.appendChild(itemDiv);
    }
  });
}

// Función para buscar un producto por su ID
function buscarProductoPorId(id) {
  return productos.find(p => p.ID == id);
}

z
// Función para procesar el despacho masivo
async function procesarDespachoMasivo() {
  const fecha = document.getElementById('fechaDespacho').value;
  const destino = document.getElementById('destinoDespacho').value;
  
  if (!destino) {
    alert('Por favor ingrese un destino para el despacho.');
    return;
  }

  const despachos = [];
  
  document.querySelectorAll('#listaElementosDespacho .cantidad-input').forEach(input => {
    const id = input.getAttribute('data-id');
    const cantidad = parseInt(input.value);
    
    if (cantidad > 0) {
      const producto = buscarProductoPorId(id);
      despachos.push({
        id: id,
        nombre: producto.Nombre,
        cantidad: cantidad,
        fecha: fecha,
        destino: destino,
        deposito_origen: producto.Deposito
      });
    }
  });

  try {
    // Mostrar animación de carga
    Swal.fire({
      title: 'Procesando despacho masivo...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Enviar cada despacho individualmente al servidor
    for (const despacho of despachos) {
      const response = await fetch('/inventario/guardar_despacho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventario_id: despacho.id,
          fecha_despacho: despacho.fecha,
          destinatario: despacho.destino,
          cantidad: despacho.cantidad,
          descripcion: `${despacho.nombre}`,
          deposito_origen: despacho.deposito_origen
        })
      });

      if (!response.ok) {
        throw new Error('Error al registrar uno o más despachos');
      }
    }

    // Cerrar el modal después de procesar
    document.getElementById('modalDespachoMasivo').style.display = 'none';
    
    // Mostrar mensaje de éxito
    await Swal.fire({
      title: '¡Éxito!',
      text: `Se han registrado ${despachos.length} despachos hacia ${destino}`,
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });

    // Desactivar el modo masivo después de completar la acción
    const toggleBtn = document.getElementById('toggleModoMasivo');
    if (toggleBtn && modoMasivoActivo) {
      toggleBtn.click();
    }

    // Actualizar la lista de productos
    obtenerProductos();

  } catch (error) {
    await Swal.fire({
      title: 'Error',
      text: error.message || 'Hubo un problema al registrar los despachos',
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
  }
}


// Función para procesar la recepción masiva
async function procesarRecepcionMasiva() {
  console.log('>> Ejecutando procesarRecepcionMasiva()');

  // Obtener los valores de los inputs con los IDs correctos
  const fecha = document.getElementById('fechaRecepcion').value;
  const origen = document.getElementById('origenRecepcion').value.trim();
  const proveedor = document.getElementById('proveedorRecepcion2').value.trim();

  // Validaciones
  if (!origen) {
    alert('Por favor ingrese un origen para la recepción.');
    return;
  }

  if (!proveedor) {
    alert('Por favor ingrese el proveedor.');
    return;
  }

  const recepciones = [];

  document.querySelectorAll('#listaElementosRecepcion .cantidad-input').forEach(input => {
    const id = input.getAttribute('data-id');
    const cantidad = parseInt(input.value);

    if (cantidad > 0) {
      const producto = buscarProductoPorId(id);
      recepciones.push({
        id: id,
        nombre: producto.Nombre,
        cantidad: cantidad,
        fecha: fecha,
        origen: origen,
        deposito_destino: producto.Deposito,
        proveedor: proveedor
      });
    }
  });

  if (recepciones.length === 0) {
    alert('No se han seleccionado productos para recepción.');
    return;
  }

  try {
    // Mostrar animación de carga
    Swal.fire({
      title: 'Procesando recepción masiva...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Enviar cada recepción individualmente al servidor
    for (const recepcion of recepciones) {
      const response = await fetch('http://172.21.250.22:5000/inventario/guardar_recepcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventario_id: recepcion.id,
          fecha_recepcion: fecha,
          descripcion: recepcion.nombre,
          destino: recepcion.deposito_destino,
          deposito_destino: recepcion.deposito_destino,
          cantidad: recepcion.cantidad,
          proveedor: proveedor
        })
      });

      if (!response.ok) {
        console.error('Respuesta del servidor:', await response.text());
        throw new Error('Error al registrar una o más recepciones');
      }
    }

    // Cerrar el modal después de procesar
    document.getElementById('modalRecepcionMasiva').style.display = 'none';

    // Mostrar mensaje de éxito
    await Swal.fire({
      title: '¡Éxito!',
      text: `Se han registrado ${recepciones.length} recepciones desde ${origen}`,
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });

    // Actualizar la lista de productos
    obtenerProductos();

    // Generar PDF solo una vez aquí
    generarPDFRecepcion(recepciones, origen, fecha, proveedor);

  } catch (error) {
    await Swal.fire({
      title: 'Error',
      text: error.message || 'Hubo un problema al registrar las recepciones',
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
  }
}

// Elimina la segunda definición de procesarRecepcionMasiva() que aparece más abajo en tu código

function generarPDFRecepcion(recepciones, origen, fecha, proveedor) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const logo = 'https://i.postimg.cc/9MmZJx7v/logo.png';

  const colorPrimario = [0, 51, 102];
  const colorSecundario = [128, 128, 128];

  doc.setFillColor('#dfe7f2');
  doc.rect(0, 0, 210, 30, 'F');

  doc.addImage(logo, 'JPEG', 30, 2, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor('black');
  doc.setFontSize(20);
  doc.text('NOTA DE RECEPCIÓN', 105, 15, { align: 'center' });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('TIO AMMI', 105, 35, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Sistema de Gestión de Inventario', 105, 40, { align: 'center' });

  doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
  doc.text('INFORMACIÓN DE RECEPCIÓN', 20, 55);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const startY = 65;
  const lineHeight = 8;

  doc.setFont("helvetica", "bold");
  doc.text('Producto', 20, startY);
  doc.text('Cantidad', 100, startY);
  doc.text('Origen', 130, startY);
  doc.text('Proveedor', 160, startY);

  let currentY = startY + lineHeight;
  recepciones.forEach(recepcion => {
    doc.setFont("helvetica", "normal");
    doc.text(recepcion.nombre, 20, currentY);
    doc.text(recepcion.cantidad.toString(), 100, currentY);
    doc.text(recepcion.origen, 130, currentY);
    doc.text(recepcion.proveedor, 160, currentY);
    currentY += lineHeight;
  });

  doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
  doc.setLineWidth(0.5);
  doc.line(20, currentY, 190, currentY);

  const pieY = 297 - 22;

  doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
  doc.rect(0, pieY, 210, 22, 'F');

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Documento generado el ${new Date().toLocaleDateString()}`, 105, pieY + 7, { align: 'center' });
  doc.text(`Registro N°: ${new Date().getTime().toString().slice(-6)}`, 105, pieY + 12, { align: 'center' });
  doc.text('DOCUMENTO VÁLIDO COMO COMPROBANTE INTERNO', 105, pieY + 17, { align: 'center' });

  // Marca de agua (sin GState para compatibilidad)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(55);
  doc.setTextColor(180, 180, 180);
  doc.text('RECEPCIÓN', 105, 150, { align: 'center' });

  doc.save(`Nota_Recepcion_${origen}_${fecha}_${proveedor}.pdf`);
}


// Modificar la función mostrarProductos para que aplique el modo masivo

// function mostrarProductos() {
//   const tbody = document.querySelector('#tabla-inventario tbody');
//   tbody.innerHTML = '';

//   // Ordenar los productos por ID descendente (últimos primero)
//   const productosOrdenados = [...productos].sort((a, b) => b.ID - a.ID);

//   productosOrdenados.forEach(producto => {
//     const row = document.createElement('tr');

//     // Manejo seguro de Depósito
//     const deposito = producto.Deposito?.toLowerCase()?.replace(/\s+/g, '-') || 'sin-deposito';
//     row.setAttribute('data-deposito', deposito);

//     // Manejo seguro de Estado con valor por defecto
//     const estado = producto.Estado?.toLowerCase() || 'desconocido';
//     // Manejo seguro de Estado con valor por defecto
//     const proveedor = producto.proveedor?.toLowerCase() || 'desconocido';

//     // Configuración de estilos según estado
//     let estadoClass = 'status-new';
//     let estadoIcon = '<i class="fas fa-certificate"></i>';

//     if (estado === 'usado') {
//       estadoClass = 'status-used';
//       estadoIcon = '<i class="fas fa-history"></i>';
//     } else if (estado === 'dañado') {
//       estadoClass = 'status-damaged';
//       estadoIcon = '<i class="fas fa-exclamation-triangle"></i>';
//     } else if (estado === 'desconocido') {
//       estadoClass = 'status-unknown';
//       estadoIcon = '<i class="fas fa-question-circle"></i>';
//     }

//     // Template seguro con valores por defecto
//     row.innerHTML = `
//       <td>${producto.ID ?? 'N/A'}</td>
//       <td>${producto.Nombre ?? 'Sin nombre'}</td>
//       <td>${producto.Categoria ?? 'Sin categoría'}</td>
//       <td>${producto.Serial ?? 'N/A'}</td>
//       <td>${producto.Modelo ?? 'N/A'}</td>
//       <td>${producto.Marca ?? 'N/A'}</td>
//       <td>${producto.Deposito ?? 'No especificado'}</td>
//       <td><span class="status ${estadoClass}">${estadoIcon}${producto.Estado ?? 'Desconocido'}</span></td>
//       <td>${producto.Stock ?? '0'}</td>
//        <td>${producto.Proveedor ?? '0'}</td>
//       <td class="action-buttons">
//         <div class="action-group">
//           <button class="action-btn edit-btn" data-id="${producto.ID ?? ''}" title="Editar">
//             <i class="fas fa-edit"></i>
//           </button>
//           <button class="action-btn delete-btn" data-id="${producto.ID ?? ''}" title="Eliminar">
//             <i class="fas fa-trash"></i>
//           </button>
//         </div>
        
//       </td>
//     `;

//     tbody.appendChild(row);
//   });

//   // Llama a agregarEventosBotones después de llenar la tabla
//   agregarEventosBotones();
  
//   // Si el modo masivo está activo, actualiza la tabla
//   if (modoMasivoActivo) {
//     actualizarTablaModoMasivo();
//   }
// }

// Función para inicializar todo el modo masivo
function inicializarSeleccionMasiva() {
  agregarHTMLAccionesMasivas();
  agregarEstilosModoMasivo();
  inicializarModoMasivo();
  agregarEventosBotonesAccionesMasivas();
}


function agregarEventosBotones() {
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', () => eliminarProducto(button.getAttribute('data-id')));
  });

  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', () => abrirModalEditar(button.getAttribute('data-id')));
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
      const response = await fetch(`/inventario/eliminar/${id}`, { method: 'DELETE' });
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

// Función para abrir el modal de edición
async function abrirModalEditar(id) {
  if (!id) {
    console.error('Se intentó abrir el modal de edición sin un ID válido');
    return;
  }
  
  try {
    const response = await fetch(`/inventario/consultar/${id}`);
    const producto = await response.json();

    // Llenar el formulario
    document.getElementById('editNombre').value = producto.Nombre;
    document.getElementById('editCategoria').value = producto.Categoria;
    document.getElementById('editSerial').value = producto.Serial;
    document.getElementById('editModelo').value = producto.Modelo;
    document.getElementById('editMarca').value = producto.Marca;
    document.getElementById('editDeposito').value = producto.Deposito;
    document.getElementById('editStock').value = producto.Stock;
    document.getElementById('editEstado').value = producto.Estado;
    document.getElementById('editproveedor').value = producto.proveedor;

    // Mostrar el modal
    const modalElement = document.getElementById('modalEditarItem');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      
      // Limpiar cualquier manejador previo
      const formEditar = document.getElementById('formEditarItem');
      formEditar.onsubmit = null;
      
      // Asignar nuevo manejador
      formEditar.onsubmit = async function(event) {
        event.preventDefault();

        const productoEditado = {
          nombre: document.getElementById('editNombre').value,
          categoria: document.getElementById('editCategoria').value,
          serial: document.getElementById('editSerial').value,
          modelo: document.getElementById('editModelo').value,
          marca: document.getElementById('editMarca').value,
          deposito: document.getElementById('editDeposito').value,
          stock: document.getElementById('editStock').value,
          estado: document.getElementById('editEstado').value,
          proveedor: document.getElementById('editproveedor').value
        };

        try {
          const response = await fetch(`/inventario/actualizar/${id}`, {
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

            modal.hide();
            obtenerProductos();
          } else {
            throw new Error(data.error || 'Hubo un problema al actualizar el producto');
          }
        } catch (error) {
          console.error('Error al actualizar el producto:', error);
          await Swal.fire({
            title: 'Error',
            text: error.message || 'Hubo un problema al actualizar el producto',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      };
      
      modal.show();
    }
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

function handleDespachoMasivo() {
  const seleccionadosArray = obtenerSeleccionados();
  
  if (seleccionadosArray.length === 0) {
    mostrarAlertaSinSeleccion('despacho');
    return;
  }
  
  mostrarElementosSeleccionadosDespacho(seleccionadosArray);
  document.getElementById('modalDespachoMasivo').style.display = 'block';
}

let despachoEnProceso = false;

async function procesarDespachoMasivo() {
  const fecha = document.getElementById('fechaDespacho').value;
  const destino = document.getElementById('destinoDespacho').value;

  if (!destino) {
    alert('Por favor ingrese un destino para el despacho.');
    return;
  }

  const despachos = [];

  document.querySelectorAll('#listaElementosDespacho .cantidad-input').forEach(input => {
    const id = input.getAttribute('data-id');
    const cantidad = parseInt(input.value);

    if (cantidad > 0) {
      const producto = buscarProductoPorId(id);
      despachos.push({
        id: id,
        nombre: producto.Nombre,
        cantidad: cantidad,
        fecha: fecha,
        destino: destino,
        deposito_origen: producto.Deposito
      });
    }
  });

  try {
    // Mostrar animación de carga
    Swal.fire({
      title: 'Procesando despacho masivo...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Enviar cada despacho individualmente al servidor
    for (const despacho of despachos) {
      const response = await fetch('/inventario/guardar_despacho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventario_id: despacho.id,
          fecha_despacho: despacho.fecha,
          destinatario: despacho.destino,
          cantidad: despacho.cantidad,
          descripcion: `${despacho.nombre}`,
          deposito_origen: despacho.deposito_origen
        })
      });

      if (!response.ok) {
        throw new Error('Error al registrar uno o más despachos');
      }
    }

    // Cerrar el modal después de procesar
    document.getElementById('modalDespachoMasivo').style.display = 'none';

    // Mostrar mensaje de éxito
    await Swal.fire({
      title: '¡Éxito!',
      text: `Se han registrado ${despachos.length} despachos hacia ${destino}`,
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });

    // Generar PDF con el resumen de despachos
    generarPDF(despachos, destino, fecha);

    // Desactivar el modo masivo después de completar la acción
    const toggleBtn = document.getElementById('toggleModoMasivo');
    if (toggleBtn && modoMasivoActivo) {
      toggleBtn.click();
    }

    // Actualizar la lista de productos
    obtenerProductos();

  } catch (error) {
    await Swal.fire({
      title: 'Error',
      text: error.message || 'Hubo un problema al registrar los despachos',
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
  }
}

function generarPDF(despachos, destino, fecha) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const logo = 'https://i.postimg.cc/9MmZJx7v/logo.png';



  // Título del documento
  doc.addImage(logo, 'JPEG', 30, 2, 20, 20,);
  // Configuración de colores corporativos
  const colorPrimario = [0, 51, 102]; // Azul corporativo oscuro (RGB)
  const colorSecundario = [128, 128, 128]; // Gris corporativo (RGB)

  // Encabezado con título
  doc.setFillColor('#dfe7f2');
  doc.rect(0, 0, 210, 30, 'F');


  // Título del documento
  doc.setFont("helvetica", "bold");
  doc.setTextColor('black');
  doc.setFontSize(20);
  doc.addImage(logo, 'JPEG', 30, 2, 20, 20,);
  doc.text('NOTA DE DESPACHO', 105, 15, { align: 'center' });

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

  // Encabezados de la tabla
  doc.setFont("helvetica", "bold");
  doc.text('Producto', 20, startY);
  doc.text('Cantidad', 100, startY);
  doc.text('Destino', 160, startY);

  // Datos de los despachos
  let currentY = startY + lineHeight;
  despachos.forEach(despacho => {
    doc.setFont("helvetica", "normal");
    doc.text(despacho.nombre, 20, currentY);
    doc.text(despacho.cantidad.toString(), 100, currentY);
    doc.text(despacho.destino, 160, currentY);
    currentY += lineHeight;
  });

  // Línea separadora antes del pie de página
  doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
  doc.setLineWidth(0.5);
  doc.line(20, currentY, 190, currentY);

  // Pie de página
  const pieY = 297 - 22; // 297 mm (altura total de A4) menos 22 mm (altura del pie de página)

  doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
  doc.rect(0, pieY, 210, 22, 'F');

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Documento generado el ${new Date().toLocaleDateString()}`, 105, pieY + 7, { align: 'center' });
  doc.text(`Registro N°: ${new Date().getTime().toString().slice(-6)}`, 105, pieY + 12, { align: 'center' });
  doc.text('DOCUMENTO VÁLIDO COMO COMPROBANTE INTERNO', 105, pieY + 17, { align: 'center' });

  // Marca de agua
  // Marca de agua
  doc.saveGraphicsState();
  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(55);
  doc.setTextColor(128, 128, 128);
  doc.text('DESPACHO', 105, 150, { align: 'center', angle: 45 });
  doc.restoreGraphicsState();

  // Guardar el PDF
  doc.save(`Nota_Despacho_${destino}_${fecha}.pdf`);
}

// Inicializar la selección masiva cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  inicializarSeleccionMasiva();
});