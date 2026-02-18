const API_URL = "https://pokeapi.co/api/v2/pokemon/";

async function loadPokemon() {
  const count = document.getElementById("count").value;
  const type = document.getElementById("type").value;
  const container = document.getElementById("cards");

  container.innerHTML = "";
  let loaded = 0;

  while (loaded < count) {
    const id = Math.floor(Math.random() * 150) + 1;

    const res = await fetch(`${API_URL}${id}`);
    const data = await res.json();

    const types = data.types.map((t) => t.type.name);

    if (types.includes(type)) {
      renderCard(data);
      loaded++;
    }
  }
}

function renderCard(pokemon) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <img src="${pokemon.sprites.front_default}" />
    <h3>${pokemon.name.toUpperCase()}</h3>
    <p>Type: ${pokemon.types.map((t) => t.type.name).join(", ")}</p>
    <p>Height: ${pokemon.height}</p>
    <p>Weight: ${pokemon.weight}</p>
  `;

  document.getElementById("cards").appendChild(card);
}
