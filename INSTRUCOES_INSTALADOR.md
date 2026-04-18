# InstruÃ§Ãµes para Gerar o Instalador (.exe)

Este projeto foi configurado com **Electron**, permitindo que ele funcione como um software de desktop independente que pode ser instalado via pendrive.

## PrÃ©-requisitos no seu computador
1.  **Node.js**: Instale a versÃ£o LTS de [nodejs.org](https://nodejs.org/).

## Passo a Passo para gerar o software (.exe)

1.  **Baixe o cÃ³digo**: No menu lateral do AI Studio, clique em **Settings** > **Export to ZIP**.
2.  **Extraia o arquivo**: Descompacte o arquivo ZIP em uma pasta no seu computador.
3.  **Abra o Terminal**: Abra o Prompt de Comando (CMD) ou PowerShell dentro da pasta extraÃda.
4.  **Instale as dependÃªncias**: Digite o comando abaixo e aperte Enter:
    ```bash
    npm install
    ```
5.  **Gere o instalador**: Digite o comando abaixo e aperte Enter:
    ```bash
    npm run electron:build
    ```
6.  **Localize o arquivo**: ApÃ³s a conclusÃ£o, uma pasta chamada `release` serÃ¡ criada. Dentro dela, vocÃª encontrarÃ¡ o arquivo:
    *   `CÃ¡lculo de Ã ndices Financeiros Setup 1.0.0.exe`

## Como usar no Pendrive
Basta copiar esse arquivo `.exe` para o seu pendrive. VocÃª pode executÃ¡-lo em qualquer computador Windows para instalar o software permanentemente, sem precisar de internet ou navegador.

---
**Desenvolvido por: Eng. Software Rigonato**
