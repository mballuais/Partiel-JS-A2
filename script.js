document.addEventListener("DOMContentLoaded", () => {
  const recipeForm = document.getElementById("recipe-form");
  const recipeList = document.getElementById("recipe-list");
  const orderList = document.getElementById("order-list");
  const totalAmountSpan = document.getElementById("total-amount");
  const sauceSelect = document.getElementById("sauce-select");
  const confirmSauceButton = document.getElementById("confirmSauce");

  let currentRecipeText = "";
  let currentRecipePrice = 0;

  function updateTotalAmount() {
    let total = 0;
    document.querySelectorAll("#order-list li").forEach((li) => {
      const orderPrice = parseFloat(li.dataset.price);
      if (!isNaN(orderPrice)) {
        total += orderPrice;
      }
    });
    totalAmountSpan.textContent = total.toFixed(2);
  }

  function saveData() {
    const recipes = [];
    document.querySelectorAll("#recipe-list li").forEach((li) => {
      const span = li.querySelector("span");
      const [text, price] = span.innerText.split(" | Prix: €");
      recipes.push({ text, price: parseFloat(price) });
    });
    localStorage.setItem("recipes", JSON.stringify(recipes));

    const orders = [];
    document.querySelectorAll("#order-list li").forEach((li) => {
      const orderText = li.dataset.text;
      const orderTime = li.dataset.time;
      const orderDate = li.dataset.date;
      const orderPrice = li.dataset.price;
      orders.push(`${orderText}|||${orderTime}|||${orderDate}|||${orderPrice}`);
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
    savedRecipes.forEach(({ text, price }) => {
      addRecipeToDOM(text, price, false);
    });

    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    savedOrders.sort((a, b) => {
      const timeA = parseInt(a.split("|||")[1], 10);
      const timeB = parseInt(b.split("|||")[1], 10);
      return timeA - timeB;
    });

    savedOrders.forEach((order) => {
      const [text, orderTime, orderDate, orderPrice] = order.split("|||");
      addOrderToDOM(
        text,
        parseInt(orderTime, 10),
        orderDate,
        parseFloat(orderPrice),
        true
      );
    });
    updateTotalAmount();
  }

  function addRecipeToDOM(text, price, save = true) {
    const li = document.createElement("li");
    li.classList.add(
      "list-group-item",
      "d-flex",
      "justify-content-between",
      "align-items-center"
    );
    li.innerHTML = `
          <span>${text} | Prix: €${price.toFixed(2)}</span>
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
    orderPrice = 0,
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
    li.dataset.price = orderPrice.toFixed(2);

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

    const orderTextDisplay = `${text} | 📅 ${orderDate} - 🕒 ${formattedTime} | 💶 €${orderPrice.toFixed(
      2
    )}`;

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
      updateTotalAmount();
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
    updateTotalAmount();
  }

  recipeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("recipe-name").value.trim();
    const ingredients = document
      .getElementById("recipe-ingredients")
      .value.trim();
    const priceInput = document.getElementById("recipe-price").value.trim();

    if (name === "" || ingredients === "" || priceInput === "") {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    const price = parseFloat(priceInput);
    if (isNaN(price) || price < 0) {
      alert("Veuillez entrer un prix valide !");
      return;
    }

    const text = `${name} - ${ingredients}`;
    addRecipeToDOM(text, price);
    recipeForm.reset();
  });

  recipeList.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-recipe")) {
      const liRecipe = event.target.closest("li");
      liRecipe.remove();
      saveData();
    }

    if (event.target.classList.contains("send-to-kitchen")) {
      const liRecipe = event.target.closest("li");
      const span = liRecipe.querySelector("span").innerText;
      const [text, price] = span.split(" | Prix: €");
      currentRecipeText = text;
      currentRecipePrice = parseFloat(price);
      if (isNaN(currentRecipePrice)) currentRecipePrice = 0;

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

      const orderPrice = currentRecipePrice;
      const orderText = `${currentRecipeText} | Sauce : ${sauce}`;
      addOrderToDOM(orderText, orderTime, null, orderPrice);

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
