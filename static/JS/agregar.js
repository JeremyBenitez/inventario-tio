// Validación del formulario
(function () {
    "use strict";

    var forms = document.querySelectorAll(".needs-validation");

    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener(
            "submit",
            function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                } else {
                    // Aquí podemos agregar un toast de confirmación
                    event.preventDefault();
                    showSuccessMessage();
                }

                form.classList.add("was-validated");
            },
            false
        );
    });

    // Añadir toast de confirmación
    function showSuccessMessage() {
        // Crear el elemento toast
        const toastContainer = document.createElement("div");
        toastContainer.style.position = "fixed";
        toastContainer.style.bottom = "20px";
        toastContainer.style.right = "20px";
        toastContainer.style.zIndex = "1050";

        const toast = document.createElement("div");
        toast.className = "toast show";
        toast.style.backgroundColor = "#fff";
        toast.style.minWidth = "300px";
        toast.style.boxShadow = "0 0.5rem 1rem rgba(0, 0, 0, 0.15)";
        toast.style.borderRadius = "8px";
        toast.style.overflow = "hidden";
        toast.style.borderTop = "3px solid var(--success-color)";

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
            window.location.href = "/inventario";
        }, 3000);
    }
})();
