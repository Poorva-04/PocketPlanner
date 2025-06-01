let editingTransactionId = null;
const user = JSON.parse(localStorage.getItem('user'));
if (!user) window.location.href = 'login.html';

const API_URL = 'http://localhost:5000/api';

const incomeSpan = document.getElementById('income');
const expenseSpan = document.getElementById('expense');
const balanceSpan = document.getElementById('balance');

const openModalBtn = document.getElementById('openModalBtn');
const closeModal = document.getElementById('closeModal');
const modal = document.getElementById('modal');
const form = document.getElementById('transactionForm');
const logoutBtn = document.getElementById('logoutBtn');
const transactionList = document.getElementById('transactionList');

openModalBtn.onclick = () => {
  modal.classList.remove('hidden');
  form.reset();
  editingTransactionId = null;
};

closeModal.onclick = () => modal.classList.add('hidden');

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('user');
  window.location.href = 'login.html';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = form.title.value.trim();
  const amount = parseFloat(form.amount.value);
  const type = form.type.value;
  const category = form.category.value.trim();
  const description = form.description.value.trim();
  const date = form.date.value;

  if (!title || isNaN(amount) || !date) {
    alert('Please fill all required fields.');
    return;
  }

  const payload = { title, amount, type, category, description, date };

  try {
    if (editingTransactionId) {
      await fetch(`${API_URL}/transactions/${editingTransactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`${API_URL}/transactions/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, ...payload }),
      });
    }

    modal.classList.add('hidden');
    form.reset();
    loadTransactions();
  } catch (err) {
    console.error('Error saving transaction:', err);
  }
});

async function loadTransactions() {
  try {
    const summaryRes = await fetch(`${API_URL}/transactions/summary/${user.id}`);
    const transactionsRes = await fetch(`${API_URL}/transactions/${user.id}`);
    const summary = await summaryRes.json();
    const transactions = await transactionsRes.json();

    renderChart(summary.totalIncome, summary.totalExpense);
    renderTransactions(transactions);
  } catch (err) {
    console.error('Error loading transactions:', err);
  }
}

function groupByDate(transactions) {
  const map = {};
  transactions.forEach(tx => {
    if (!map[tx.date]) map[tx.date] = [];
    map[tx.date].push(tx);
  });
  return map;
}

function renderTransactions(transactions) {
  transactionList.innerHTML = '';
  const grouped = groupByDate(transactions);

  Object.keys(grouped).sort((a, b) => b.localeCompare(a)).forEach(date => {
    const group = grouped[date];
    const groupEl = document.createElement('div');
    groupEl.classList.add('date-group');
    const header = document.createElement('h4');
    header.textContent = date;
    groupEl.appendChild(header);

    group.forEach(tx => {
      const item = document.createElement('div');
      item.classList.add('transaction-item');

      const details = document.createElement('div');
      details.classList.add('transaction-details');
      details.innerHTML = `<strong>₹${tx.amount}</strong> ${tx.title} (${tx.category})`;

      const actions = document.createElement('div');
      actions.classList.add('actions');

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.classList.add('edit');
      editBtn.onclick = () => {
        editingTransactionId = tx.id;
        form.title.value = tx.title;
        form.amount.value = tx.amount;
        form.type.value = tx.type;
        form.category.value = tx.category;
        form.description.value = tx.description;
        form.date.value = tx.date;
        modal.classList.remove('hidden');
      };

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.classList.add('delete');
      delBtn.onclick = async () => {
        await fetch(`${API_URL}/transactions/${tx.id}`, { method: 'DELETE' });
        loadTransactions();
      };

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      item.appendChild(details);
      item.appendChild(actions);
      groupEl.appendChild(item);
    });

    transactionList.appendChild(groupEl);
  });
}

function renderChart(income, expense) {
  const ctx = document.getElementById('transactionChart').getContext('2d');

  // ✅ Safely destroy existing chart
  if (window.transactionChart && typeof window.transactionChart.destroy === 'function') {
    window.transactionChart.destroy();
  }

  // ✅ Create new chart
  window.transactionChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        label: 'Summary',
        data: [income, expense],
        backgroundColor: ['#2ecc71', '#e74c3c'],
        borderColor: ['#27ae60', '#c0392b'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Income vs Expense'
        }
      }
    }
  });
}


loadTransactions();
