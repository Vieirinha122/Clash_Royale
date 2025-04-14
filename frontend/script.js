const apiUrl = "http://localhost:3000/api"; // Altere se necessário

// Função para abrir o modal
function openModal(message) {
  const modal = document.getElementById("modal");
  const modalBody = modal.querySelector(".modal-body");
  modalBody.innerHTML = message;
  modal.style.display = "block";
}

// Função para fechar o modal
function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
}

// CONSULTA 1: Winrate por Carta
async function consultarWinRateCarta() {
  const nomeCarta = document.getElementById("cartaInput").value.trim();
  if (!nomeCarta) {
    openModal("⚠️ Digite o nome da carta.");
    return;
  }

  try {
    const res = await fetch(`${apiUrl}/winrate-carta?carta=${encodeURIComponent(nomeCarta)}`);
    const data = await res.json();

    if (data.error) {
      openModal(`⚠️ ${data.error}`);
      return;
    }

    const html = `
      <h2>📘 Carta: ${data.carta}</h2>
      <p><strong>Vitórias:</strong> ${data.vitorias}</p>
      <p><strong>Derrotas:</strong> ${data.derrotas}</p>
      <p><strong>Taxa de Vitórias:</strong> ${data.winRate}%</p>
      <p><strong>Taxa de Derrotas:</strong> ${data.lossRate}%</p>
    `;
    document.getElementById("resultado").innerHTML = html;
  } catch (err) {
    console.error(err);
    openModal("❌ Erro ao buscar os dados da carta.");
  }
}

// CONSULTA 2: Decks com Winrate acima de X%
async function consultarDecksVitoriosos() {
  try {
    const res = await fetch('http://localhost:3000/api/decks-vitoriosos?porcentagem=20');
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      openModal("⚠️ Nenhum deck encontrado com winrate alta.");
      return;
    }

    const html = data.map(deck => `
      <div class="deck">
        <h3>🛡️ Deck ID: ${deck.deckId}</h3>
        <p><strong>Winrate:</strong> ${deck.winRate.toFixed(2)}%</p>
        <p><strong>Cartas:</strong> ${deck.cards.join(", ")}</p>
      </div>
      <hr />
    `).join("");

    document.getElementById("resultado").innerHTML = html;
  } catch (err) {
    console.error(err);
    openModal("❌ Erro ao buscar os decks vitoriosos.");
  }
}

async function buscarDerrotasPorCombo() {
  const combo = prompt("Digite os nomes das cartas separadas por vírgula (ex: Cavaleiro,Zap)");
  if (!combo) return;

  try {
    const response = await fetch(`http://localhost:3000/api/derrotas-por-combo?combo=${encodeURIComponent(combo)}`);
    const data = await response.json();

    const resultado = document.getElementById("resultado");
    resultado.innerHTML = `<h2>🔻 Derrotas com o combo: ${data.combo.join(" + ")}</h2>`;

    if (data.decksDerrotados.length === 0) {
      resultado.innerHTML += "<p>Nenhum deck foi derrotado com esse combo.</p>";
    } else {
      const lista = document.createElement("ul");
      data.decksDerrotados.forEach((deck) => {
        const item = document.createElement("li");
        item.textContent = `Deck ${deck._id} teve ${deck.derrotas} derrota(s) com esse combo.`;
        lista.appendChild(item);
      });
      resultado.appendChild(lista);
    }
  } catch (err) {
    openModal("❌ Erro ao buscar dados.");
    console.error(err);
  }
}

