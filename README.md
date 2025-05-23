# Olimpíada de Melhor Desenho - Website

Este projeto é um website estático desenvolvido para hospedar uma "Olimpíada de Melhor Desenho" entre diferentes turmas. Ele permite que os usuários visualizem desenhos de cada turma, votem em seus favoritos através de rodadas eliminatórias e, eventualmente, determinem um desenho vencedor por turma. O progresso da votação é salvo no `localStorage` do navegador e pode ser exportado/importado como JSON.

## Funcionalidades Principais

- **Página Principal:** Lista todas as turmas participantes, com links para suas respectivas galerias.
- **Galerias de Turma:**
  - Exibe os desenhos de uma turma específica em um layout de grade responsivo.
  - Permite votar em desenhos usando um sistema de contador (+/-).
  - **Votação Iterativa:** Após cada rodada de votos, os desenhos menos votados (ou que não atingem um percentual do mais votado) são eliminados, continuando até que reste um vencedor.
  - **Persistência Local:** O progresso da votação para cada turma é salvo automaticamente no `localStorage` do navegador do usuário.
  - **Exportar/Importar Progresso:** Usuários podem exportar o estado da votação de uma turma para um arquivo JSON e importá-lo posteriormente no mesmo ou em outro navegador.
- **Design Responsivo:** Adaptado para visualização em desktops, tablets e dispositivos móveis.
- **Estilização com Variáveis CSS:** Facilita a customização do tema e das cores.
- **Estrutura de Template Único:** Utiliza um único template HTML (`gallery_template.html`) para todas as galerias de turma, simplificando a manutenção.
- **Geração Dinâmica de Listas de Imagens:** Um script Python (`generate_image_list.py`) é fornecido para criar automaticamente os arquivos JavaScript que listam as imagens de cada turma.

## Estrutura de Arquivos e Pastas

PixelArt_Contest/
├── index.html # Página principal que lista as turmas
├── gallery_template.html # Template HTML para todas as galerias de turma
├── color_variables.css # Define as variáveis de cores globais
├── main_style.css # CSS para a página principal (index.html)
├── gallery_style.css # CSS para as galerias de turma (gallery_template.html)
├── gallery_script.js # Lógica JavaScript principal para as galerias
├── generate_image_list.py # Script Python para gerar as listas de imagens
├── image_converter.py # (Opcional) Seu script utilitário para converter imagens
├── .gitignore # Arquivos e pastas a serem ignorados pelo Git
├── README.md # Este arquivo de documentação
├── requeriments.txt # Arquivo de requerimentos python para rodar os scripts
│
├── 1A/ # Exemplo de pasta para a Turma 1A
│ ├── image_list.js # Lista de imagens para a Turma 1A (gerado pelo Python)
│ └── img/ # Subpasta contendo os arquivos de imagem da Turma 1A
│ ├── desenho_aluno1.png
│ └── ...
├── 1B/
│ ├── image_list.js
│ └── img/
│ └── ...
└── ... (outras pastas de turma seguindo o mesmo padrão)

## Tecnologias Utilizadas

- HTML5
- CSS3 (com Flexbox, Grid Layout e Variáveis CSS)
- JavaScript (ES6+)
- Python 3 (para o script de geração de listas de imagens)

## Configuração e Uso

### Pré-requisitos

- Um navegador web moderno (Chrome, Firefox, Edge, Safari).
- Python 3 instalado (se você precisar modificar ou executar o script `generate_image_list.py`).

### Passos para Implementação em um Novo Ambiente (Local ou Servidor)

1. **Clonar/Copiar os Arquivos:**

    - Transfira todos os arquivos e pastas do projeto para o seu ambiente de destino (seu computador local ou o diretório raiz do seu servidor web).

2. **Organizar as Imagens das Turmas:**

    - Para cada turma participante, crie uma pasta com um identificador único (ex: `1A`, `2B`, `KidsClub`). Este identificador será usado como `classId` na URL.
    - Dentro de cada pasta de turma, crie uma subpasta chamada `img`.
    - Coloque todos os arquivos de imagem (desenhos) para aquela turma dentro da respectiva pasta `img/`. Formatos de imagem suportados pelo navegador (PNG, JPG, GIF, WebP) são recomendados.

