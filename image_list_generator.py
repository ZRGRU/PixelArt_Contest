import os
import json # Ou apenas strings diretas para o array JS

def gerar_lista_js_para_pasta(caminho_pasta_turma, nome_arquivo_js="image_list.js"):
    pasta_img = os.path.join(caminho_pasta_turma, "img")
    arquivos_imagem = []
    if os.path.isdir(pasta_img):
        for f in os.listdir(pasta_img):
            if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                arquivos_imagem.append(f)

    # Conteúdo do arquivo JS
    # Ex: const imageFilesForThisFolder = ['foto1.png', 'foto2.jpg'];
    conteudo_js = f"const imageFilesForThisFolder = {json.dumps(arquivos_imagem)};"

    caminho_arquivo_js_saida = os.path.join(caminho_pasta_turma, nome_arquivo_js)
    with open(caminho_arquivo_js_saida, 'w', encoding='utf-8') as f_js:
        f_js.write(conteudo_js)
    print(f"Gerado '{caminho_arquivo_js_saida}' com {len(arquivos_imagem)} imagens.")

if __name__ == "__main__":
    pasta_raiz_olimpiadas = os.path.dirname(os.path.abspath(__file__)) # Pega a pasta do script

    for nome_item in os.listdir(pasta_raiz_olimpiadas):
        caminho_item = os.path.join(pasta_raiz_olimpiadas, nome_item)
        # Verifica se é um diretório e se não é uma pasta "especial" (ex: .git, .venv)
        # E se parece ser uma pasta de turma (ex: começa com número ou tem 'ano' no nome)
        if os.path.isdir(caminho_item) and not nome_item.startswith('.') \
           and (nome_item[0].isdigit() or 'ano' in nome_item.lower()):
            print(f"Processando turma: {nome_item}")
            gerar_lista_js_para_pasta(caminho_item)
    print("Listas de imagens geradas.")