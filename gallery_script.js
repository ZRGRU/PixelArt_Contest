// PixelArt_Contest/gallery_script.js

// Script para gerenciar a galeria de desenhos e o processo de votação
document.addEventListener("DOMContentLoaded", () => {
  // Elementos do DOM
  const galleryPageTitleElement = document.getElementById("galleryPageTitle");
  const imageGalleryContainerElement = document.getElementById(
    "imageGalleryContainer"
  );
  const voteProcessButtonElement = document.getElementById("voteProcessButton");
  const resetVotingButtonElement = document.getElementById("resetVotingButton");
  const winnerDisplayAreaElement = document.getElementById("winnerDisplayArea");
  const winnerImageElement = document.getElementById("winnerImageElement");
  const winnerNameTextElement = document.getElementById("winnerNameText");
  const exportProgressButtonElement = document.getElementById(
    "exportProgressButton"
  );
  const triggerImportButtonElement = document.getElementById(
    "triggerImportButton"
  );
  const importFileInputElement = document.getElementById("importFileInput");
  const galleryControlsElement = document.querySelector(".gallery-controls"); // Para ocultar todos os controles

  // Variáveis de estado
  let originalImageList = []; // Lista original de imagens da turma
  let currentClassId = ""; // ID da turma atual (ex: "1A")
  let activePhotosInContest = []; // Fotos atualmente na disputa

  const LOCAL_STORAGE_KEY_PREFIX = "drawingContest_"; // Prefixo para chaves do localStorage

  // --- 1. FUNÇÕES AUXILIARES E DE CONFIGURAÇÃO ---

  function getLocalStorageKey() {
    return `${LOCAL_STORAGE_KEY_PREFIX}${currentClassId}`;
  }

  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = () => {
        console.log(`Script ${url} carregado.`);
        resolve();
      };
      script.onerror = (error) => {
        console.error(`Falha ao carregar o script ${url}.`, error);
        reject(new Error(`Falha ao carregar ${url}`));
      };
      document.head.appendChild(script);
    });
  }

  // --- 2. FUNÇÕES DE GERENCIAMENTO DE ESTADO (localStorage e JSON) ---

  function getCurrentContestState() {
    return {
      activePhotos: activePhotosInContest,
      classId: currentClassId,
      timestamp: new Date().toISOString(),
    };
  }

  function applyContestState(stateToApply, source = "localStorage") {
    if (stateToApply && Array.isArray(stateToApply.activePhotos)) {
      if (source === "json" && stateToApply.classId !== currentClassId) {
        alert(
          `Erro: O arquivo JSON é para a turma "${stateToApply.classId}", mas você está na turma "${currentClassId}".`
        );
        return false;
      }

      const validSavedPhotos = stateToApply.activePhotos.filter((p) =>
        originalImageList.includes(p)
      );

      if (validSavedPhotos.length > 0) {
        activePhotosInContest = validSavedPhotos;
        console.log(
          `Progresso (${source}) carregado para a turma ${currentClassId}. Fotos ativas: ${activePhotosInContest.length}`
        );
        renderImageGallery(activePhotosInContest);
        return true;
      } else if (originalImageList.length > 0) {
        console.log(
          `Dados (${source}) encontrados para ${currentClassId}, mas nenhuma foto ativa é válida. Iniciando do zero.`
        );
        activePhotosInContest = [...originalImageList];
        renderImageGallery(activePhotosInContest);
      } else {
        console.log(
          `Dados (${source}) encontrados, mas não há fotos válidas nem lista original para ${currentClassId}.`
        );
        imageGalleryContainerElement.innerHTML =
          "<p>Problema ao carregar fotos. Verifique a configuração da turma.</p>";
      }
    }
    return false;
  }

  function saveDataToLocalStorage() {
    if (!currentClassId) return; // Não salvar se a turma não estiver definida
    const state = getCurrentContestState();
    try {
      localStorage.setItem(getLocalStorageKey(), JSON.stringify(state));
      console.log(
        `Progresso salvo (localStorage) para a turma ${currentClassId}`
      );
    } catch (e) {
      console.error("Erro ao salvar no localStorage:", e);
      alert(
        "Não foi possível salvar o progresso automaticamente. O armazenamento do navegador pode estar cheio ou desabilitado."
      );
    }
  }

  function loadDataFromLocalStorage() {
    if (!currentClassId) return false;
    try {
      const savedDataJSON = localStorage.getItem(getLocalStorageKey());
      if (savedDataJSON) {
        const savedState = JSON.parse(savedDataJSON);
        return applyContestState(savedState, "localStorage");
      }
    } catch (e) {
      console.error("Erro ao carregar dados do localStorage:", e);
    }
    return false;
  }

  function exportStateToJsonFile() {
    if (!currentClassId) return;
    const state = getCurrentContestState();
    const jsonData = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `progresso_olimpiada_${currentClassId}_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`Progresso exportado para JSON para a turma ${currentClassId}`);
  }

  function handleImportJsonFile(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedState = JSON.parse(e.target.result);
          if (applyContestState(importedState, "json")) {
            saveDataToLocalStorage(); // Salva o estado importado no localStorage
            alert("Progresso importado com sucesso!");
          } else {
            // applyContestState já deve ter mostrado um alerta relevante
          }
        } catch (err) {
          alert(
            "Erro ao ler ou processar o arquivo JSON. Verifique se o formato está correto."
          );
          console.error("Erro ao importar JSON:", err);
        } finally {
          importFileInputElement.value = ""; // Permite re-selecionar o mesmo arquivo
        }
      };
      reader.readAsText(file);
    }
  }

  // --- 3. FUNÇÕES DE RENDERIZAÇÃO DA UI ---

  function updateCounterValue(inputElement, increment) {
    let currentValue = parseInt(inputElement.value);
    currentValue += increment;
    if (currentValue < 0) {
      currentValue = 0;
    }
    inputElement.value = currentValue;
  }

  function renderImageGallery(photosToDisplay) {
    imageGalleryContainerElement.innerHTML = ""; // Limpa a galeria anterior
    winnerDisplayAreaElement.style.display = "none"; // Esconde o anúncio do vencedor

    if (!photosToDisplay || photosToDisplay.length === 0) {
      if (originalImageList.length > 0) {
        // Se havia imagens mas foram todas eliminadas
        imageGalleryContainerElement.innerHTML =
          '<p>Votação concluída ou nenhuma foto avançou. Para reiniciar, use o botão "Reiniciar Votação da Turma".</p>';
        resetVotingButtonElement.style.display = "inline-block";
        voteProcessButtonElement.style.display = "none";
      } else {
        // Se não há imagens na lista original
        imageGalleryContainerElement.innerHTML = `<p>Nenhum desenho encontrado para a turma ${currentClassId}. Verifique a configuração.</p>`;
        if (galleryControlsElement)
          galleryControlsElement.style.display = "none"; // Esconde todos os controles
      }
      return;
    }

    // Mostra botões de controle
    if (galleryControlsElement) galleryControlsElement.style.display = "block";
    voteProcessButtonElement.style.display = "inline-block";
    resetVotingButtonElement.style.display = "none"; // Só aparece com vencedor ou se não houver mais fotos

    photosToDisplay.forEach((photoSrc) => {
      const photoNameWithoutExtension =
        photoSrc.substring(0, photoSrc.lastIndexOf(".")) || photoSrc;
      const displayName = photoNameWithoutExtension.replace(/_/g, " ");

      const itemDiv = document.createElement("div");
      itemDiv.className = "photo-item";
      itemDiv.dataset.photoSrc = photoSrc; // Guarda o src original para referência

      const img = document.createElement("img");
      img.src = `${currentClassId}/img/${photoSrc}`; // Caminho relativo à pasta da turma
      img.alt = displayName;
      img.onerror = function () {
        this.alt = `Erro ao carregar ${displayName}`;
        // Opcional: this.src = 'url_para_imagem_placeholder.png';
        itemDiv.querySelector(
          ".photo-name"
        ).textContent = `Erro: Imagem "${displayName}" não encontrada.`;
      };

      const nameP = document.createElement("p");
      nameP.className = "photo-name";
      nameP.textContent = displayName;

      const counterDiv = document.createElement("div");
      counterDiv.className = "counter";

      const minusButton = document.createElement("button");
      minusButton.textContent = "-";
      minusButton.type = "button";

      const input = document.createElement("input");
      input.type = "number";
      input.value = "0"; // Contadores zerados para cada renderização de rodada
      input.min = "0";
      input.readOnly = true;

      const plusButton = document.createElement("button");
      plusButton.textContent = "+";
      plusButton.type = "button";

      minusButton.onclick = () => updateCounterValue(input, -1);
      plusButton.onclick = () => updateCounterValue(input, 1);

      counterDiv.appendChild(minusButton);
      counterDiv.appendChild(input);
      counterDiv.appendChild(plusButton);

      itemDiv.appendChild(img);
      itemDiv.appendChild(nameP);
      itemDiv.appendChild(counterDiv);
      imageGalleryContainerElement.appendChild(itemDiv);
    });

    // Lógica para vencedor ou próxima rodada
    if (photosToDisplay.length === 1 && originalImageList.length > 0) {
      displayWinner(photosToDisplay[0]);
    } else {
      voteProcessButtonElement.textContent = "Votar Nesta Rodada";
    }
  }

  function displayWinner(winnerSrc) {
    activePhotosInContest = [winnerSrc]; // Garante que apenas o vencedor está ativo
    saveDataToLocalStorage(); // Salva o estado final com o vencedor

    imageGalleryContainerElement.innerHTML = ""; // Limpa a galeria
    voteProcessButtonElement.style.display = "none";
    resetVotingButtonElement.style.display = "inline-block";

    const winnerNameWithoutExtension =
      winnerSrc.substring(0, winnerSrc.lastIndexOf(".")) || winnerSrc;
    const winnerDisplayName = winnerNameWithoutExtension.replace(/_/g, " ");

    winnerImageElement.src = `${currentClassId}/img/${winnerSrc}`;
    winnerImageElement.alt = `Desenho Vencedor: ${winnerDisplayName}`;
    winnerNameTextElement.textContent = `Parabéns ao desenho: ${winnerDisplayName}!`;
    winnerDisplayAreaElement.style.display = "block";

    document.title = `Vencedor: ${winnerDisplayName} - Turma ${currentClassId}`;
  }

  // --- 4. LÓGICA DE VOTAÇÃO ---

  function processVotes() {
    const photoItemsInGallery =
      imageGalleryContainerElement.querySelectorAll(".photo-item");
    const votedEntries = [];

    photoItemsInGallery.forEach((item) => {
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

    if (votedEntries.length === 1 && photoItemsInGallery.length > 1) {
      // Se havia mais de um na disputa, mas só um recebeu votos, ele é o vencedor.
      activePhotosInContest = [votedEntries[0].src];
      saveDataToLocalStorage();
      displayWinner(activePhotosInContest[0]);
      return;
    }
    if (votedEntries.length === 1 && photoItemsInGallery.length === 1) {
      // Se só havia um na disputa e ele recebeu votos, ele continua sendo o vencedor
      // (Este caso já seria pego por renderGallery se activePhotosInContest já tivesse tamanho 1)
      // Mas para garantir que o estado seja salvo se o usuário "revotar" no único item:
      activePhotosInContest = [votedEntries[0].src];
      saveDataToLocalStorage();
      displayWinner(activePhotosInContest[0]);
      return;
    }

    votedEntries.sort((a, b) => b.votes - a.votes);
    const maxVotes = votedEntries[0].votes;

    const MIN_PERCENTAGE_OF_MAX_TO_ADVANCE = 0.51; // Avança se tiver mais de 50% dos votos do mais votado
    const voteThresholdToAdvance = Math.max(
      1,
      Math.floor(maxVotes * MIN_PERCENTAGE_OF_MAX_TO_ADVANCE)
    );

    let photosAdvancing = votedEntries.filter(
      (entry) => entry.votes >= voteThresholdToAdvance
    );

    // Se a regra da porcentagem não eliminou ninguém (e havia mais de um votado),
    // e todas as fotos exibidas receberam votos e passariam,
    // aplicar regra mais estrita: só quem teve o MÁXIMO de votos.
    if (
      photosAdvancing.length === votedEntries.length &&
      votedEntries.length > 1 &&
      votedEntries.length === photoItemsInGallery.length
    ) {
      console.log(
        "Regra de porcentagem não reduziu. Aplicando regra estrita: apenas máximo de votos."
      );
      photosAdvancing = votedEntries.filter(
        (entry) => entry.votes === maxVotes
      );
    }

    // Fallback: se por algum motivo a lógica acima zerar os candidatos, avançar pelo menos o(s) mais votado(s).
    if (photosAdvancing.length === 0 && votedEntries.length > 0) {
      console.warn(
        "Lógica de avanço resultou em 0 candidatos, usando fallback para os mais votados."
      );
      photosAdvancing = votedEntries.filter(
        (entry) => entry.votes === maxVotes
      );
    }

    activePhotosInContest = photosAdvancing.map((entry) => entry.src);
    saveDataToLocalStorage(); // Salva o novo estado de activePhotosInContest

    if (activePhotosInContest.length === 1) {
      displayWinner(activePhotosInContest[0]);
    } else if (activePhotosInContest.length > 1) {
      if (
        activePhotosInContest.length === photoItemsInGallery.length &&
        photosAdvancing.every((p) => p.votes === maxVotes)
      ) {
        alert(
          `Empate total com ${maxVotes} votos! ${activePhotosInContest.length} desenhos seguem para a próxima fase. Por favor, votem para desempatar!`
        );
      } else {
        alert(
          `Rodada concluída! ${activePhotosInContest.length} desenhos seguem para a próxima fase. Vote novamente!`
        );
      }
      renderImageGallery(activePhotosInContest);
    } else {
      // activePhotosInContest.length === 0
      alert(
        "Nenhuma foto atendeu aos critérios para avançar ou a votação foi concluída."
      );
      renderImageGallery([]); // Mostra a mensagem de "nenhuma foto" ou "concluído"
    }
  }

  function resetContestForClass() {
    if (!currentClassId) return;
    activePhotosInContest = [...originalImageList]; // Restaura para a lista original completa
    try {
      localStorage.removeItem(getLocalStorageKey());
      console.log(
        `Progresso (localStorage) resetado para a turma ${currentClassId}.`
      );
    } catch (e) {
      console.error("Erro ao remover do localStorage:", e);
    }
    renderImageGallery(activePhotosInContest);
    document.title = `Galeria - Turma ${currentClassId}`; // Reseta título da aba
    alert(`A votação para a turma ${currentClassId} foi reiniciada.`);
  }

  // --- 5. INICIALIZAÇÃO DA GALERIA ---
  async function initializeGalleryPage() {
    const urlParams = new URLSearchParams(window.location.search);
    currentClassId = urlParams.get("classId");

    if (!currentClassId) {
      galleryPageTitleElement.textContent = "Erro: Turma não especificada";
      imageGalleryContainerElement.innerHTML =
        "<p>Por favor, acesse esta galeria através da página principal, selecionando uma turma.</p>";
      if (galleryControlsElement) galleryControlsElement.style.display = "none";
      return;
    }

    // Mapeamento de classId para nome de exibição (opcional, mas melhora a UI)
    let displayClassName = currentClassId;
    if (currentClassId.match(/^\d+[A-Z]$/i)) {
      // Ex: 1A, 2b
      const year = currentClassId.charAt(0);
      const letter = currentClassId.substring(1).toUpperCase();
      displayClassName = `${year}° ano ${letter}`;
    }
    galleryPageTitleElement.textContent = `Galeria de Desenhos - Turma ${displayClassName}`;
    document.title = `Galeria - Turma ${displayClassName}`;

    const imageListScriptUrl = `${currentClassId}/image_list.js`; // Assume que o arquivo se chama image_list.js

    try {
      await loadScript(imageListScriptUrl);

      if (
        typeof imageFilesForThisFolder !== "undefined" &&
        Array.isArray(imageFilesForThisFolder)
      ) {
        originalImageList = [...imageFilesForThisFolder]; // Copia para não modificar a original global
      } else {
        throw new Error(
          `Variável 'imageFilesForThisFolder' não definida ou inválida em ${imageListScriptUrl}`
        );
      }
    } catch (error) {
      console.error(
        `Erro crítico ao carregar lista de imagens para ${currentClassId}:`,
        error
      );
      imageGalleryContainerElement.innerHTML = `<p>Ocorreu um erro ao carregar os desenhos da turma ${displayClassName}. Verifique se o arquivo '${currentClassId}/image_list.js' existe e está correto.</p>`;
      if (galleryControlsElement) galleryControlsElement.style.display = "none";
      return;
    }

    if (originalImageList.length === 0) {
      imageGalleryContainerElement.innerHTML = `<p>Nenhum desenho listado para a turma ${displayClassName} no arquivo '${currentClassId}/image_list.js'.</p>`;
      if (galleryControlsElement) galleryControlsElement.style.display = "none";
      return;
    }

    // Tentar carregar dados do localStorage ou iniciar com a lista completa
    if (!loadDataFromLocalStorage()) {
      activePhotosInContest = [...originalImageList];
    }
    // Se, após carregar, activePhotos estiver vazio mas a lista original não, começar do zero
    if (activePhotosInContest.length === 0 && originalImageList.length > 0) {
      activePhotosInContest = [...originalImageList];
    }

    renderImageGallery(activePhotosInContest);

    // Adicionar Event Listeners aos botões
    voteProcessButtonElement.addEventListener("click", processVotes);
    resetVotingButtonElement.addEventListener("click", resetContestForClass);
    if (exportProgressButtonElement) {
      exportProgressButtonElement.addEventListener(
        "click",
        exportStateToJsonFile
      );
    }
    if (triggerImportButtonElement && importFileInputElement) {
      triggerImportButtonElement.addEventListener("click", () =>
        importFileInputElement.click()
      );
      importFileInputElement.addEventListener("change", handleImportJsonFile);
    }
  }

  // Iniciar a galeria
  initializeGalleryPage();
});
