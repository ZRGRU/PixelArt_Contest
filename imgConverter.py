import os
from PIL import Image
from pillow_heif import register_heif_opener

# Registra o abridor de arquivos HEIF/HEIC com o Pillow
# Isso só precisa ser feito uma vez no seu script/aplicativo.
register_heif_opener()

def converter_heic_para_png_recursivo(pasta_raiz_entrada, pasta_raiz_saida):
    """
    Converte recursivamente todos os arquivos .heic ou .heif em uma pasta raiz
    e suas subpastas para PNG, mantendo a estrutura de diretórios.

    Args:
        pasta_raiz_entrada (str): A pasta raiz contendo os arquivos HEIC.
        pasta_raiz_saida (str): A pasta raiz onde os arquivos PNG convertidos
                                 e a estrutura de subpastas serão salvos.
    """
    pasta_raiz_entrada = os.path.abspath(pasta_raiz_entrada)
    pasta_raiz_saida = os.path.abspath(pasta_raiz_saida)

    if not os.path.isdir(pasta_raiz_entrada):
        print(f"Erro: Pasta raiz de entrada '{pasta_raiz_entrada}' não encontrada ou não é um diretório.")
        return

    if not os.path.exists(pasta_raiz_saida):
        os.makedirs(pasta_raiz_saida)
        print(f"Pasta raiz de saída criada: '{pasta_raiz_saida}'")

    print(f"\nIniciando conversão recursiva de HEIC/HEIF para PNG...")
    print(f"Origem: '{pasta_raiz_entrada}'")
    print(f"Destino: '{pasta_raiz_saida}'")

    total_convertidos = 0
    total_falhas = 0
    extensoes_heic = ('.heic', '.heif') # Lida com ambas as extensões, case-insensitive abaixo

    for dirpath, dirnames, filenames in os.walk(pasta_raiz_entrada):
        # dirpath: caminho completo da pasta atual que os.walk está visitando
        # dirnames: lista de nomes de subpastas na pasta atual
        # filenames: lista de nomes de arquivos na pasta atual

        # Calcula o caminho relativo da pasta atual em relação à pasta raiz de entrada
        # Isso é usado para replicar a estrutura na pasta de saída
        caminho_relativo = os.path.relpath(dirpath, pasta_raiz_entrada)

        # Cria a pasta de saída correspondente se ela não existir
        pasta_saida_atual = os.path.join(pasta_raiz_saida, caminho_relativo)
        if not os.path.exists(pasta_saida_atual):
            os.makedirs(pasta_saida_atual)
            # print(f"  Criada subpasta de saída: '{pasta_saida_atual}'") # Descomente para mais verbosidade

        for filename in filenames:
            if filename.lower().endswith(extensoes_heic):
                caminho_completo_heic = os.path.join(dirpath, filename)
                base_nome_arquivo, _ = os.path.splitext(filename)
                caminho_completo_png = os.path.join(pasta_saida_atual, base_nome_arquivo + ".png")

                try:
                    imagem_heic = Image.open(caminho_completo_heic)
                    # Alguns arquivos HEIC podem ter múltiplas imagens (ex: Live Photos)
                    # Pillow-heif por padrão carrega a imagem primária.
                    # Se você precisar de mais controle, pode iterar sobre imagem_heic.info['heif_images']
                    # mas para conversão simples, isso geralmente é suficiente.
                    imagem_heic.save(caminho_completo_png, format="PNG")
                    print(f"  Convertido: '{caminho_completo_heic}' -> '{caminho_completo_png}'")
                    total_convertidos += 1
                except Exception as e:
                    print(f"  ERRO ao converter '{caminho_completo_heic}': {e}")
                    total_falhas += 1

    print("\n--- Conversão Concluída ---")
    print(f"Total de arquivos HEIC/HEIF convertidos com sucesso: {total_convertidos}")
    print(f"Total de falhas na conversão: {total_falhas}")

# --- Exemplo de uso ---
if __name__ == "__main__":
    # Defina a pasta raiz que contém seus arquivos HEIC (e subpastas com HEIC)
    pasta_principal_com_heics = "minhas_fotos_heic_organizadas"

    # Defina a pasta onde os PNGs convertidos serão salvos (a estrutura de subpastas será replicada)
    pasta_principal_destino_pngs = "minhas_fotos_png_convertidas"

    # --- Bloco para criar uma estrutura de exemplo para teste (opcional) ---
    # Você pode remover ou comentar este bloco se já tiver suas pastas.
    if not os.path.exists(pasta_principal_com_heics):
        print(f"Criando estrutura de pastas de exemplo em '{pasta_principal_com_heics}' para teste...")
        os.makedirs(pasta_principal_com_heics)
        subpasta1 = os.path.join(pasta_principal_com_heics, "ferias_2023")
        subpasta2 = os.path.join(pasta_principal_com_heics, "eventos", "aniversario")
        os.makedirs(subpasta1)
        os.makedirs(subpasta2)
        print(f"Estrutura de exemplo criada. Por favor, adicione alguns arquivos .heic ou .heif")
        print(f"em '{pasta_principal_com_heics}', '{subpasta1}', e '{subpasta2}' para testar o script.")
        # Para um teste funcional, você precisaria colocar arquivos HEIC reais aqui.
        # Exemplo (apenas para criar arquivos vazios que o script tentará processar):
        # open(os.path.join(pasta_principal_com_heics, "raiz.heic"), "w").close()
        # open(os.path.join(subpasta1, "praia.HEIC"), "w").close()
        # open(os.path.join(subpasta2, "bolo.heif"), "w").close()
        print("---")
    # --- Fim do bloco de exemplo ---

    # Verifica se a pasta de entrada existe e tem arquivos para processar
    # (esta verificação é básica, apenas para o exemplo de __main__)
    pode_executar = False
    if os.path.isdir(pasta_principal_com_heics):
        for _, _, files in os.walk(pasta_principal_com_heics):
            if any(f.lower().endswith(('.heic', '.heif')) for f in files):
                pode_executar = True
                break
        if not pode_executar:
            print(f"A pasta de entrada '{pasta_principal_com_heics}' não contém arquivos .heic ou .heif.")
            print("Adicione arquivos para testar ou modifique o caminho.")
    else:
        print(f"Pasta de entrada '{pasta_principal_com_heics}' não encontrada.")
        print("Crie-a e adicione arquivos HEIC/HEIF ou modifique o caminho no script.")


    if pode_executar:
        converter_heic_para_png_recursivo(pasta_principal_com_heics, pasta_principal_destino_pngs)