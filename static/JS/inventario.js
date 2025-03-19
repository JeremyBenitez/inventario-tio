document.addEventListener('DOMContentLoaded', function () {
  const btnTodos = document.getElementById('btn-todos');
  const btnPrincipal = document.getElementById('btn-principal');
  const btnSecundario = document.getElementById('btn-secundario');

  // Evento para el botón "Todos"
  btnTodos.addEventListener('click', function () {
    filterRows('todos');
    setActiveButton(btnTodos);
  });

  // Evento para el botón "Depósito Principal"
  btnPrincipal.addEventListener('click', function () {
    filterRows('Principal');
    setActiveButton(btnPrincipal);
  });

  // Evento para el botón "Depósito Secundario"
  btnSecundario.addEventListener('click', function () {
    filterRows('Secundario');
    setActiveButton(btnSecundario);
  });

  // Función para filtrar las filas según el depósito
  function filterRows(deposito) {
    const rows = document.querySelectorAll('#tabla-inventario tbody tr'); // Seleccionar las filas de la tabla

    rows.forEach(row => {
      const rowDeposito = row.getAttribute('data-deposito'); // Obtener el valor de data-deposito
      if (deposito === 'todos' || rowDeposito === deposito) {
        row.style.display = ''; // Mostrar la fila
      } else {
        row.style.display = 'none'; // Ocultar la fila
      }
    });
  }

  // Función para resaltar el botón activo
  function setActiveButton(activeButton) {
    document.querySelectorAll('.deposito-btn').forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
  }

  // Llamada para obtener los productos
  obtenerProductos();
});

// Función para obtener los productos desde el backend
async function obtenerProductos() {
  try {
    const response = await fetch('http://localhost:3000/inventario/consultar');
    const productos = await response.json(); // Esperamos la respuesta en formato JSON

    const tbody = document.querySelector('#tabla-inventario tbody');
    tbody.innerHTML = ''; // Limpiamos el contenido previo de la tabla

    productos.forEach(producto => {
      const row = document.createElement('tr');
      row.setAttribute('data-deposito', producto.Deposito); // Atributo para el filtro por depósito

      row.innerHTML = `
        <td>${producto.ID}</td>
        <td>${producto.Nombre}</td>
        <td>${producto.Categoria}</td>
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

    agregarEventosBotones(); // Agregar los eventos de editar y eliminar
  } catch (error) {
    console.error('Error al obtener los productos:', error);
  }
}

// Agregar eventos para los botones de editar y eliminar
function agregarEventosBotones() {
  const editButtons = document.querySelectorAll('.edit-btn');
  const deleteButtons = document.querySelectorAll('.delete-btn');

  // Evento para el botón de editar
  editButtons.forEach(button => {
    button.addEventListener('click', function () {
      const productId = this.getAttribute('data-id');
      editarProducto(productId);
      console.log('productId:', productId);
    });

  });

  // Evento para el botón de eliminar
  deleteButtons.forEach(button => {
    button.addEventListener('click', function () {
      const productId = this.getAttribute('data-id');
      eliminarProducto(productId);
    });
  });
}


// Función para editar un producto
async function editarProducto(id) {
  try {
    const response = await fetch(`http://localhost:3000/inventario/consultar/${id}`);
    const producto = await response.json();
    console.log('Producto a editar:', producto);

    // Llenar el modal con los datos del producto
    document.getElementById('nombre').value = producto.Nombre;
    document.getElementById('categoria').value = producto.Categoria;
    document.getElementById('deposito').value = producto.Deposito;
    document.getElementById('stock').value = producto.Stock;
    document.getElementById('estado').value = producto.Estado;

    // Cambiar el título del modal y el texto del botón
    document.getElementById('modalAgregarItemLabel').textContent = 'Editar Producto';  // Título del modal
    document.getElementById('guardarBtn').textContent = 'Editar';  // Texto del botón

    // Crear un evento dinámico para el botón de guardar, asegurando que solo se dispara cuando sea necesario
    const guardarBtn = document.getElementById('guardarBtn');
    guardarBtn.onclick = async function (event) {
      event.preventDefault(); // Prevenir que recargue la página

      const nombre = document.getElementById('nombre').value;
      const categoria = document.getElementById('categoria').value;
      const deposito = document.getElementById('deposito').value;
      const stock = document.getElementById('stock').value;
      const estado = document.getElementById('estado').value;

      const productoActualizado = { nombre, categoria, deposito, stock, estado };

      try {
        const updateResponse = await fetch(`http://localhost:3000/inventario/actualizar/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productoActualizado)
        });

        const data = await updateResponse.json();
        if (updateResponse.ok) {
          alert(data.mensaje); // Mostrar mensaje de éxito
          obtenerProductos(); // Recargar los productos
          $('#modalAgregarItem').modal('hide'); // Cerrar el modal
        } else {
          alert(data.error || 'Error al editar el producto');
        }
      } catch (error) {
        console.error('Error al editar el producto:', error);
        alert('Ocurrió un error al editar el producto');
      }
    };

    // Mostrar el modal
    $('#modalAgregarItem').modal('show');
  } catch (error) {
    console.error('Error al obtener el producto para editar:', error);
  }
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
      const response = await fetch(`http://localhost:3000/inventario/eliminar/${id}`, {
        method: 'DELETE'
      });
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

  btnNuevoItem.addEventListener('click', function () {
    modal.show();
  });

  document.getElementById('formNuevoItem').onsubmit = function (event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const categoria = document.getElementById('categoria').value;
    const deposito = document.getElementById('deposito').value;
    const stock = document.getElementById('stock').value;
    const estado = document.getElementById('estado').value;

    const nuevoItem = { nombre, categoria, deposito, stock, estado };

    fetch('http://localhost:3000/inventario/agregar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoItem),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.mensaje);
        modal.hide();
        obtenerProductos(); // Recargar productos
      })
      .catch((error) => {
        console.error('Error al agregar el ítem:', error);
      });
  };
});
