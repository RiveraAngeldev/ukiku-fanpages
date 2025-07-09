document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = event.target.name.value.trim();
        const email = event.target.email.value.trim();
        const password = event.target.password.value.trim();

        if (!name || !email || !password) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];

        if (users.some(u => u.email === email)) {
            alert('El correo ya está registrado. Intenta con otro.');
            return;
        }

        users.push({ name, email, password });
        localStorage.setItem('registeredUsers', JSON.stringify(users));

        alert('Registro exitoso.');
        window.location.href = '/login.html';
    });
    document.getElementById('back-button').addEventListener('click', () => {
        window.history.back();
    });

    const fakeRegister = async (name, email, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (email !== 'ya-registrado@correo.com') {
                    resolve({ success: true });
                } else {
                    resolve({ success: false });
                }
            }, 1000);
        });
    };
});
