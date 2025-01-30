document.addEventListener("DOMContentLoaded", () => {
  const recipeForm = document.getElementById("recipe-form");
  const recipeList = document.getElementById("recipe-list");
  const orderList = document.getElementById("order-list");
  const orderCountSpan = document.getElementById("order-count");
  const sauceSelect = document.getElementById("sauce-select");
  const confirmSauceButton = document.getElementById("confirmSauce");

  let currentRecipeText = "";

  function updateOrderCount() {
    orderCountSpan.textContent =
      document.querySelectorAll("#order-list li").length;
  }

  function saveData() {
    const recipes = [];
    document.querySelectorAll("#recipe-list li").forEach((li) => {
      recipes.push(li.querySelector("span").innerText);
    });
    localStorage.setItem("recipes", JSON.stringify(recipes));

    const orders = [];
    document.querySelectorAll("#order-list li").forEach((li) => {
      const orderText = li.dataset.text;
      const orderTime = li.dataset.time;
      const orderDate = li.dataset.date;
      orders.push(`${orderText}|||${orderTime}|||${orderDate}`);
    });

    orders.sort((a, b) => {
      const timeA = parseInt(a.split("|||")[1], 10);
      const timeB = parseInt(b.split("|||")[1], 10);
      return timeA - timeB;
    });

    localStorage.setItem("orders", JSON.stringify(orders));
  }

  function loadData() {
    const savedRecipes = JSON.parse(localStorage.getItem("recipes")) || [];
    savedRecipes.forEach((text) => {
      addRecipeToDOM(text, false);
    });

    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    savedOrders.sort((a, b) => {
      const timeA = parseInt(a.split("|||")[1], 10);
      const timeB = parseInt(b.split("|||")[1], 10);
      return timeA - timeB;
    });

    savedOrders.forEach((order) => {
      const [text, orderTime, orderDate] = order.split("|||");
      addOrderToDOM(text, parseInt(orderTime, 10), orderDate, true);
    });
  }

  function addRecipeToDOM(text, save = true) {
    const li = document.createElement("li");
    li.classList.add(
      "list-group-item",
      "d-flex",
      "justify-content-between",
      "align-items-center"
    );
    li.innerHTML = `
          <span>${text}</span>
          <div>
              <button class="btn btn-success btn-sm send-to-kitchen">👨‍🍳 Envoyer en cuisine</button>
              <button class="btn btn-danger btn-sm delete-recipe">🗑 Supprimer</button>
          </div>
      `;
    recipeList.appendChild(li);
    if (save) saveData();
  }

  function addOrderToDOM(
    text,
    orderTime,
    orderDate = null,
    fromStorage = false
  ) {
    const li = document.createElement("li");
    li.classList.add(
      "list-group-item",
      "d-flex",
      "justify-content-between",
      "align-items-center"
    );
    li.dataset.time = orderTime;
    li.dataset.text = text;

    if (!orderDate) {
      const now = new Date(orderTime);
      orderDate = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()}`;
    }
    li.dataset.date = orderDate;

    const orderDateObj = new Date(orderTime);
    const hours = String(orderDateObj.getHours()).padStart(2, "0");
    const minutes = String(orderDateObj.getMinutes()).padStart(2, "0");
    const formattedTime = `${hours}:${minutes}`;

    const orderTextDisplay = `${text} | 📅 ${orderDate} - 🕒 ${formattedTime}`;

    li.innerHTML = `
          <span>
              <strong>${orderTextDisplay}</strong> | ⏳ 
              <span class="timer">00m00s</span>
          </span>
          <button class="btn btn-primary btn-sm validate-order">✅ Valider</button>
      `;

    orderList.appendChild(li);

    if (!fromStorage) {
      saveData();
      updateOrderCount();
    }
  }

  function updateTimers() {
    const now = Date.now();
    document.querySelectorAll("#order-list li").forEach((li) => {
      const orderTime = parseInt(li.dataset.time, 10);
      if (!orderTime) return;

      const elapsed = Math.floor((now - orderTime) / 1000);
      const mm = Math.floor(elapsed / 60);
      const ss = elapsed % 60;

      li.querySelector(".timer").textContent = `${String(mm).padStart(
        2,
        "0"
      )}m${String(ss).padStart(2, "0")}s`;
    });
  }

  function handleValidateOrder(liElement) {
    liElement.remove();
    saveData();
    updateOrderCount();
  }

  recipeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("recipe-name").value.trim();
    const ingredients = document
      .getElementById("recipe-ingredients")
      .value.trim();

    if (name === "" || ingredients === "") {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    const text = `${name} - ${ingredients}`;
    addRecipeToDOM(text);
    recipeForm.reset();
  });

  recipeList.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-recipe")) {
      const liRecipe = event.target.closest("li");
      liRecipe.remove();
      saveData();
      updateOrderCount();
    }

    if (event.target.classList.contains("send-to-kitchen")) {
      const liRecipe = event.target.closest("li");
      currentRecipeText = liRecipe.querySelector("span").innerText;

      const sauceModal = new bootstrap.Modal(
        document.getElementById("sauceModal")
      );
      sauceModal.show();
    }
  });

  confirmSauceButton.addEventListener("click", async () => {
    const sauce = sauceSelect.value;

    if (!sauce) {
      alert("Veuillez choisir une sauce !");
      return;
    }

    try {
      const response = await fetch(
        "https://timeapi.io/api/Time/current/zone?timeZone=Europe/Paris"
      );
      if (!response.ok) {
        alert(
          "Erreur lors de la récupération de l'heure via l'API. Commande non enregistrée."
        );
        return;
      }
      const data = await response.json();
      const orderTime = Date.parse(data.dateTime);

      const orderText = `${currentRecipeText} | Sauce : ${sauce}`;
      addOrderToDOM(orderText, orderTime);

      const sauceModalEl = document.getElementById("sauceModal");
      const modalInstance = bootstrap.Modal.getInstance(sauceModalEl);
      modalInstance.hide();

      sauceSelect.value = "";
    } catch (error) {
      alert("Impossible de récupérer l'heure via l'API. Commande annulée.");
      console.error("Erreur avec l'API :", error);
    }
  });

  orderList.addEventListener("click", (event) => {
    if (event.target.classList.contains("validate-order")) {
      const liOrder = event.target.closest("li");
      handleValidateOrder(liOrder);
    }
  });

  setInterval(updateTimers, 1000);
  loadData();
});
