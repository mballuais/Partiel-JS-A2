document.addEventListener("DOMContentLoaded", () => {
  const recipeForm = document.getElementById("recipe-form");
  const recipeList = document.getElementById("recipe-list");
  const orderList = document.getElementById("order-list");

  const sauceSelector = document.getElementById("sauce-selector");
  const sauceOptions = document.getElementById("sauce-options");
  const confirmSauceBtn = document.getElementById("confirm-sauce");

  const sauces = [
    "Blanche",
    "Samouraï",
    "Algérienne",
    "Barbecue",
    "Andalouse",
    "Harissa",
    "Ketchup",
    "Mayonnaise",
    "Moutarde",
    "Pili-pili",
    "Byggi",
    "Sans Sauce",
  ];
  let selectedSauce = null;

  function displaySauceOptions() {
    sauceOptions.innerHTML = "";
    sauces.forEach((sauce) => {
      const btn = document.createElement("button");
      btn.classList.add("btn", "btn-outline-secondary");
      btn.textContent = sauce;
      btn.onclick = () => {
        selectedSauce = sauce;
        document
          .querySelectorAll("#sauce-options button")
          .forEach((b) => b.classList.remove("btn-primary"));
        btn.classList.add("btn-primary");
      };
      sauceOptions.appendChild(btn);
    });
  }

  function saveData() {
    const recipes = [];
    document.querySelectorAll("#recipe-list li").forEach((li) => {
      recipes.push(li.querySelector("span").innerText);
    });
    localStorage.setItem("recipes", JSON.stringify(recipes));

    const orders = [];
    document.querySelectorAll("#order-list li").forEach((li) => {
      const orderText = li.querySelector("span").innerText.split(" | ⏳ ")[0];
      const orderTime = li.dataset.time;
      orders.push(`${orderText}|||${orderTime}`);
    });
    localStorage.setItem("orders", JSON.stringify(orders));
  }

  function loadData() {
    const savedRecipes = JSON.parse(localStorage.getItem("recipes")) || [];
    savedRecipes.forEach((text) => {
      addRecipeToDOM(text, false);
    });

    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    savedOrders.forEach((order) => {
      const [text, orderTime] = order.split("|||");
      addOrderToDOM(text, parseInt(orderTime, 10));
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

  function addOrderToDOM(text, orderTime) {
    const li = document.createElement("li");
    li.classList.add(
      "list-group-item",
      "d-flex",
      "justify-content-between",
      "align-items-center"
    );
    li.dataset.time = orderTime;

    const orderDate = new Date(orderTime);
    const hours = orderDate.getHours().toString().padStart(2, "0");
    const minutes = orderDate.getMinutes().toString().padStart(2, "0");
    const formattedTime = `${hours}:${minutes}`;

    li.innerHTML = `
            <span><strong>${text}</strong> | Commandé à ${formattedTime} | ⏳ <span class="timer">00m00s</span></span>
            <button class="btn btn-primary btn-sm validate-order">✅ Valider</button>
        `;

    orderList.appendChild(li);
    saveData();
  }

  function updateTimers() {
    document.querySelectorAll("#order-list li").forEach((li) => {
      const orderTime = parseInt(li.dataset.time, 10);
      if (!orderTime) return;

      const now = new Date().getTime();
      const elapsed = Math.floor((now - orderTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;

      li.querySelector(".timer").textContent = `${minutes
        .toString()
        .padStart(2, "0")}m${seconds.toString().padStart(2, "0")}s`;
    });
  }

  setInterval(updateTimers, 1000);
  loadData();

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
      event.target.closest("li").remove();
      saveData();
    }
  });

  recipeList.addEventListener("click", (event) => {
    if (event.target.classList.contains("send-to-kitchen")) {
      const recipeItem = event.target.closest("li");
      const recipeText = recipeItem.querySelector("span").innerText;

      selectedSauce = null;
      displaySauceOptions();

      sauceSelector.classList.remove("d-none");

      confirmSauceBtn.onclick = () => {
        if (!selectedSauce) {
          alert("Veuillez sélectionner une sauce !");
          return;
        }

        fetch("https://timeapi.io/api/Time/current/zone?timeZone=Europe/Paris")
          .then((response) => response.json())
          .then((data) => {
            const orderTime = new Date(data.dateTime).getTime();
            const orderText = `${recipeText} | Sauce : ${selectedSauce}`;
            addOrderToDOM(orderText, orderTime);
            sauceSelector.classList.add("d-none");
          })
          .catch((error) =>
            console.error("Erreur avec l'API de l'heure :", error)
          );
      };
    }
  });

  orderList.addEventListener("click", (event) => {
    if (event.target.classList.contains("validate-order")) {
      event.target.closest("li").remove();
      saveData();
    }
  });
});
