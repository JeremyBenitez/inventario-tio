document.addEventListener('DOMContentLoaded', function () {
    const formNuevoItem = document.getElementById('formNuevoItem');
    
    if (formNuevoItem) {
        formNuevoItem.addEventListener('submit', async function (event) {
            event.preventDefault();
            event.stopPropagation();

            // Validación del formulario
            if (!formNuevoItem.checkValidity()) {
                formNuevoItem.classList.add('was-validated');
                return;
            }

            // Mostrar spinner de carga
            const submitBtn = formNuevoItem.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            submitBtn.disabled = true;

            try {
                // Obtener los datos del formulario
                const nuevoItem = {
                    nombre: document.getElementById('nombre').value.trim(),
                    categoria: document.getElementById('categoria').value,
                    serial: document.getElementById('serial').value.trim(),
                    modelo: document.getElementById('modelo').value.trim(),
                    marca: document.getElementById('marca').value.trim(),
                    deposito: document.getElementById('deposito').value,
                    stock: parseInt(document.getElementById('stock').value, 10),
                    estado: document.getElementById('estado').value,
                    proveedor: document.getElementById('proveedor').value.trim()
                };

                // Enviar al servidor
                const response = await fetch('/inventario/agregar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevoItem)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error al agregar el ítem');
                }

                // Mostrar notificación de éxito
                showToast('success', '¡Éxito!', 'El ítem ha sido agregado correctamente');

                // Resetear formulario
                formNuevoItem.reset();
                formNuevoItem.classList.remove('was-validated');

                // Actualizar la lista de productos después de 2 segundos
                setTimeout(() => {
                    if (typeof obtenerProductos === 'function') {
                        obtenerProductos();
                    }
                }, 2000);

            } catch (error) {
                console.error('Error:', error);
                showToast('error', 'Error', error.message || 'Hubo un problema al agregar el ítem');
            } finally {
                // Restaurar el botón
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // Función para mostrar notificaciones
    function showToast(type, title, message) {
        const toastContainer = document.createElement('div');
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '1050';

        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        const color = type === 'success' ? 'var(--success-color)' : 'var(--danger-color)';
        const bgColor = type === 'success' ? 'rgba(13, 144, 79, 0.1)' : 'rgba(220, 53, 69, 0.1)';

        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.style.backgroundColor = '#fff';
        toast.style.minWidth = '300px';
        toast.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
        toast.style.borderRadius = '8px';
        toast.style.overflow = 'hidden';
        toast.style.borderTop = `3px solid ${color}`;

        toast.innerHTML = `
            <div class="toast-header" style="background-color: ${bgColor}; color: ${color}; display: flex; justify-content: space-between; padding: 0.5rem 0.75rem;">
                <strong><i class="fas ${icon} me-2"></i>${title}</strong>
                <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
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

    // Resto de tu código para manejar los iconos...
    function updateIcons() {
        document.querySelectorAll('.form-floating').forEach(function (floating) {
            const input = floating.querySelector('.form-control, .form-select');
            const icon = floating.previousElementSibling;

            if (input && icon && icon.classList.contains('input-icon')) {
                const hasValue = input.value || 
                               (input === document.activeElement) ||
                               (input.tagName === 'SELECT' && input.selectedIndex > 0);

                icon.style.top = hasValue ? '18px' : '50%';
                icon.style.transform = hasValue ? 'translateY(0)' : 'translateY(-50%)';
                icon.style.fontSize = hasValue ? '0.8rem' : '';
                icon.style.color = hasValue ? 'var(--primary-color)' : 'var(--text-secondary)';
            }
        });
    }

    // Inicializar y configurar event listeners para los iconos
    updateIcons();
    document.querySelectorAll('.form-control, .form-select').forEach(function (input) {
        input.addEventListener('input', updateIcons);
        input.addEventListener('focus', updateIcons);
        input.addEventListener('blur', updateIcons);
        input.addEventListener('change', updateIcons);
    });
});