document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('close-btn');
    
    if (logoutButton) {
      logoutButton.addEventListener('click', async () => {
        // Confirmar cierre de sesión
        Swal.fire({
          title: '¿Cerrar sesión?',
          text: '¿Estás seguro que deseas cerrar sesión?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, cerrar sesión',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            // Redireccionar a la ruta de logout
            window.location.href = '/usuarios/logout';
          }
        });
      });
    }
  });