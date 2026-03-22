// ✅ Helper to get user_id safely
function getUserId() {
  const id = localStorage.getItem("user_id");
  if (!id) {
    window.location.href = "login.html"; // redirect if not logged in
    return null;
  }
  return Number(id);
}

// ====================== EXPENSE FUNCTIONS ======================

async function addexp(description0, amount0, category0) {
  const user_id = getUserId();
  if (!user_id) return;

  try {
    await fetch("http://127.0.0.1:8000/exp/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: description0,
        amount: amount0,
        category: category0,
        user_id
      })
    });
  } catch (error) {
    console.error("Error adding expense:", error);
  }
}

async function deleteexp(delID) {
  const user_id = getUserId();
  if (!user_id) return;

  try {
    const response = await fetch("http://127.0.0.1:8000/delete/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: delID, user_id })
    });
    const data = await response.json();
    console.log("Deleted:", data);
  } catch (error) {
    console.error("Error deleting:", error);
  }
}

async function updatecard(editID, newdis, newcate, newamou) {
  const user_id = getUserId();
  if (!user_id) return;

  try {
    const response = await fetch("http://127.0.0.1:8000/update/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editID,
        newdescription: newdis,
        newamount: newamou,
        newcategory: newcate,
        user_id
      })
    });
    const data = await response.json();
    console.log("Updated:", data);
  } catch (error) {
    console.error("Error updating:", error);
  }
}

async function getdata(recdash) {
  const user_id = getUserId();
  if (!user_id) return;

  try {
    const response = await fetch(`http://127.0.0.1:8000/see/${user_id}`);
    const data = await response.json();

    const html = data.map(e => `
      <div class="card">
        <span class="id">${e.id}</span>
        <div class="exp-title">
          <span class="dis">Description: <span class="disvalue">${e.description}</span></span>
          <span class="amou">Amount: <span class="amouvalue">${e.amount}</span></span>
          <button class="del">DELETE</button>
        </div>
        <div class="catego">Category:<span class="catevalue">${e.category}</span></div>
        <button class="edit">EDIT</button>
      </div>
    `).join('');

    recdash.innerHTML = html;

    // Card toggles
    recdash.querySelectorAll(".card").forEach(card => {
      card.addEventListener("click", () => {
        if (card.classList.contains("editing")) return;
        card.classList.toggle("see");
      });
    });

    // Delete buttons
    recdash.querySelectorAll(".del").forEach(button => {
      button.addEventListener("click", e => {
        e.stopPropagation();
        const delID = button.closest(".card").querySelector(".id").textContent.trim();
        deleteexp(delID);
      });
    });

    // Edit buttons
    recdash.querySelectorAll(".edit").forEach(button => {
      button.addEventListener("click", async e => {
        e.stopPropagation();
        const card = button.closest(".card");
        const id = card.querySelector(".id").textContent.trim();
        const dis = card.querySelector(".disvalue");
        const amou = card.querySelector(".amouvalue");
        const cate = card.querySelector(".catevalue");

        if (button.textContent.trim() === "EDIT") {
          dis.innerHTML = `<input type="text" value="${dis.textContent.trim()}">`;
          amou.innerHTML = `<input type="number" value="${amou.textContent.trim()}">`;
          cate.innerHTML = `<input type="text" value="${cate.textContent.trim()}">`;
          button.textContent = "SAVE";
        } else {
          const newdis = dis.querySelector("input").value.trim();
          const newamou = Number(amou.querySelector("input").value);
          const newcate = cate.querySelector("input").value.trim();

          if (isNaN(newamou)) {
            alert("Amount must be a number");
            return;
          }

          await updatecard(Number(id), newdis, newcate, newamou);

          dis.textContent = newdis;
          amou.textContent = newamou;
          cate.textContent = newcate;
          button.textContent = "EDIT";
          alert("Expense updated!");
        }
      });
    });

  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// ====================== CATEGORY & REPORT ======================

async function categoryexp(table, table2) {
  const user_id = getUserId();
  if (!user_id) return;

  try {
    const response = await fetch(`http://127.0.0.1:8000/see/${user_id}`);
    const data = await response.json();

    // Group by category
    const grouped = data.reduce((groups, e) => {
      if (!groups[e.category]) groups[e.category] = [];
      groups[e.category].push(e);
      return groups;
    }, {});

    // Category totals
    Object.keys(grouped).forEach(key => {
      const total = grouped[key].reduce((sum, e) => sum + e.amount, 0);
      const newtr = document.createElement("tr");
      newtr.innerHTML = `<td>${key}</td><td>${total}</td>`;
      table2.appendChild(newtr);
    });

    // All expenses
    data.forEach(e => {
      const newtr = document.createElement("tr");
      newtr.innerHTML = `<td>${e.description}</td><td>${e.amount}</td><td>${e.category}</td>`;
      table.appendChild(newtr);
    });

  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

async function categorydash(table2) {
  const user_id = getUserId();
  if (!user_id) return;

  try {
    const response = await fetch(`http://127.0.0.1:8000/see/${user_id}`);
    const data = await response.json();

    const grouped = data.reduce((groups, e) => {
      if (!groups[e.category]) groups[e.category] = [];
      groups[e.category].push(e);
      return groups;
    }, {});

    let totalAmount = 0;
    Object.keys(grouped).forEach(key => {
      const total = grouped[key].reduce((sum, e) => sum + e.amount, 0);
      const newtr = document.createElement("tr");
      newtr.innerHTML = `<td>${key}</td><td>${total}</td>`;
      table2.appendChild(newtr);
      totalAmount += total;
    });

    document.getElementById("total").textContent = totalAmount;

  } catch (error) {
    console.error("Error loading category dashboard:", error);
  }
}

async function reportyexp() {
  const user_id = getUserId();
  if (!user_id) return;

  try {
    const response = await fetch(`http://127.0.0.1:8000/see/${user_id}`);
    const data = await response.json();

    const grouped = data.reduce((groups, e) => {
      if (!groups[e.category]) groups[e.category] = [];
      groups[e.category].push(e);
      return groups;
    }, {});

    const catedata = {};
    Object.keys(grouped).forEach(key => {
      catedata[key] = grouped[key].reduce((sum, e) => sum + e.amount, 0);
    });

    return catedata;
  } catch (error) {
    console.error("Error fetching report data:", error);
  }
}

function reportchart(ctx, catedata) {
  const callob = {
    type: 'pie',
    data: {
      labels: Object.keys(catedata),
      datasets: [{ label: 'Expenses', data: Object.values(catedata) }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  };

  new Chart(ctx, callob);
}

// ====================== DOM CONTENT LOADED ======================

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.endsWith("add.html")) {
    const form = document.getElementById("expenseForm");
    const description = document.getElementById("description");
    const amount = document.getElementById("amount");
    const category = document.getElementById("category");
    const recdash = document.querySelector(".transactions");

    getdata(recdash);

    form.addEventListener("submit", e => {
      e.preventDefault();
      addexp(description.value, amount.value, category.value);
    });
  }

  if (path.endsWith("catagory.html")) {
    const table2 = document.getElementById("cate-table");
    const table = document.getElementById("exp-table");
    categoryexp(table, table2);
  }

  if (path.endsWith("index.html")) {
    const table2 = document.getElementById("cate-table");
    const recdash = document.querySelector(".transactions");
    getdata(recdash);
    categorydash(table2);
  }

  if (path.endsWith("report.html")) {
    const ctx = document.getElementById('myChart');
    reportyexp().then(catedata => reportchart(ctx, catedata));
  }
});