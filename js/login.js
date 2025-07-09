document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = event.target.email.value.trim();
        const password = event.target.password.value.trim();

        if (!email || !password) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];

        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            alert(`Bienvenido, ${user.name}`);
            window.location.href = '/dashboard.html';
        } else {
            alert('Correo o contraseña incorrectos.');
        }
    });

    const fakeAuth = async (email, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (email === 'admin@ukiku.com' && password === 'password123') {
                    resolve({ success: true });
                } else {
                    resolve({ success: false });
                }
            }, 1000); 
        });
    };
});
