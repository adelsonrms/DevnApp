# DevnApp Design System: Tech-Industrial / Brutalist

Este documento define os padrões visuais e de UX para o ecossistema DevnApp, garantindo consistência em todas as modificações de interface.

## 1. Identidade Visual
O estilo é uma mistura de **Brutalismo Moderno** com estética **Industrial/Cyberpunk**.
- **Contraste**: Alto contraste entre elementos de fundo e bordas.
- **Formas**: Geometria rígida, cantos chanfrados (beveled) e ausência de arredondamentos (`rounded-none`).
- **Sentimento**: Técnico, preciso, performático e robusto.

## 2. Tipografia
- **Fonte Principal**: `Space Mono` (Monospace).
- **Estilo de Texto**:
    - Títulos e Rótulos: Sempre `UPPERCASE`.
    - Peso: Uso frequente de `font-black` (900) ou `font-bold` (700).
    - Espaçamento: `tracking-widest` para labels e `tracking-tighter` para títulos grandes.
- **Exemplo de Título**: `h2 className="text-3xl font-black tracking-tighter uppercase"`
- **Exemplo de Label**: `label className="text-[10px] font-black tracking-[0.3em] uppercase"`

## 3. Componentes Core

### TechFrame
O componente fundamental para segmentação de layout.
- **Bordas**: `border border-border-strong` (ou `border-2` para frames externos principais).
- **Cantos**: Chanfros de 45 graus implementados via `clip-path`.
- **Uso**: Envolver áreas principais como Sidebar, Content Area e Modais.

### Card
- **Bordas**: `border border-border-strong`.
- **Sombra**: Shadow sólida/brutalista (`shadow-[2px_2px_0_0_rgba(0,0,0,0.1)]`).
- **Fundo**: `bg-panel-bg`.

### Button
- **Estilo**: Borda sólida de 1px, texto em uppercase.
- **Feedback**: `active:scale-95` e `hover:brightness-110`.

## 4. Cores & Temas
O sistema suporta múltiplos presets de cores e customização manual via `ThemeContext`.
- **Configuração**: Localizada em `src/config/themes.ts`.
- **Presets Atuais**:
    - `CYBER_DARK`: O padrão neon (Matrix-inspired).
    - `INDUSTRIAL_LIGHT`: Versão clara e limpa.
    - `MATRIX_NODE`: Verde intenso sobre preto absoluto.
    - `RETRO_TERMINAL`: Tons âmbar e cinza clássico.
- **Customização**: Usuários podem sobrescrever cores individuais na página de Configurações. As cores são aplicadas dinamicamente como variáveis CSS no `:root`.

## 5. Layout & Grid
- **Segmentação**: O layout deve parecer um conjunto de módulos encaixados.
- **Espaçamento**: Uso consistente de `p-6` para containers principais e `space-y-6` para fluxo vertical.
- **Headers**: Devem ter `border-b-2 border-border-strong`.

## 6. Animações (Framer Motion)
- **Transições de Página**: `initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}`.
- **Duração**: Rápida (0.2s - 0.3s) para manter a sensação de performance.

## 7. Ícones
- **Biblioteca**: `lucide-react`.
- **Stroke Width**: 2 para ícones pequenos, 3 para destaque.
- **Sizing**: `size={14}` para botões, `size={20-24}` para cabeçalhos.
