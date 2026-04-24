const DAYS = 3;

function calcRequired(item, persons) {
  switch (item.calcType) {
    case "per_person_per_day": return persons * DAYS * item.value;
    case "per_person":         return persons * item.value;
    case "fixed":              return item.value;
    default:                   return item.value;
  }
}

function groupByCategory(items) {
  return items.reduce((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});
}

function render(persons) {
  const container = document.getElementById("stock-list");
  container.innerHTML = "";

  const grouped = groupByCategory(stockItems);

  for (const [category, items] of Object.entries(grouped)) {
    const section = document.createElement("section");
    section.className = "category-section";

    const heading = document.createElement("h2");
    heading.textContent = category;
    section.appendChild(heading);

    const ul = document.createElement("ul");
    for (const item of items) {
      const qty = calcRequired(item, persons);
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="item-name">${item.name}</span>
        <span class="item-qty">${qty}<small>${item.unit}</small></span>
      `;
      ul.appendChild(li);
    }
    section.appendChild(ul);
    container.appendChild(section);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("persons");

  function update() {
    const val = parseInt(input.value, 10);
    const persons = isNaN(val) || val < 1 ? 1 : val;
    render(persons);
  }

  input.addEventListener("input", update);
  update();
});
