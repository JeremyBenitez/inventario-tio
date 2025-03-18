document.addEventListener('DOMContentLoaded', function () {
    const btnTodos = document.getElementById('btn-todos');
    const btnPrincipal = document.getElementById('btn-principal');
    const btnSecundario = document.getElementById('btn-secundario');
    const rows = document.querySelectorAll('tbody tr');

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
      rows.forEach(row => {
        const rowDeposito = row.getAttribute('data-deposito');
        if (deposito === 'todos' || rowDeposito === deposito) {
          row.style.display = ''; // Muestra la fila
        } else {
          row.style.display = 'none'; // Oculta la fila
        }
      });
    }

    // Función para resaltar el botón activo
    function setActiveButton(activeButton) {
      document.querySelectorAll('.deposito-btn').forEach(btn => btn.classList.remove('active'));
      activeButton.classList.add('active');
    }
  });