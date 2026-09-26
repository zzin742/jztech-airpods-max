# AirPods Max — Azul-céu

Estudo visual independente criado a partir da referência enviada. Projeto separado do AUVEN.

## Abrir localmente

Na pasta deste projeto, execute `python3 -m http.server 5181 --directory dist` e abra `http://localhost:5181/`.

O site é estático, sem instalação de dependências e sem etapa de compilação. `dist/` contém a versão completa, inclusive as bibliotecas, imagens e o modelo. Também pode ser servido por qualquer hospedagem estática. A identidade da publicação privada está em `.openai/hosting.json`.

## Experiência

- Crédito “Desenvolvido por JZ TECH” no rodapé.
- Abertura azul com as imagens originais do AirPods Max azul-céu, tipografia em camadas, recorte ampliado e paralaxe discreta do mouse.
- Modelo 3D oficial de 2020 com 152 malhas e texturas originais. O arquivo USDZ não foi modificado.
- Rotação completa de 360°, separação do conjunto, sequência macro de três etapas (almofada, encaixe e alumínio) com camadas se abrindo, e recomposição.
- A desmontagem é uma coreografia visual conceitual, não um manual de reparo ou reprodução exata do interior eletrônico.
- As mesmas peças são animadas no celular. O enquadramento considera o volume de todas as peças e a altura real do texto para evitar cortes ou sobreposições. Textos ampliados, áreas de toque de pelo menos 44 px na navegação e margens de segurança para celulares.
- A preferência explícita por movimento reduzido troca a animação contínua por sete poses. A largura da tela não desativa a animação.
- Renderização sob demanda: não há loop contínuo de desenho quando tudo está parado. A rolagem é nativa, sem travar o gesto de toque.

## Arquivos principais

- `dist/index.html`: estrutura, textos e navegação.
- `dist/style.css`: composição, tipografia, responsividade.
- `dist/experience.js`: câmera, materiais, agrupamento das peças, poses e interação.
- `dist/assets/airpods-max.usdz`: modelo original Apple.
- `dist/vendor/`: Three.js 0.186.1 e dependências locais, com licença MIT.

O `USDComposer.js` local contém uma correção pequena e comentada: utiliza a conexão efetiva de `outputs:surface` e trata constantes de cor do USD PreviewSurface como lineares. Isso evita aplicar shaders desconectados e escurecer incorretamente os materiais. As texturas continuam usando seus espaços de cor apropriados.

## Verificação

Sintaxe JavaScript verificada. Prévia inspecionada em desktop, tablet (834 × 1112), celulares (320 × 640 e 390 × 844) e celular na horizontal (568 × 320 e 844 × 390): imagens carregadas, modelo 3D ativo, navegação e reversão da rolagem, vista explodida sem cortes e ausência de rolagem horizontal. A verificação móvel foi feita em viewport reduzida, não em um aparelho físico.

Consulte `SOURCES.md` para as origens e os direitos dos assets.