async function buscarDecksComMaisTrofeus() {
  const minDiff = prompt("Digite a diferença mínima de troféus entre vencedor e perdedor:");

  if (!minDiff) return;

  try {
    const response = await fetch(`http://localhost:3000/api/decks-vitoriosos-contra-mais-fortes?minDiff=${minDiff}`);
    const data = await response.json();

    const resultado = document.getElementById("resultado");
    resultado.innerHTML = `<h2>🏆 Decks que venceram com diferença de troféus ≥ ${data.minDiff}</h2>`;

    if (data.decks.length === 0) {
      resultado.innerHTML += "<p>Nenhum resultado encontrado.</p>";
    } else {
      const lista = document.createElement("ul");
      data.decks.forEach((deck) => {
        const item = document.createElement("li");
        item.textContent = `Deck ${deck._id} venceu ${deck.vitorias} vez(es) contra oponentes com +${minDiff} troféus.`;
        lista.appendChild(item);
      });
      resultado.appendChild(lista);
    }
  } catch (err) {
    openModal("❌ Erro ao buscar dados.");
    console.error(err);
  }
}

async function buscarMediaTempoBatalha() {
  const minRareCards = prompt("Digite a quantidade mínima de cartas raras:");

  if (!minRareCards) return;

  try {
    const response = await fetch(`http://localhost:3000/api/media-tempo-batalha?minRareCards=${minRareCards}`);
    const data = await response.json();

    const resultado = document.getElementById("resultado");
    resultado.innerHTML = `<h2>⏱️ Média de Tempo de Batalha</h2>`;

    if (data.mediaTempo === "Nenhum resultado encontrado") {
      resultado.innerHTML += "<p>Nenhum deck com as cartas raras suficientes foi encontrado.</p>";
    } else {
      resultado.innerHTML += `<p>Média de tempo de batalha para decks com ≥ ${minRareCards} cartas raras: ${data.mediaTempo} segundos.</p>`;
    }
  } catch (err) {
    openModal("❌ Erro ao buscar dados.");
    console.error(err);
  }
}

async function buscarMediaTrofeus() {
  try {
    const response = await fetch("http://localhost:3000/api/avg-trophies-by-level");
    const data = await response.json();

    const resultado = document.getElementById("resultado");
    resultado.innerHTML = "<h2>🏆 Média de Troféus por Nível</h2>";

    if (data.length === 0) {
      resultado.innerHTML += "<p>Nenhum dado encontrado.</p>";
      return;
    }

    let tabela = "<table border='1' cellpadding='8' style='margin-top:10px'><tr><th>Nível</th><th>Média de Troféus</th><th>Qtd. Jogadores</th></tr>";
    data.forEach(item => {
      tabela += `<tr>
        <td>${item._id}</td>
        <td>${item.avgTrophies.toFixed(2)}</td>
        <td>${item.totalPlayers}</td>
      </tr>`;
    });
    tabela += "</table>";

    resultado.innerHTML += tabela;
  } catch (err) {
    openModal("❌ Erro ao buscar dados.");
    console.error(err);
  }
}

async function buscarCartasMaisUsadas() {
  try {
    const response = await fetch("http://localhost:3000/api/most-used-cards");
    const data = await response.json();

    const resultado = document.getElementById("resultado");
    resultado.innerHTML = "<h2>🃏 Cartas Mais Usadas em Decks</h2>";

    if (data.length === 0) {
      resultado.innerHTML += "<p>Nenhum dado encontrado.</p>";
      return;
    }

    let lista = "<ul>";
    data.forEach((card, index) => {
      lista += `<li><strong>${index + 1}.</strong> ${card.name} – ${card.count} usos</li>`;
    });
    lista += "</ul>";

    resultado.innerHTML += lista;
  } catch (err) {
    openModal("❌ Erro ao buscar cartas mais usadas.");
    console.error(err);
  }
}

async function buscarDuracaoMedia() {
  try {
    const response = await fetch("http://localhost:3000/api/avg-battle-duration");
    const data = await response.json();

    const resultado = document.getElementById("resultado");
    resultado.innerHTML = `
      <h2>⏱️ Duração Média das Batalhas</h2>
      <p>Média: <strong>${data.avgDuration.toFixed(2)}</strong> segundos</p>
      <p>Total de batalhas analisadas: <strong>${data.totalBattles}</strong></p>
    `;
  } catch (err) {
    openModal("❌ Erro ao buscar duração média das batalhas.");
    console.error(err);
  }
}
