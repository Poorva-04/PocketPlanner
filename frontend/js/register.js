document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      alert(data.message);
      window.location.href = 'login.html'; // Redirect to login after successful registration
    } else {
      const errorData = await response.json();
      alert(errorData.error || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert('An error occurred. Please try again later.');
  }
});
