let editingTransactionId = null;

const user = JSON.parse(localStorage.getItem('user'));
if (!user) window.location.href = 'login.html';

const incomeSpan = document.getElementById('income');
const expenseSpan = document.getElementById('expense');
const balanceSpan = document.getElementById('balance');
const transactionList = document.getElementById('transactionList');
const form = document.getElementById('transactionForm');
const modal = document.getElementById('modal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModal = document.getElementById('closeModal');
const logoutBtn = document.getElementById('logoutBtn');

const API_URL = 'http://localhost:5000/api';

openModalBtn.onclick = () => {
  editingTransactionId = null;
  form.reset();
  modal.classList.remove('hidden');
};

closeModal.onclick = () => {
  editingTransactionId = null;
  modal.classList.add('hidden');
};

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('user');
  window.location.href = 'login.html';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value;
  const description = document.getElementById('description').value;
  const date = document.getElementById('date').value;

  if (editingTransactionId) {
    await fetch(`${API_URL}/transactions/update/${editingTransactionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, title, amount, type, category, description, date })
    });
    editingTransactionId = null;
  } else {
    await fetch(`${API_URL}/transactions/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, title, amount, type, category, description, date })
    });
  }

  modal.classList.add('hidden');
  form.reset();
  loadDashboard();
});

async function loadDashboard() {
  const [summaryRes, transactionsRes] = await Promise.all([
    fetch(`${API_URL}/transactions/summary/${user.id}`),
    fetch(`${API_URL}/transactions/${user.id}`)
  ]);

  const summary = await summaryRes.json();
  const transactions = await transactionsRes.json();

  incomeSpan.textContent = summary.totalIncome.toFixed(2);
  expenseSpan.textContent = summary.totalExpense.toFixed(2);
  balanceSpan.textContent = summary.balance.toFixed(2);

  transactionList.innerHTML = '';
  transactions.slice(-5).reverse().forEach(tx => {
    const li = document.createElement('li');
    li.classList.add('transaction-item');
    li.innerHTML = `
      <span>${tx.date} - ${tx.title} (${tx.category}): ₹${tx.amount} (${tx.type})</span>
      <div class="action-buttons">
        <button class="edit-btn">✏️</button>
        <button class="delete-btn">🗑️</button>
      </div>
    `;
    li.title = tx.description || '';

    // Event: Edit
    li.querySelector('.edit-btn').onclick = () => openEditModal(tx);

    // Event: Delete
    li.querySelector('.delete-btn').onclick = () => deleteTransaction(tx.id);

    transactionList.appendChild(li);
  });

  renderChart(summary.totalIncome, summary.totalExpense);
}

function openEditModal(tx) {
  editingTransactionId = tx.id;
  document.getElementById('title').value = tx.title;
  document.getElementById('amount').value = tx.amount;
  document.getElementById('type').value = tx.type;
  document.getElementById('category').value = tx.category;
  document.getElementById('description').value = tx.description;
  document.getElementById('date').value = tx.date;
  modal.classList.remove('hidden');
}

async function deleteTransaction(id) {
  const confirmDelete = confirm("Are you sure you want to delete this transaction?");
  if (!confirmDelete) return;

  await fetch(`${API_URL}/transactions/${id}`, {
    method: 'DELETE'
  });

  loadDashboard();
}

function renderChart(income, expense) {
  const ctx = document.getElementById('summaryChart').getContext('2d');
  if (window.chart) window.chart.destroy();
  window.chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: [income, expense],
        backgroundColor: ['#2ecc71', '#e74c3c']
      }]
    },
    options: {
      responsive: true
    }
  });
}

loadDashboard();
