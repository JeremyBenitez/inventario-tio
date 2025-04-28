document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll('#categoriesContainer .checkbox-custom');
    const selectAll = document.getElementById('selectAll');
    const exportBtn = document.getElementById('exportBtn');
    const categoryOptions = document.querySelectorAll('.category-option');
    const backButton = document.getElementById('backButton');
    
    // Manejar clic en las opciones
    categoryOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'LABEL') {
                const checkbox = this.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
                updateOptionStyle(this, checkbox.checked);
                updateExportButton();
                updateSelectAll();
            }
        });
    });
    
    // Manejar cambios en los checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const option = this.closest('.category-option');
            updateOptionStyle(option, this.checked);
            updateExportButton();
            updateSelectAll();
        });
    });
    
    // Manejar "Seleccionar todo"
    selectAll.addEventListener('change', function() {
        const isChecked = this.checked;
        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            const option = checkbox.closest('.category-option');
            updateOptionStyle(option, isChecked);
        });
        updateExportButton();
    });
    
    // Manejar botón de regreso
    backButton.addEventListener('click', function() {
        // Cambia esta URL por la ruta correcta de tu página de inicio
        window.location.href = '/inicio';
    });
    
    // Actualizar estilo de la opción
    function updateOptionStyle(option, isSelected) {
        option.classList.toggle('selected', isSelected);
    }
    
    // Actualizar botón de exportación
    function updateExportButton() {
        const selectedCount = document.querySelectorAll('#categoriesContainer .checkbox-custom:checked').length;
        exportBtn.disabled = selectedCount === 0;
    }
    
    // Actualizar "Seleccionar todo"
    function updateSelectAll() {
        const selectedCount = document.querySelectorAll('#categoriesContainer .checkbox-custom:checked').length;
        const totalCount = checkboxes.length;
        
        if (selectedCount === totalCount) {
            selectAll.checked = true;
            selectAll.indeterminate = false;
        } else if (selectedCount > 0) {
            selectAll.checked = false;
            selectAll.indeterminate = true;
        } else {
            selectAll.checked = false;
            selectAll.indeterminate = false;
        }
    }
    
    // Manejar exportación
    exportBtn.addEventListener('click', function() {
        const selectedCategories = [];
        document.querySelectorAll('#categoriesContainer .checkbox-custom:checked').forEach(checkbox => {
            selectedCategories.push(checkbox.nextElementSibling.textContent.trim());
        });
        
        // Simular exportación
        this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Preparando PDF...';
        
        setTimeout(() => {
            alert(`PDF generado con:\n${selectedCategories.join(', ')}`);
            this.innerHTML = '<i class="fas fa-file-pdf me-2"></i>Generar PDF';
        }, 1000);
    });
});