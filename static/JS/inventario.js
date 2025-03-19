document.addEventListener('DOMContentLoaded', function () {
  const btnsDepositos = document.querySelectorAll('.deposito-btn');
  const rows = document.querySelectorAll('tbody tr');

  // Configurar eventos para los botones de depósito
  btnsDepositos.forEach(btn => {
    btn.addEventListener('click', function () {
      const deposito = this.getAttribute('data-deposito') || 'todos';
      filterRows(deposito);
      setActiveButton(this);
    });
  });

  // Función para filtrar las filas según el depósito
  function filterRows(deposito) {
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
    tbody.innerHTML = ''; // Limpiamos el contenido previo

    productos.forEach(producto => {
      const row = document.createElement('tr');
      row.setAttribute('data-deposito', producto.Deposito);
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

    agregarEventosBotones();
  } catch (error) {
    console.error('Error al obtener los productos:', error);
  }
}

// Función para agregar eventos de editar y eliminar
function agregarEventosBotones() {
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', () => editarProducto(button.getAttribute('data-id')));
  });

  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', () => eliminarProducto(button.getAttribute('data-id')));
  });
}

// Función para editar un producto
async function editarProducto(id) {
  try {
    const response = await fetch(`http://localhost:3000/inventario/consultar/${id}`);
    const producto = await response.json();

    document.getElementById('nombre').value = producto.Nombre;
    document.getElementById('categoria').value = producto.Categoria;
    document.getElementById('deposito').value = producto.Deposito;
    document.getElementById('stock').value = producto.Stock;
    document.getElementById('estado').value = producto.Estado;

    document.getElementById('modalAgregarItemLabel').textContent = 'Editar Producto';
    const guardarBtn = document.getElementById('guardarBtn');
    guardarBtn.textContent = 'Editar';

    guardarBtn.replaceWith(guardarBtn.cloneNode(true)); // Evitar múltiples eventos
    document.getElementById('guardarBtn').addEventListener('click', async (event) => {
      event.preventDefault();
      await actualizarProducto(id);
    });

    new bootstrap.Modal(document.getElementById('modalAgregarItem')).show();
  } catch (error) {
    console.error('Error al obtener el producto para editar:', error);
    alert('Error al obtener los datos del producto');
  }
}

// Función para actualizar el producto
async function actualizarProducto(id) {
  const productoActualizado = {
    nombre: document.getElementById('nombre').value,
    categoria: document.getElementById('categoria').value,
    deposito: document.getElementById('deposito').value,
    stock: document.getElementById('stock').value,
    estado: document.getElementById('estado').value
  };

  try {
    const response = await fetch(`http://localhost:3000/inventario/actualizar/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productoActualizado)
    });
    const data = await response.json();

    if (response.ok) {
      alert(data.mensaje || 'Producto actualizado con éxito');
      obtenerProductos();
      new bootstrap.Modal(document.getElementById('modalAgregarItem')).hide();
    } else {
      alert(data.error || 'Error al editar el producto');
    }
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    alert('Ocurrió un error al actualizar el producto');
  }
}

// Función para eliminar un producto
async function eliminarProducto(id) {
  if (confirm('¿Estás seguro de eliminar este producto?')) {
    try {
      const response = await fetch(`http://localhost:3000/inventario/eliminar/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (response.ok) {
        alert(data.mensaje);
        obtenerProductos();
      } else {
        alert(data.error || 'Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
    }
  }
}

// Función para agregar un nuevo producto
document.addEventListener('DOMContentLoaded', function () {
  const modalElement = document.getElementById('modalAgregarItem');
  const modal = new bootstrap.Modal(modalElement);
  const btnNuevoItem = document.getElementById('nuevoItemBtn');

  btnNuevoItem.addEventListener('click', () => modal.show());

  document.getElementById('formNuevoItem').onsubmit = function (event) {
    event.preventDefault();

    const nuevoItem = {
      nombre: document.getElementById('nombre').value,
      categoria: document.getElementById('categoria').value,
      deposito: document.getElementById('deposito').value,
      stock: document.getElementById('stock').value,
      estado: document.getElementById('estado').value
    };

    fetch('http://localhost:3000/inventario/agregar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoItem)
    })
      .then(response => response.json())
      .then(data => {
        alert(data.mensaje);
        modal.hide();
        obtenerProductos();
      })
      .catch(error => {
        console.error('Error al agregar el ítem:', error);
      });
  };
});
