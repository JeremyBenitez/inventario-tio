
// Agregar este script después de Bootstrap
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
});

// Validación del formulario
(function () {
    'use strict'

    var forms = document.querySelectorAll('.needs-validation')

    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                } else {
                    // Aquí podemos agregar un toast de confirmación
                    event.preventDefault()
                    showSuccessMessage()
                }

                form.classList.add('was-validated')
            }, false)
        })

    // Añadir toast de confirmación
    function showSuccessMessage() {
        // Crear el elemento toast
        const toastContainer = document.createElement('div')
        toastContainer.style.position = 'fixed'
        toastContainer.style.bottom = '20px'
        toastContainer.style.right = '20px'
        toastContainer.style.zIndex = '1050'

        const toast = document.createElement('div')
        toast.className = 'toast show'
        toast.style.backgroundColor = '#fff'
        toast.style.minWidth = '300px'
        toast.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
        toast.style.borderRadius = '8px'
        toast.style.overflow = 'hidden'
        toast.style.borderTop = '3px solid var(--success-color)'

        toast.innerHTML = `
          <div class="toast-header" style="background-color: rgba(13, 144, 79, 0.1); color: var(--success-color); display: flex; justify-content: space-between; padding: 0.5rem 0.75rem;">
            <strong><i class="fas fa-check-circle me-2"></i>Éxito</strong>
            <button type="button" class="btn-close" onclick="this.parentElement.parentElement.parentElement.remove()"></button>
          </div>
          <div class="toast-body" style="padding: 0.75rem;">
            El ítem ha sido guardado correctamente.
          </div>
        `

        toastContainer.appendChild(toast)
        document.body.appendChild(toastContainer)

        // Eliminar después de 5 segundos
        setTimeout(() => {
            toastContainer.remove()
            window.location.href = '/inventario'
        }, 3000)
    }
})()
