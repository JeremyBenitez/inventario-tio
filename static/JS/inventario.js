document.addEventListener('DOMContentLoaded', function () {
  const btnsDepositos = document.querySelectorAll('.deposito-btn');

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
    const productos = await response.json();
    const tbody = document.querySelector('#tabla-inventario tbody');
    tbody.innerHTML = ''; // Limpiar contenido previo

    productos.forEach(producto => {
      const row = document.createElement('tr');
      row.setAttribute('data-deposito', producto.Deposito.toLowerCase());
      row.innerHTML = `
        <td>${producto.ID}</td>
        <td>${producto.Nombre}</td>
        <td>${producto.Categoria}</td>
        <td>${producto.Serial}</td>
        <td>${producto.Modelo}</td>
        <td>${producto.Marca}</td>
        <td>${producto.Deposito}</td>
        <td>${producto.Stock}</td>
        <td><span class="status status-new">${producto.Estado}</span></td>
        <td>
          <button class="action-btn edit-btn" data-id="${producto.ID}"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete-btn" data-id="${producto.ID}"><i class="fas fa-trash"></i></button>
        </td>
      `;
      tbody.appendChild(row);
    });

    agregarEventosBotones();
  } catch (error) {
    console.error('Error al obtener los productos:', error);
  }
}

// Función para agregar eventos de editar y eliminar
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
    title: '¿Estás seguro?',
    text: "¡No podrás revertir esto!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
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