3. **Gerar as Listas de Imagens (`image_list.js`):**

    - Navegue até a pasta raiz do projeto (`PixelArt_Contest/`) no seu terminal ou prompt de comando.
    - Execute o script Python:

      ```bash
      python -m venv .venv
      .\.venv\Scripts\Activate.ps1
      pip install -r .\requirements.txt
      python generate_image_list.py
      ```

    - Este script irá instalar um ambiente de desenvolvimento python, instalar o requerimento para o projeto e percorrer todas as subpastas que parecem ser de turmas (ex: `1A/`, `1B/`), listar os arquivos de imagem em suas subpastas `img/`, e criar/atualizar um arquivo `image_list.js` dentro de cada pasta de turma.
    - O conteúdo de cada `[classId]/image_list.js` será uma variável JavaScript `imageFilesForThisFolder` contendo um array com os nomes dos arquivos de imagem, por exemplo:

      ```javascript
      // Em 1A/image_list.js
      const imageFilesForThisFolder = ["desenho_ana.png", "pintura_joao.jpg"];
      ```

    - **Importante:** Execute este script sempre que adicionar, remover ou renomear imagens nas pastas das turmas.

4. **Atualizar Links na Página Principal (`index.html`):**

    - Abra o arquivo `index.html`.
    - Para cada turma que você configurou, certifique-se de que há um link `<a>` correspondente. O `href` deve apontar para `gallery_template.html` com o parâmetro `classId` correto:

      ```html
      <a
        href="gallery_template.html?classId=NOMEDAPASTADATURMA"
        class="class-link"
        >Nome da Turma Visível</a
      >
      ```

      Exemplo:

      ```html
      <a href="gallery_template.html?classId=3C" class="class-link">3° ano C</a>
      ```

5. **Acessar o Site:**
    - **Localmente:** Abra o arquivo `index.html` diretamente no seu navegador.
    - **Em um Servidor Web:** Faça o upload de toda a estrutura de arquivos para o seu servidor web (ex: Apache, Nginx, GitHub Pages, Netlify, etc.). Acesse o site através do URL fornecido pelo seu servidor.

### Como Funciona a Votação

1. O usuário acessa a página principal (`index.html`) e clica no link de uma turma.
2. O `gallery_template.html` é carregado, e o `gallery_script.js` é executado.
3. O script lê o `classId` da URL, carrega o `[classId]/image_list.js` correspondente e exibe as imagens.
4. O progresso anterior (se houver) é carregado do `localStorage`.
5. Os usuários votam usando os botões `+` e `-` em cada imagem.
6. Ao clicar em "Votar Nesta Rodada":
    - Os votos são contados.
    - As imagens que não atingem o limiar de votos (baseado em uma porcentagem da mais votada) são eliminadas.
    - Se restar mais de uma imagem, uma nova rodada de votação começa com as imagens restantes.
    - Se restar apenas uma imagem, ela é declarada vencedora para aquela turma.
7. O estado atual das fotos ativas é salvo no `localStorage` após cada ação significativa (voto, reset).

## Customização

### Cores e Tema

- As cores do site são definidas como variáveis CSS no arquivo `color_variables.css`.
- Para alterar o esquema de cores, modifique os valores das variáveis neste arquivo.
- As variáveis semânticas (ex: `--theme-background-primary`, `--theme-accent-primary`) permitem alterar a aparência de forma consistente.

### Lógica de Votação

- No arquivo `gallery_script.js`, a constante `MIN_PERCENTAGE_OF_MAX_TO_ADVANCE` (atualmente definida como `0.51`) controla o quão rigorosa é a eliminação. Um valor maior tornará mais difícil para as imagens avançarem.

### Textos

- Todos os textos visíveis para o usuário estão diretamente nos arquivos HTML (`index.html`, `gallery_template.html`) ou são definidos como strings no `gallery_script.js` (para alertas e mensagens dinâmicas). Eles estão em português e podem ser editados conforme necessário.

## Considerações e Possíveis Melhorias

- **Segurança da Votação:** Como este é um site puramente front-end, a votação ocorre no navegador do cliente. Não há validação no lado do servidor, o que significa que um usuário tecnicamente habilidoso poderia manipular os votos localmente. Para uma votação oficial ou crítica, seria necessário um backend.
- **Gerenciamento de Grande Número de Imagens:** Para um número muito grande de imagens por turma, o carregamento inicial e a renderização podem se tornar lentos. Paginação ou "lazy loading" de imagens poderiam ser implementados.
- **Backup Centralizado de Votos:** O `localStorage` é específico do navegador. A funcionalidade de exportar/importar JSON permite um backup manual, mas para um sistema robusto de coleta de resultados, um backend seria ideal.
- **Autenticação de Usuário:** Não há sistema de login. Qualquer pessoa com acesso ao link pode votar.
- **Tratamento Avançado de Erros:** O script possui tratamento básico de erros, mas poderia ser expandido para uma melhor experiência do usuário em casos de falha.

## Contribuições

Contribuições para este projeto são bem-vindas. Por favor, abra uma issue para discutir mudanças importantes antes de submeter um pull request.

## Licença

Este projeto é licenciado sob a Licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

---
