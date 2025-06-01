document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      alert(data.message);
      // Save user info in localStorage or sessionStorage if needed
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'dashboard.html'; // Redirect to dashboard after login
    } else {
      const errorData = await response.json();
      alert(errorData.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('An error occurred. Please try again later.');
  }
});
