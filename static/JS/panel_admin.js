        // Modal functions
        function openModal() {
            document.getElementById('editModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            document.getElementById('editModal').style.display = 'none';
            document.body.style.overflow = 'auto';
        }


        window.onclick = function(event) {
            const modal = document.getElementById('editModal');
            if (event.target == modal) {
                closeModal();
            }
        }

        // Toggle password visibility
        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const toggleIcon = document.querySelector('.password-toggle');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.classList.remove('fa-eye');
                toggleIcon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                toggleIcon.classList.remove('fa-eye-slash');
                toggleIcon.classList.add('fa-eye');
            }
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('editModal');
            if (event.target == modal) {
                closeModal();
            }
        }

        // Toggle sidebar on mobile
        function toggleSidebar() {
            document.querySelector('.sidebar').classList.toggle('active');
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