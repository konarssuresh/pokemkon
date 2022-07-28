const state = {
  page: 1,
  rows: 2,
  window: 5,
};

const BASE_URL = "https://pokeapi.co/api/v2/";
const POKEMON_LIST_API = "pokemon?limit=50&offset=0";
const POKEMON_DETAILS = "pokemon/";

const getPokemonData = async () => {
  try {
    const response = await fetch(`${BASE_URL}${POKEMON_LIST_API}`);
    const pokemonNamesList = await response.json();
    const pokemonList = [];
    for (let result of pokemonNamesList.results) {
      const pokemonDetails = {name: result.name};
      const detailsResponse = await fetch(
        `${BASE_URL}${POKEMON_DETAILS}${pokemonDetails.name}`
      );
      const {height, weight, abilities, moves, sprites} =
        await detailsResponse.json();
      const pokemonMoves = moves.map(({move}) => move.name);
      const pokemonAbilities = abilities.map(({ability}) => ability.name);
      pokemonDetails.height = height;
      pokemonDetails.weight = weight;
      pokemonDetails.moves = pokemonMoves;
      pokemonDetails.abilities = pokemonAbilities;
      pokemonDetails.imageUrl = sprites.back_default;
      pokemonList.push(pokemonDetails);
    }
    return pokemonList;
  } catch (e) {
    throw e;
  }
};

const pagination = (data, page, rows) => {
  let start = (page - 1) * rows;
  let end = start + rows;
  const trimmedData = data.slice(start, end);
  const pages = Math.ceil(data.length / rows);
  return {
    pageData: trimmedData,
    pages,
  };
};

const getMoves = (moves) => {
  const movesStr = moves.join(", ");
  console.log(movesStr);
  return movesStr;
};
const getAbilities = (abilities) => {
  let ablilitiesStr = ``;
  abilities.forEach((ability) => {
    ablilitiesStr += `<li>${ability}</li>`;
  });
  return ablilitiesStr;
};

const buildPagination = () => {
  const {pages} = pagination(state.data, state.page, state.rows);
  let paginationStr = "";

  let maxLeft = state.page - Math.floor(state.window / 2);
  let maxRight = state.page + Math.floor(state.window / 2);

  if (maxLeft < 1) {
    maxLeft = 1;
    maxRight = state.window;
  }
  if (maxRight > pages) {
    maxLeft = pages - (state.window - 1);
    maxRight = pages;
    if (maxLeft < 1) {
      maxLeft = 1;
    }
  }

  for (let pageNo = maxLeft; pageNo <= maxRight; pageNo++) {
    paginationStr += `<button class="btn btn-sm btn-primary pagination-btn" value="${pageNo}">${pageNo}</button>`;
  }

  if (state.page !== 1) {
    paginationStr = `<button class="btn btn.sm btn-primary pagination-btn" value="1">First</button> ${paginationStr}`;
  }

  if (state.page !== pages) {
    paginationStr = `${paginationStr} <button class="btn btn.sm btn-primary pagination-btn" value="${pages}">Last</button>`;
  }

  document.getElementById("pagination-wrapper").innerHTML = paginationStr;

  const buttons = document.getElementsByClassName("pagination-btn");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", onPageChange, false);
  }
};

const onPageChange = (e) => {
  state.page = Number.parseInt(e.target.value);
  buildPage();
  buildPagination();
};

const buildPage = () => {
  const {pageData} = pagination(state.data, state.page, state.rows);
  let pageHtml = "";
  pageData.forEach((page) => {
    pageHtml += `<div class="card">
        <img class="card-img-top pokemon-image"  src="${
          page.imageUrl
        }" alt="Card image cap">
        <div class="card-body">
        <h3 class="card-title text-capitalize">${page.name}</h3>
        <p class="card-text">Height - ${page.height}ft</p>
        <p class="card-text">Weight - ${page.weight}lbs</p>
        <h5>Abilities</h5>
        ${getAbilities(page.abilities)}
        <h5>Moves</h5>
        <p class="card-text">${getMoves(page.moves)}</p>
    </div>
</div>`;
  });
  document.getElementById("page-content").innerHTML = pageHtml;
};

const buildLoader = () => {
  document.getElementById(
    "page-content"
  ).innerHTML = ` <div class="alert alert-info" role="alert">Loading...</div>`;
};

const buildError = () => {
  document.getElementById(
    "page-content"
  ).innerHTML = `<div class="alert alert-danger" role="alert">
    Some Error Occured. Try Again
  </div>`;
};

window.onload = async () => {
  try {
    buildLoader();
    const pokemonData = await getPokemonData();
    state.data = pokemonData;
    buildPage();
    buildPagination();
  } catch (e) {
    buildError();
  }
};
