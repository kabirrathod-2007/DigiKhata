// Theme Toggle Logic
const themeSelect = document.getElementById('theme-select');

// Check local storage for theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    themeSelect.value = 'light';
} else {
    themeSelect.value = 'dark';
}

themeSelect.addEventListener('change', (e) => {
    const selectedTheme = e.target.value;
    if (selectedTheme === 'light') {
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
    }
});

document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Demo validation check
    if (email !== 'kabirrathod2007@gmail.com' || password !== 'kabir@2007') {
        alert('wrong password / email');
        return;
    }

    const btn = document.getElementById('submit-btn');
    btn.classList.add('loading');

    // Simulate network request for demo purposes
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1200);
});
