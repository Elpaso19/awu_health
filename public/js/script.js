// Handling login and registration with validation

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/enter-details';
            } else {
                alert('Invalid login');
            }
        });
});

// Animate page load
window.addEventListener('load', function() {
    gsap.from(document.body, { opacity: 0, duration: 1 });
});


// Handle page routing and transitions with animations
document.querySelectorAll('.navbar a').forEach((link) => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetPage = this.getAttribute('href');

        // Animate the transition
        gsap.to(document.body, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                window.location.href = targetPage;
            }
        });
    });
});