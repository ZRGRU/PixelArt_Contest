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

  // Função para lidar com o evento de votação
  function handleVote() {
    const photoItems = photoGallery.querySelectorAll(".photo-item"); // Fotos visíveis no início da rodada
    const votedEntries = []; // Usaremos um array de objetos para guardar src e votos

    photoItems.forEach((item) => {
      const input = item.querySelector('input[type="number"]');
      const votes = parseInt(input.value);
      const photoSrc = item.dataset.photoSrc;

      if (votes > 0) {
        votedEntries.push({ src: photoSrc, votes: votes });
      }
    });

    if (votedEntries.length === 0) {
      alert(
        "Nenhum desenho recebeu votos nesta rodada. Por favor, vote em pelo menos um!"
      );
      return;
    }

    if (votedEntries.length === 1) {
      // Se apenas um item recebeu votos, ele é o vencedor automaticamente
      displayWinner(votedEntries[0].src);
      return;
    }

    // Ordenar por votos (descendente) - útil para encontrar o max e para desempates futuros se necessário
    votedEntries.sort((a, b) => b.votes - a.votes);

    const maxVotes = votedEntries[0].votes; // O primeiro item tem o máximo de votos após ordenar

    // --- LÓGICA DE AVANÇO ---
    const MIN_PERCENTAGE_OF_MAX_TO_ADVANCE = 0.6; // Ex: 60% dos votos do mais votado
    // O limiar de votos deve ser pelo menos 1.
    const voteThresholdToAdvance = Math.max(
      1,
      Math.floor(maxVotes * MIN_PERCENTAGE_OF_MAX_TO_ADVANCE)
    );

    let potentialAdvancers = votedEntries.filter(
      (entry) => entry.votes >= voteThresholdToAdvance
    );

    // Se, após aplicar a regra da porcentagem, NENHUMA foto foi eliminada do conjunto que recebeu votos,
    // E AINDA temos mais de uma foto, aplicamos uma regra mais estrita:
    // só avançam aquelas com o MÁXIMO de votos.
    // Isso evita que, por exemplo, 3 fotos com 5, 4, 3 votos avancem todas se o limiar for 3.
    // A condição `photoItems.length` refere-se às fotos exibidas no início desta rodada.
    if (
      potentialAdvancers.length === votedEntries.length &&
      votedEntries.length > 1 &&
      votedEntries.length === photoItems.length
    ) {
      console.log(
        "Regra de porcentagem não reduziu os candidatos votados. Aplicando regra mais estrita: apenas quem teve o máximo de votos."
      );
      potentialAdvancers = votedEntries.filter(
        (entry) => entry.votes === maxVotes
      );
    }

    // Se após todos os filtros, ainda temos 0 (o que não deveria acontecer se votedEntries > 0 e threshold >=1)
    // ou se o filtro resultou em algo que não faz sentido, podemos ter um fallback.
    // Mas com max(1, ...), potentialAdvancers deve ter pelo menos 1 item se votedEntries tiver.
    if (potentialAdvancers.length === 0 && votedEntries.length > 0) {
      // Fallback: se a lógica acima por algum motivo zerar os advancers,
      // avançamos pelo menos o(s) mais votado(s).
      console.warn(
        "Lógica de avanço resultou em 0 candidatos, usando fallback para os mais votados."
      );
      potentialAdvancers = votedEntries.filter(
        (entry) => entry.votes === maxVotes
      );
    }

    activePhotos = potentialAdvancers.map((entry) => entry.src);

    if (activePhotos.length === 1) {
      displayWinner(activePhotos[0]);
    } else if (activePhotos.length > 1) {
      // Verifica se houve progresso. Se o número de fotos ativas for o mesmo
      // que o número de fotos no início da rodada E todas tiveram o mesmo número de votos (empate total).
      if (
        activePhotos.length === photoItems.length &&
        potentialAdvancers.every((p) => p.votes === maxVotes)
      ) {
        alert(
          `Empate total com ${maxVotes} votos! ${activePhotos.length} desenhos seguem para a próxima fase. Por favor, votem para desempatar!`
        );
      } else {
        alert(
          `Rodada concluída! ${activePhotos.length} desenhos seguem para a próxima fase. Vote novamente!`
        );
      }
      renderGallery(activePhotos);
      voteButton.textContent = "Votar na Próxima Rodada";
    } else {
      // Nenhuma foto avançou, o que significa que apenas 1 foto recebeu votos e já foi tratada,
      // ou a votação foi em branco.
      // Se chegou aqui e activePhotos.length é 0, pode ser um estado inesperado.
      // Poderia recarregar as fotos originais da rodada.
      // No entanto, a lógica acima deve garantir que se houver votos, haverá avanços.
      // Se `votedEntries` tinha itens, `potentialAdvancers` (e portanto `activePhotos`) também deveria.
      alert(
        "Nenhuma foto atendeu aos critérios para avançar. Verifique os votos e tente novamente. (Ou todas foram eliminadas)"
      );
      // O que fazer aqui? Talvez reiniciar com as fotos que estavam na rodada?
      // Se `votedEntries.length > 0` mas `activePhotos.length === 0`, é um problema.
      // Por segurança, se activePhotos estiver vazio mas houve votos, recarregue os que receberam votos.
      if (votedEntries.length > 0 && activePhotos.length === 0) {
        console.error(
          "Estado inesperado: Houve votos, mas nenhum avançou após filtros. Reexibindo os votados."
        );
        activePhotos = votedEntries.map((entry) => entry.src);
        if (activePhotos.length === 1) displayWinner(activePhotos[0]);
        else if (activePhotos.length > 1) renderGallery(activePhotos);
        else resetContest(); // Caso extremo
      } else {
        // Se não houve votos (votedEntries.length === 0), já foi tratado.
        // Se houve 1 voto, já foi tratado.
        // Se esta condição for atingida, é porque activePhotos.length === 0 E votedEntries.length === 0,
        // o que significa que o primeiro 'if (votedEntries.length === 0)' já deveria ter pego.
        // Ou é o caso de 1 vencedor.
        // Para ser seguro, se chegarmos aqui sem vencedor e sem fotos ativas:
        if (winnerAnnouncement.style.display === "none") {
          alert("Nenhuma foto avançou. Reiniciando a votação da turma.");
          resetContest();
        }
      }
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
