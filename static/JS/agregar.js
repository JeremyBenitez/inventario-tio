document.addEventListener('DOMContentLoaded', function () {
    // Función para actualizar iconos
    function updateIcons() {
        document.querySelectorAll('.form-floating').forEach(function (floating) {
            const input = floating.querySelector('.form-control, .form-select');
            const icon = floating.previousElementSibling;

            if (input && icon && icon.classList.contains('input-icon')) {
                // Verificar si el input tiene valor o está enfocado
                const hasValue = input.value ||
                    (input === document.activeElement) ||
                    (input.tagName === 'SELECT' && input.selectedIndex > 0);

                if (hasValue) {
                    icon.style.top = '18px';
                    icon.style.transform = 'translateY(0)';
                    icon.style.fontSize = '0.8rem';
                    icon.style.color = 'var(--primary-color)';
                } else {
                    icon.style.top = '50%';
                    icon.style.transform = 'translateY(-50%)';
                    icon.style.fontSize = '';
                    icon.style.color = 'var(--text-secondary)';
                }
            }
        });
    }

    // Actualizar al cargar
    updateIcons();

    // Event listeners para inputs
    document.querySelectorAll('.form-control, .form-select').forEach(function (input) {
        input.addEventListener('input', updateIcons);
        input.addEventListener('focus', updateIcons);
        input.addEventListener('blur', updateIcons);
        input.addEventListener('change', updateIcons);
    });

    // Validación y envío del formulario
    var forms = document.querySelectorAll('.needs-validation');

    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }

            // Obtener los datos del formulario
            const formData = {
                nombre: form.nombre.value,
                categoria: form.categoria.value,
                serial: form.serial.value,
                modelo: form.modelo.value,
                marca: form.marca.value,
                proveedor: form.proveedor.value,
                deposito: form.deposito.value,
                stock: form.stock.value,
                estado: form.estado.value
            };

            // Enviar los datos al servidor
            fetch('/agregar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(data => {
                showSuccessMessage();
                // Redirigir después de 3 segundos
                setTimeout(() => {
                    window.location.href = '/inventario';
                }, 3000);
            })
            .catch(error => {
                console.error('Error:', error);
                showErrorMessage(error.error || 'Error al agregar el producto');
            });

            form.classList.add('was-validated');
        }, false);
    });

    // Mostrar mensaje de éxito
    function showSuccessMessage() {
        const toastContainer = document.createElement('div');
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '1050';

        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.style.backgroundColor = '#fff';
        toast.style.minWidth = '300px';
        toast.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
        toast.style.borderRadius = '8px';
        toast.style.overflow = 'hidden';
        toast.style.borderTop = '3px solid var(--success-color)';

        toast.innerHTML = `
          <div class="toast-header" style="background-color: rgba(13, 144, 79, 0.1); color: var(--success-color); display: flex; justify-content: space-between; padding: 0.5rem 0.75rem;">
            <strong><i class="fas fa-check-circle me-2"></i>Éxito</strong>
            <button type="button" class="btn-close" onclick="this.parentElement.parentElement.parentElement.remove()"></button>
          </div>
          <div class="toast-body" style="padding: 0.75rem;">
            El ítem ha sido guardado correctamente.
          </div>
        `;

        toastContainer.appendChild(toast);
        document.body.appendChild(toastContainer);

        // Eliminar después de 5 segundos
        setTimeout(() => {
            toastContainer.remove();
        }, 3000);
    }

    // Mostrar mensaje de error
    function showErrorMessage(message) {
        const toastContainer = document.createElement('div');
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '1050';

        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.style.backgroundColor = '#fff';
        toast.style.minWidth = '300px';
        toast.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
        toast.style.borderRadius = '8px';
        toast.style.overflow = 'hidden';
        toast.style.borderTop = '3px solid var(--danger-color)';

        toast.innerHTML = `
          <div class="toast-header" style="background-color: rgba(220, 53, 69, 0.1); color: var(--danger-color); display: flex; justify-content: space-between; padding: 0.5rem 0.75rem;">
            <strong><i class="fas fa-exclamation-circle me-2"></i>Error</strong>
            <button type="button" class="btn-close" onclick="this.parentElement.parentElement.parentElement.remove()"></button>
          </div>
          <div class="toast-body" style="padding: 0.75rem;">
            ${message}
          </div>
        `;

        toastContainer.appendChild(toast);
        document.body.appendChild(toastContainer);

        // Eliminar después de 5 segundos
        setTimeout(() => {
            toastContainer.remove();
        }, 5000);
    }
});