// src\scripts\pedidos.js
console.log("prueba");

const app = document.getElementById("app");

async function init() {
  const res = await fetch('/api/config.json');
  const config = await res.json();
  if (res.ok) { console.log("Config Cargada") }

  console.log("config desde el frontend:", config);

  // Podés mostrarlo en pantalla, por ejemplo:
  app.innerHTML = `<p>WhatsApp cocina: ${config}</p>`;
}

init()

console.log("config x");