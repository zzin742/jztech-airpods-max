# AirPods Max — Cada detalhe, em sintonia.

Experiência de scroll em torno do AirPods Max azul-céu: o modelo 3D oficial gira,
se separa em camadas, revela detalhes de material e volta a se recompor conforme
a página desce. Estudo visual independente da JZ TECH, sem vínculo com a Apple.

Site em produção: **https://jztech-airpods-max.vercel.app**

## Recursos

- Abertura com as imagens originais do AirPods Max azul-céu, tipografia em camadas e paralaxe discreta do mouse.
- Modelo 3D oficial (USDZ, 152 malhas e texturas originais), carregado localmente pelo Three.js. O arquivo não foi modificado.
- Rotação completa de 360°, separação do conjunto, sequência macro em três etapas (almofada, encaixe e alumínio) e recomposição, tudo conduzido pela rolagem nativa.
- As mesmas peças são animadas no celular. O enquadramento considera o volume das peças e a altura real do texto para evitar cortes ou sobreposições. Áreas de toque de pelo menos 44 px na navegação.
- `prefers-reduced-motion` troca a animação contínua por sete poses. A largura da tela não desativa a animação.
- Renderização sob demanda: nenhum loop contínuo de desenho quando tudo está parado.
- Crédito "Desenvolvido por JZ TECH" no rodapé.

A desmontagem é uma coreografia visual conceitual, não um manual de reparo nem uma
reprodução exata do interior eletrônico.

## Rodar localmente

Site estático em HTML, CSS e JavaScript. Não há dependências para instalar nem
etapa de compilação: `dist/` já contém tudo, inclusive bibliotecas, imagens e modelo.

```bash
python3 -m http.server 5181 --directory dist
```

Abra `http://localhost:5181/`. Qualquer servidor estático serve. Abrir o
`index.html` direto do disco não funciona, porque o modelo e os módulos são
carregados por `fetch` e `import`.

## Arquivos principais

- `dist/index.html`: estrutura, textos e navegação.
- `dist/style.css`: composição, tipografia e responsividade.
- `dist/experience.js`: câmera, materiais, agrupamento das peças, poses e interação.
- `dist/assets/airpods-max.usdz`: modelo original Apple.
- `dist/vendor/`: Three.js 0.186.1 e dependências locais, com licença MIT.

O `USDComposer.js` local contém uma correção pequena e comentada: utiliza a
conexão efetiva de `outputs:surface` e trata constantes de cor do USD
PreviewSurface como lineares. Isso evita aplicar shaders desconectados e
escurecer incorretamente os materiais.

## Publicação

- Vercel: projeto `jztech-airpods-max`, conectado a este repositório. Cada push
  na branch `main` publica uma nova versão. Hospedagem estática, servindo `dist/`,
  sem comando de build.
- ChatGPT Sites: a identidade da publicação privada original está em
  `.openai/hosting.json`.

## Verificação

Sintaxe JavaScript verificada. Prévia inspecionada em desktop, tablet
(834 × 1112), celulares (320 × 640 e 390 × 844) e celular na horizontal
(568 × 320 e 844 × 390): imagens carregadas, modelo 3D ativo, navegação e
reversão da rolagem, vista explodida sem cortes e ausência de rolagem
horizontal. A verificação móvel foi feita em viewport reduzida, não em um
aparelho físico.

## Licença e direitos

O código original deste projeto está sob a licença MIT (`LICENSE`).

Imagens, modelo 3D, logo e marcas Apple pertencem à Apple Inc. e mantêm seus
próprios direitos. Eles **não** estão cobertos pela licença MIT. As bibliotecas
em `dist/vendor/` mantêm suas licenças originais (Three.js e fflate, MIT).
Origens e atribuições completas em `SOURCES.md`.

---

https://jztech-airpods-max.vercel.app
