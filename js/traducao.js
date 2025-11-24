/* ===== FALAR TEXTO ===== */
function falarTexto() {
  const texto = document.getElementById("textoParaTraduzir").value;
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = "pt-BR";
  speechSynthesis.speak(fala);
}

/* ===== RECONHECIMENTO PARA ÁREA DE TRADUÇÃO ===== */
function iniciarReconhecimento() {
  const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  rec.lang = "pt-BR";

  rec.onresult = (event) => {
    const texto = event.results[0][0].transcript;
    document.getElementById("textoParaTraduzir").value = texto;
  };

  rec.start();
}

/* ===== RECONHECIMENTO PARA DEPOIMENTO ===== */
function reconhecerDepoimento() {
  const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  rec.lang = "pt-BR";

  rec.onresult = (event) => {
    const texto = event.results[0][0].transcript;
    document.getElementById("inputDepoimento").value = texto;
  };

  rec.start();
}

/* ===== TRADUZIR PARA LIBRAS ===== */
function traduzirTexto() {
  const texto = document.getElementById("textoParaTraduzir").value.trim();
  const painel = document.getElementById("areaLibras");

  if (texto === "") {
    alert("Digite algo para traduzir!");
    return;
  }

  painel.textContent = texto;
  painel.dispatchEvent(new Event("DOMSubtreeModified", { bubbles: true }));
}

/* ===== ACESSIBILIDADE ===== */
function alternarAcessibilidade() {
  document.body.classList.toggle("alto-contraste");
}

/* ============================================================
   FIREBASE — DEPOIMENTOS COM NOME + TEXTO + DATA
   ============================================================ */

import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* ===== SALVAR NO FIRESTORE ===== */
async function salvarDepoimentoFirestore(nome, texto) {
  const depoimentosRef = collection(window.db, "depoimentos");

  await addDoc(depoimentosRef, {
    nome: nome,
    texto: texto,
    data: serverTimestamp()
  });
}

/* ===== CARREGAR DO FIRESTORE ===== */
async function carregarDepoimentos() {
  const lista = document.getElementById("listaDepoimentos");
  lista.innerHTML = "Carregando...";

  const depoimentosRef = collection(window.db, "depoimentos");
  const q = query(depoimentosRef, orderBy("data", "desc"));

  const snapshot = await getDocs(q);

  lista.innerHTML = "";

  snapshot.forEach(doc => {
    const dep = doc.data();

    const bloco = document.createElement("div");
    bloco.classList.add("depoimento-card");

    const data = dep.data?.toDate
      ? dep.data.toDate().toLocaleString("pt-BR")
      : "Data não disponível";

    bloco.innerHTML = `
      <strong>${dep.nome}</strong> — <small>${data}</small><br>
      <p>${dep.texto}</p>
      <hr>
    `;

    lista.appendChild(bloco);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formDepoimento");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nomeDepoimento").value.trim();
    const texto = document.getElementById("inputDepoimento").value.trim();

    if (nome.length < 2) {
      alert("Digite um nome válido!");
      return;
    }

    if (texto.length < 8) {
      alert("Depoimento muito curto!");
      return;
    }

    await salvarDepoimentoFirestore(nome, texto);

    document.getElementById("nomeDepoimento").value = "";
    document.getElementById("inputDepoimento").value = "";

    carregarDepoimentos();
  });

  carregarDepoimentos();
});
