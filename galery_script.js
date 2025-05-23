document.addEventListener("DOMContentLoaded", () => {
  const photoGallery = document.getElementById("photoGallery");
  const voteButton = document.getElementById("voteButton");
  const resetButton = document.getElementById("resetButton");
  const winnerAnnouncement = document.getElementById("winnerAnnouncement");
  const winnerImage = document.getElementById("winnerImage");
  const winnerName = document.getElementById("winnerName");
  const galleryTitle = document.getElementById("galleryTitle");

  // --- CONFIGURAÇÃO ESPECÍFICA DA PASTA ---
  // Idealmente, esta lista viria de um arquivo .js gerado ou
  // seria inferida se você tivesse um backend ou usasse uma API de arquivos.
  // Para este exemplo estático, vamos simular baseado no caminho da URL.
  let currentPhotoList = [];
  let folderName = "";

  function getFolderNameFromPath() {
    const pathParts = window.location.pathname.split("/");
    return pathParts[pathParts.length - 2] || "Turma Desconhecida";
  }

  folderName = getFolderNameFromPath();
  galleryTitle.textContent = `Galeria de Desenhos - Turma ${folderName}`;

  // Verifica se a variável global 'imageFilesForThisFolder' foi definida pelo 'imagens.js'
  if (
    typeof imageFilesForThisFolder !== "undefined" &&
    Array.isArray(imageFilesForThisFolder)
  ) {
    currentPhotoList = imageFilesForThisFolder;
  } else {
    console.warn(
      `ATENÇÃO: Lista de fotos 'imageFilesForThisFolder' não encontrada ou inválida para a turma "${folderName}". Verifique se 'imagens.js' existe e está correto.`
    );
    // Pode ter uma lista de fallback ou mostrar uma mensagem de erro mais proeminente
    currentPhotoList = []; // Ou uma lista de placeholders se preferir
  }

  // SIMULAÇÃO: Você precisaria popular este array com os nomes dos arquivos REAIS
  // da pasta img/ da turma atual.
  // Exemplo para uma turma "1A" que tem 3 desenhos:
  // if (folderName === '1A') {
  //     currentPhotoList = ['desenho_maria.png', 'arte_joao.jpg', 'pintura_ana.png'];
  // } else if (folderName === '1B') {
  //     currentPhotoList = ['rabisco_pedro.png', 'obra_sofia.png'];
  // }
  // ... e assim por diante para cada turma.

  // !!! IMPORTANTE: PARA UM PROJETO REAL !!!
  // Você usaria um script (Python, por exemplo) para LER os nomes dos arquivos
  // na pasta 'img/' de cada turma e GERAR um pequeno arquivo JS, como:
  // // Em 1A/imagens_1A.js:
  // const imageFiles_1A = ['desenho1.png', 'desenho2.png'];
  // E então aqui você faria algo como:
  // if (typeof imageFiles_1A !== 'undefined') currentPhotoList = imageFiles_1A;

  // Para este exemplo, vamos usar uma lista genérica se não houver uma específica.
  // Substitua isso pela lógica acima para um sistema real.
  if (currentPhotoList.length === 0) {
    // Lista de placeholder, você DEVE substituir isso pela lista real de cada turma.
    // Supondo que você nomeie os arquivos de forma consistente.
    console.warn(
      `ATENÇÃO: Usando lista de fotos de placeholder para turma "${folderName}". Crie a lista de imagens real!`
    );
    currentPhotoList = Array.from(
      { length: 8 },
      (_, i) => `desenho_exemplo_${i + 1}.png`
    );
    // Em um cenário real, você colocaria arquivos com esses nomes em cada pasta `img/`
    // ou, MELHOR AINDA, teria um script que lista os arquivos existentes.
  }
  // --- FIM DA CONFIGURAÇÃO ESPECÍFICA DA PASTA ---

  let activePhotos = [...currentPhotoList]; // Fotos atualmente na disputa

  function renderGallery(photosToDisplay) {
    photoGallery.innerHTML = ""; // Limpa a galeria existente
    winnerAnnouncement.style.display = "none";
    voteButton.style.display = "inline-block";
    resetButton.style.display = "none";

    if (photosToDisplay.length === 0 && currentPhotoList.length > 0) {
      photoGallery.innerHTML =
        "<p>Nenhum desenho restante para esta rodada ou votação concluída.</p>";
      voteButton.style.display = "none";
      resetButton.style.display = "inline-block";
      return;
    }
    if (currentPhotoList.length === 0) {
      photoGallery.innerHTML = `<p>Nenhum desenho encontrado para a turma ${folderName}. Verifique se há imagens na pasta 'img/' e se a lista de imagens está configurada corretamente.</p>`;
      voteButton.style.display = "none";
      return;
    }

    photosToDisplay.forEach((photoSrc) => {
      const photoNameWithoutExtension =
        photoSrc.substring(0, photoSrc.lastIndexOf(".")) || photoSrc;

      const itemDiv = document.createElement("div");
      itemDiv.className = "photo-item";
      itemDiv.dataset.photoSrc = photoSrc; // Guarda o src original

      const img = document.createElement("img");
      img.src = `img/${photoSrc}`; // Assume que as imagens estão na pasta 'img/'
      img.alt = photoNameWithoutExtension;
      // Tratar erro de imagem não encontrada:
      img.onerror = function () {
        this.alt = `Erro ao carregar ${photoSrc}`;
        this.src =
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // Imagem transparente 1x1
        itemDiv.querySelector(
          ".photo-name"
        ).textContent = `Erro: ${photoSrc} não encontrada`;
      };

      const nameP = document.createElement("p");
      nameP.className = "photo-name";
      nameP.textContent = photoNameWithoutExtension.replace(/_/g, " "); // Substitui _ por espaço para melhor leitura

      const counterDiv = document.createElement("div");
      counterDiv.className = "counter";

      const minusButton = document.createElement("button");
      minusButton.textContent = "-";
      minusButton.type = "button";

      const input = document.createElement("input");
      input.type = "number";
      input.value = "0";
      input.min = "0";
      input.readOnly = true; // Usuário só altera pelos botões

      const plusButton = document.createElement("button");
      plusButton.textContent = "+";
      plusButton.type = "button";

      minusButton.onclick = () => updateCounter(input, -1);
      plusButton.onclick = () => updateCounter(input, 1);

      counterDiv.appendChild(minusButton);
      counterDiv.appendChild(input);
      counterDiv.appendChild(plusButton);

      itemDiv.appendChild(img);
      itemDiv.appendChild(nameP);
      itemDiv.appendChild(counterDiv);
      photoGallery.appendChild(itemDiv);
    });

    if (photosToDisplay.length === 1 && currentPhotoList.length > 0) {
      // Se só uma foto foi passada para renderizar E não é a carga inicial vazia
      displayWinner(photosToDisplay[0]);
    } else if (photosToDisplay.length > 1) {
      voteButton.textContent = "Votar Nesta Rodada";
    }
  }

  function updateCounter(inputElement, increment) {
    let currentValue = parseInt(inputElement.value);
    currentValue += increment;
    if (currentValue < 0) {
      currentValue = 0;
    }
    inputElement.value = currentValue;
  }

  function handleVote() {
    const votedItems = [];
    const photoItems = photoGallery.querySelectorAll(".photo-item");

    photoItems.forEach((item) => {
      const input = item.querySelector('input[type="number"]');
      const votes = parseInt(input.value);
      const photoSrc = item.dataset.photoSrc;

      if (votes > 0) {
        votedItems.push({ src: photoSrc, votes: votes });
      }
    });

    if (votedItems.length === 0) {
      alert(
        "Nenhum desenho recebeu votos nesta rodada. Por favor, vote em pelo menos um!"
      );
      return;
    }

    // Ordena pelos mais votados (opcional, mas pode ser útil para desempate futuro)
    votedItems.sort((a, b) => b.votes - a.votes);

    // Filtra para manter apenas os que receberam votos (qualquer voto > 0)
    activePhotos = votedItems.map((item) => item.src);

    if (activePhotos.length === 1) {
      displayWinner(activePhotos[0]);
    } else if (activePhotos.length > 1) {
      renderGallery(activePhotos); // Re-renderiza com os que passaram
      voteButton.textContent = "Votar na Próxima Rodada";
      alert(
        `Rodada concluída! ${activePhotos.length} desenhos seguem para a próxima fase. Vote novamente!`
      );
    } else {
      // Isso não deveria acontecer se votedItems.length > 0
      alert("Ocorreu um erro na votação. Tente reiniciar.");
      renderGallery(currentPhotoList); // Volta ao estado inicial
    }
  }

  function displayWinner(winnerSrc) {
    photoGallery.innerHTML = ""; // Limpa a galeria
    voteButton.style.display = "none";
    resetButton.style.display = "inline-block";

    winnerImage.src = `img/${winnerSrc}`;
    const winnerNameWithoutExtension = winnerSrc.substring(
      0,
      winnerSrc.lastIndexOf(".")
    );
    winnerName.textContent = `Parabéns ao desenho: ${winnerNameWithoutExtension.replace(
      /_/g,
      " "
    )}!`;
    winnerAnnouncement.style.display = "block";
  }

  function resetContest() {
    activePhotos = [...currentPhotoList];
    renderGallery(activePhotos);
    voteButton.textContent = "Votar Nesta Rodada";
    voteButton.style.display = "inline-block";
    resetButton.style.display = "none";
    winnerAnnouncement.style.display = "none";
  }

  voteButton.addEventListener("click", handleVote);
  resetButton.addEventListener("click", resetContest);

  // Carga inicial
  renderGallery(activePhotos);
});
