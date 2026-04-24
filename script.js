let days = 3;
const checkedItems = {};

function calcRequired(item, persons, days) {
  switch (item.calcType) {
    case "per_person_per_day": return persons * days * item.value;
    case "per_person":         return persons * item.value;
    case "fixed":              return item.value;
    default:                   return item.value;
  }
}

function filterItems(items, activeConditions) {
  return items.filter(item => {
    if (!item.conditions) return true;
    return item.conditions.some(c => activeConditions.has(c));
  });
}

function groupByCategory(items) {
  return items.reduce((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});
}

function render(persons, activeConditions, days) {
  const container = document.getElementById("stock-list");
  container.innerHTML = "";

  const filtered = filterItems(stockItems, activeConditions);
  const grouped = groupByCategory(filtered);

  for (const [category, items] of Object.entries(grouped)) {
    const section = document.createElement("section");
    section.className = "category-section";

    const heading = document.createElement("h2");
    heading.textContent = category;
    section.appendChild(heading);

    const ul = document.createElement("ul");
    for (const item of items) {
      const qty = calcRequired(item, persons, days);
      const isChecked = checkedItems[item.id] ?? false;
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="item-name">${item.name}</span>
        <div class="item-right">
          <span class="item-qty">${qty}<small>${item.unit}</small></span>
          <label class="switch">
            <input type="checkbox" data-id="${item.id}" ${isChecked ? "checked" : ""} />
            <span class="switch-track"></span>
          </label>
          <span class="switch-label ${isChecked ? "has" : ""}">${isChecked ? "ある" : "ない"}</span>
        </div>
      `;
      ul.appendChild(li);
    }
    section.appendChild(ul);
    container.appendChild(section);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const personsInput = document.getElementById("persons");
  const condCheckboxes = document.querySelectorAll(".cond-checkbox");
  const tabBtns = document.querySelectorAll(".tab-btn");
  const stockList = document.getElementById("stock-list");

  function getActiveConditions() {
    const active = new Set();
    condCheckboxes.forEach(cb => {
      if (cb.checked) active.add(cb.dataset.cond);
    });
    return active;
  }

  function update() {
    const val = parseInt(personsInput.value, 10);
    const persons = isNaN(val) || val < 1 ? 1 : val;
    render(persons, getActiveConditions(), days);
  }

  // スイッチ操作はコンテナへの委譲で管理（render後もリスナーが生き続ける）
  stockList.addEventListener("change", e => {
    const input = e.target.closest("input[data-id]");
    if (!input) return;
    const id = parseInt(input.dataset.id, 10);
    checkedItems[id] = input.checked;
    const label = input.closest("li").querySelector(".switch-label");
    label.textContent = input.checked ? "ある" : "ない";
    label.classList.toggle("has", input.checked);
  });

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      days = parseInt(btn.dataset.days, 10);
      tabBtns.forEach(b => b.classList.toggle("active", b === btn));
      update();
    });
  });

  personsInput.addEventListener("input", update);
  condCheckboxes.forEach(cb => cb.addEventListener("change", update));
  update();
});
