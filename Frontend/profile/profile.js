// 1. Efecto de transparencia en el Navbar al hacer scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = '#040714';
        navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
    } else {
        navbar.style.backgroundColor = 'transparent';
        navbar.style.borderBottom = '1px solid transparent';
    }
});

// 2. Simulación de botones "Cambiar" (Email y Contraseña)
const changeButtons = document.querySelectorAll('.btn-link');

changeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const type = e.target.parentElement.querySelector('.detail-label').innerText;
        alert(`Disney+ enviará un código de verificación a tu correo para cambiar tu ${type}.`);
    });
});

// 3. Confirmación de Cierre de Sesión
const btnDanger = document.querySelector('.btn-danger');

btnDanger.addEventListener('click', () => {
    const confirmar = confirm("¿Estás seguro de que quieres cerrar sesión en todos tus dispositivos?");
    if (confirmar) {
        alert("Cerrando sesión...");
        // Aquí podrías redirigir a una página de login:
        // window.location.href = 'login.html';
    }
});

// 4. Animación al entrar a la página (opcional)
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.settings-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease-out';

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });
});