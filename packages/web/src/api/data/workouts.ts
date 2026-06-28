export interface Exercise {
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
  rest?: string;
  instruction: string;
  cue: string;
  safetyNote?: string;
}

export interface Workout {
  id: string;
  name: string;
  type: "forca" | "recuperacao" | "cardio" | "reset";
  phase: "fundacao" | "construcao" | "forca";
  durationMinutes: 7 | 15 | 25;
  description: string;
  exercises: Exercise[];
  finishMessage: string;
}

export const workouts: Workout[] = [

  // ═══════════════════════════════════════════════════════════════════
  // FASE 1 — FUNDAÇÃO
  // Objetivo: padrões de movimento, estabilidade, consistência.
  // Base: Fleck & Kraemer — adaptação neuromuscular inicial.
  // ═══════════════════════════════════════════════════════════════════

  // ── FUNDAÇÃO · 7 min ─────────────────────────────────────────────

  {
    id: "f-7-reset-basico",
    name: "Reset Básico",
    type: "reset",
    phase: "fundacao",
    durationMinutes: 7,
    description: "7 minutos. O suficiente para hoje. Respiração + mobilidade básica.",
    exercises: [
      {
        name: "Respiração Diafragmática",
        duration: "2 min",
        instruction:
          "Deita-te ou senta-te. Mão no peito, mão na barriga. Inspira 4s, expira 6s. A barriga sobe, o peito fica quieto.",
        cue: "Deixa o ar vir até à barriga.",
      },
      {
        name: "Rotação de Anca (deitado)",
        sets: 2,
        reps: "8 cada lado",
        instruction:
          "Joelhos dobrados, pés no chão. Deixa os joelhos caírem para um lado, mantém ombros no chão. Segura 2s.",
        cue: "Não forces. O peso da gravidade faz o trabalho.",
      },
      {
        name: "Cat-Cow (mobilidade coluna)",
        sets: 2,
        reps: "8",
        instruction:
          "Gatas. Inspire e arqueia a coluna para baixo (cow). Expire e curva para cima (cat). Lento e controlado.",
        cue: "Vértebra a vértebra.",
      },
      {
        name: "Agachamento Assistido",
        sets: 1,
        reps: "5",
        instruction:
          "Segura numa parede ou cadeira. Pés à largura dos ombros. Desce devagar em 3s, pausa em baixo, sobe.",
        cue: "Joelhos seguem os dedos dos pés.",
        safetyNote: "Dor no joelho = para. Esforço muscular = continua.",
      },
    ],
    finishMessage: "Apareceste. Isso já conta.",
  },

  {
    id: "f-7-mobilidade-matinal",
    name: "Mobilidade Matinal",
    type: "recuperacao",
    phase: "fundacao",
    durationMinutes: 7,
    description: "Acorda o corpo sem o forçar. Perfeito para manhãs com pouca energia.",
    exercises: [
      {
        name: "Alongamento do Pescoço",
        duration: "1 min",
        instruction:
          "Orelha ao ombro, 30s cada lado. Peso da cabeça, sem forçar. Respira.",
        cue: "Suave. O pescoço guarda muito stress.",
      },
      {
        name: "Abertura de Ombros (parede)",
        duration: "1 min",
        instruction:
          "Encosta o antebraço numa parede. Vira o corpo para o lado oposto. Sentes no peito e ombro anterior.",
        cue: "Mantém o peito para fora, não deixa o ombro subir.",
      },
      {
        name: "Hip Flexor Stretch (estocada baixa)",
        sets: 2,
        reps: "30s cada lado",
        instruction:
          "Joelho de trás no chão. Avança a anca para a frente sem arquear as costas. Tensão na frente da coxa de trás.",
        cue: "Anca para a frente, não as costas para trás.",
      },
      {
        name: "World's Greatest Stretch",
        sets: 1,
        reps: "5 cada lado",
        instruction:
          "Estocada com mão do lado de fora do pé. Cotovelo para o chão, depois abre o braço para o tecto. Devagar.",
        cue: "Respira em cada posição.",
      },
    ],
    finishMessage: "O corpo agradece. Vemo-nos amanhã.",
  },

  {
    id: "f-7-ativacao-rapida",
    name: "Ativação Rápida",
    type: "forca",
    phase: "fundacao",
    durationMinutes: 7,
    description: "7 minutos para acender o sistema nervoso. Para os dias em que o tempo é zero.",
    exercises: [
      {
        name: "Hip Bridge Pulsante",
        sets: 2,
        reps: "15",
        instruction:
          "Deitado, joelhos dobrados. Levanta a anca e faz pulsos rápidos de 2-3 cm no topo. Glúteos sempre contraídos.",
        cue: "Não descanças no chão — a tensão é contínua.",
      },
      {
        name: "Marcha com Elevação de Joelho",
        duration: "1 min",
        instruction:
          "Em pé, traz cada joelho até à anca alternadamente. Braços a balançar. Ritmo moderado.",
        cue: "Não és corredor — és marinheiro. Controlo.",
      },
      {
        name: "Wall Sit",
        sets: 2,
        duration: "20s",
        rest: "20s",
        instruction:
          "Costas encostadas à parede, joelhos a 90°. Segura. Respira normalmente.",
        cue: "Aperta as coxas como se quisesses juntar os joelhos.",
      },
      {
        name: "Push-up Negativo (parede)",
        sets: 2,
        reps: "6",
        instruction:
          "Mãos na parede à largura dos ombros. Desce o corpo para a parede em 4s. Empurra de volta em 1s.",
        cue: "A descida lenta é onde o músculo cresce.",
      },
    ],
    finishMessage: "7 minutos. Mais do que quem ficou no sofá.",
  },

  // ── FUNDAÇÃO · 15 min ────────────────────────────────────────────

  {
    id: "f-15-fundamentos",
    name: "Fundamentos do Movimento",
    type: "forca",
    phase: "fundacao",
    durationMinutes: 15,
    description: "Os 5 padrões fundamentais. Sem peso. Perfeito para recalibrar o corpo.",
    exercises: [
      {
        name: "Ativação Glútea (bridge)",
        sets: 3,
        reps: "12",
        rest: "45s",
        instruction:
          "Deitado, joelhos dobrados. Empurra os calcanhares no chão, levanta a anca, aperta os glúteos no topo. Desce controlado.",
        cue: "Aperta os glúteos — não os isquiotibiais. Pés mais perto se sentires mais nas coxas.",
      },
      {
        name: "Agachamento Bodyweight",
        sets: 3,
        reps: "10",
        rest: "60s",
        instruction:
          "Pés à largura dos ombros, ligeiramente virados para fora. Desce em 3s como se fosses sentar numa cadeira atrás.",
        cue: "Peito para fora, olhar em frente.",
        safetyNote: "Joelhos a cair para dentro = para e reinicia com amplitude menor.",
      },
      {
        name: "Push-up Modificado (joelhos ou parede)",
        sets: 3,
        reps: "8",
        rest: "60s",
        instruction:
          "Mãos à largura dos ombros. Corpo em linha reta. Desce até quase tocar, sobe completo.",
        cue: "Cotovelos a 45° do corpo. Não quebres a anca.",
      },
      {
        name: "Dead Bug",
        sets: 2,
        reps: "8 cada lado",
        rest: "45s",
        instruction:
          "Deitado, costas coladas ao chão. Braços ao tecto, joelhos a 90°. Estende braço oposto + perna oposta em simultâneo. Costas não saem do chão.",
        cue: "As costas ficam no chão. Sempre.",
      },
      {
        name: "Farmer's Carry (improvised)",
        duration: "3 rondas × 20m",
        instruction:
          "Agarra 2 sacos com peso (ou garrafas de água). Caminha ereto, ombros para trás, core ativo.",
        cue: "Não deixes os ombros cair. Respira normalmente.",
      },
    ],
    finishMessage: "Fundação sólida. É assim que começa.",
  },

  {
    id: "f-15-cardio-funcional",
    name: "Cardio Funcional Base",
    type: "cardio",
    phase: "fundacao",
    durationMinutes: 15,
    description: "Cardio sem impacto. Para o sistema aeróbio sem destruir as articulações.",
    exercises: [
      {
        name: "Marcha no Lugar",
        duration: "3 min",
        instruction:
          "Começa devagar. Joelhos até à anca, braços a balançar. Aumenta o ritmo nos últimos 30s.",
        cue: "Aquece o sistema. Não é sprint.",
      },
      {
        name: "Step Lateral",
        duration: "2 min",
        instruction:
          "Passos largos para os lados, alternando. Mantém os joelhos ligeiramente dobrados.",
        cue: "Aterragem suave. Absorve o impacto.",
      },
      {
        name: "Squat to Stand",
        sets: 3,
        reps: "10",
        rest: "30s",
        instruction:
          "Agacha com mãos no chão, estende as pernas, volta a dobrar, levanta-te. Movimento fluido.",
        cue: "Sem pressa. Mobilidade em movimento.",
      },
      {
        name: "Mountain Climber Lento",
        sets: 3,
        duration: "30s",
        rest: "30s",
        instruction:
          "Posição de prancha, traz joelho ao peito alternadamente. Ritmo controlado — não é corrida.",
        cue: "Anca em baixo. Se subir, para e repositiona.",
      },
      {
        name: "Cool Down: Caminhada Lenta",
        duration: "2 min",
        instruction:
          "Anda devagar pelo espaço. Respira fundo. Deixa o ritmo cardíaco baixar naturalmente.",
        cue: "O arrefecimento é treino também.",
      },
    ],
    finishMessage: "Sistema aeróbio ativado. Melhor do que ontem.",
  },

  {
    id: "f-15-core-estabilidade",
    name: "Core & Estabilidade",
    type: "forca",
    phase: "fundacao",
    durationMinutes: 15,
    description: "Core profundo. Não é abdominais — é controlo motor. A base de tudo.",
    exercises: [
      {
        name: "Bird Dog",
        sets: 3,
        reps: "8 cada lado",
        rest: "45s",
        instruction:
          "Gatas, coluna neutra. Estende braço direito + perna esquerda em simultâneo. Segura 2s no topo. Não deixa a anca rodar.",
        cue: "Imagina um copo de água nas costas — não entornas.",
      },
      {
        name: "Prancha Baixa (cotovelos)",
        sets: 3,
        duration: "20–30s",
        rest: "45s",
        instruction:
          "Cotovelos no chão alinhados com os ombros. Corpo em linha. Aperta core, glúteos e coxas em simultâneo.",
        cue: "Não aguentes a respiração — respira normalmente.",
      },
      {
        name: "Hollow Body Hold",
        sets: 3,
        duration: "15–20s",
        rest: "45s",
        instruction:
          "Deitado de costas. Zona lombar colada ao chão. Levanta pernas a 45° e braços acima da cabeça. Mantém.",
        cue: "A zona lombar não sai do chão. Se sair, dobra mais os joelhos.",
      },
      {
        name: "Glute Bridge Unilateral",
        sets: 2,
        reps: "10 cada lado",
        rest: "45s",
        instruction:
          "Bridge normal, mas estende uma perna. Sobe e desce com controlo. O quadril não tomba para o lado livre.",
        cue: "Anca nivelada. Glúteo da perna de suporte é quem trabalha.",
      },
      {
        name: "Rotação de Coluna (sentado)",
        sets: 2,
        reps: "10 cada lado",
        instruction:
          "Senta-te cruzado no chão ou numa cadeira. Braços cruzados no peito. Roda suavemente o torso. Anca fica quieta.",
        cue: "Rotas o torso — não a anca.",
      },
    ],
    finishMessage: "Core forte. A partir daqui, tudo fica mais estável.",
  },

  {
    id: "f-15-pernas-gluteos",
    name: "Pernas & Glúteos",
    type: "forca",
    phase: "fundacao",
    durationMinutes: 15,
    description: "Foco no trem inferior. Agachamento, ponte e dobradiça de anca. Sem peso, com intenção.",
    exercises: [
      {
        name: "Hip Bridge com Pausa",
        sets: 3,
        reps: "12 + 2s pausa",
        rest: "45s",
        instruction:
          "Bridge normal mas segura 2 segundos no topo. A pausa elimina momentum e isola o glúteo.",
        cue: "Imagina que estás a apertar uma laranja entre os glúteos.",
      },
      {
        name: "Agachamento Sumo",
        sets: 3,
        reps: "12",
        rest: "60s",
        instruction:
          "Pés mais largos que os ombros, bicos dos pés virados para fora ~45°. Desce com o peito ereto. Joelhos seguem a direção dos pés.",
        cue: "Empurra os joelhos para fora na subida.",
      },
      {
        name: "Reverse Lunge",
        sets: 3,
        reps: "10 cada perna",
        rest: "60s",
        instruction:
          "De pé, dá um passo para trás e baixa o joelho de trás até quase tocar o chão. Volta à posição inicial. Mais fácil no joelho que o lunge à frente.",
        cue: "O joelho da frente não passa a ponta do pé.",
        safetyNote: "Dor no joelho = reduz a amplitude de descida.",
      },
      {
        name: "Good Morning (bodyweight)",
        sets: 3,
        reps: "12",
        rest: "45s",
        instruction:
          "De pé, mãos atrás da cabeça. Dobra levemente os joelhos. Inclina o torso para a frente a partir das ancas até sentir tensão nos isquiotibiais. Volta ereto.",
        cue: "É a anca que dobra — não a coluna que curva.",
      },
      {
        name: "Calf Raises",
        sets: 2,
        reps: "20",
        rest: "30s",
        instruction:
          "De pé, ponta dos pés. Sobe tão alto quanto podes, desce controlado até o calcanhar quase tocar o chão.",
        cue: "Topo: 1 segundo de pausa. Não ressaltas.",
      },
    ],
    finishMessage: "Pernas e glúteos trabalhados. O trem inferior agradece.",
  },

  // ── FUNDAÇÃO · 25 min ────────────────────────────────────────────

  {
    id: "f-25-forca-fundacao",
    name: "Força em Construção",
    type: "forca",
    phase: "fundacao",
    durationMinutes: 25,
    description: "Treino completo de força funcional. Todos os padrões de movimento principais.",
    exercises: [
      {
        name: "Aquecimento: Mobilidade Dinâmica",
        duration: "4 min",
        instruction:
          "Rotações de tornozelo 30s cada, balancés de perna 30s cada, rotações de braço 30s, hip circles 30s cada. Devagar.",
        cue: "Acende os músculos — não os parte.",
      },
      {
        name: "Agachamento Goblet (com objeto pesado)",
        sets: 4,
        reps: "10",
        rest: "75s",
        instruction:
          "Segura um objeto pesado ao peito (mochila, garrafa grande). Agacha profundo com o torso ereto.",
        cue: "Cotovelos para dentro das coxas na descida.",
        safetyNote: "Joelhos não dobram para dentro. Dor no joelho = menos amplitude.",
      },
      {
        name: "Push-up (variação adequada)",
        sets: 4,
        reps: "máx -2 (para antes de falhar)",
        rest: "75s",
        instruction:
          "Usa a variação que consegues fazer bem: parede, joelhos ou tradicional. Desce em 3s, sobe em 1s.",
        cue: "A última rep tem de ser tão boa quanto a primeira.",
      },
      {
        name: "Romanian Deadlift (com mochila ou objeto)",
        sets: 3,
        reps: "10",
        rest: "75s",
        instruction:
          "Pés à largura das ancas. Desliza o objeto pelas coxas abaixo até sentires tensão nos isquiotibiais. Volta ereto.",
        cue: "Costas planas. A dobra da anca é quem move — não as costas.",
        safetyNote: "Dor na zona lombar = para. Tensão nos isquiotibiais = correto.",
      },
      {
        name: "Prancha",
        sets: 3,
        duration: "20–40s",
        rest: "45s",
        instruction:
          "Cotovelos no chão, corpo em linha. Aperta o core, glúteos e quadricípites em simultâneo.",
        cue: "Não aguentes a respiração. Respira normalmente.",
      },
      {
        name: "Alongamento Final",
        duration: "3 min",
        instruction:
          "Hip flexor 30s cada, isquiotibiais em pé 30s cada, peitoral na porta 30s, pescoço 30s cada lado.",
        cue: "Mereces isto.",
      },
    ],
    finishMessage: "Treino completo. O corpo registou.",
  },

  {
    id: "f-25-corpo-completo-a",
    name: "Corpo Completo A",
    type: "forca",
    phase: "fundacao",
    durationMinutes: 25,
    description: "Treino full-body com foco no empurrar e trem inferior. Par com 'Corpo Completo B'.",
    exercises: [
      {
        name: "Ativação (3 min)",
        duration: "3 min",
        instruction:
          "Hip circles 10 cada lado, arm circles 10 cada lado, squat to stand 8 reps, inseções escapulares em prancha 10 reps.",
        cue: "Acorda as articulações antes de as carregar.",
      },
      {
        name: "Agachamento com Tempo (3-1-1)",
        sets: 4,
        reps: "10",
        rest: "75s",
        instruction:
          "Desce em 3s, pausa 1s em baixo, sobe em 1s. O tempo sob tensão é o estímulo — não a velocidade.",
        cue: "3 segundos a descer. Conta em voz alta.",
      },
      {
        name: "Dip (numa cadeira)",
        sets: 3,
        reps: "8–12",
        rest: "60s",
        instruction:
          "Mãos nas bordas de uma cadeira atrás de ti. Dobra os cotovelos e baixa o corpo. Cotovelos apontam para trás — não para os lados.",
        cue: "Não deixas os ombros subir até às orelhas.",
      },
      {
        name: "Reverse Lunge Alternado",
        sets: 3,
        reps: "12 total (6 cada)",
        rest: "60s",
        instruction:
          "Passo para trás alternando pernas. Ritmo controlado, sempre voltando ao centro.",
        cue: "Usa o glúteo para voltar à posição — não o joelho.",
      },
      {
        name: "Elevated Push-up (pés numa cadeira)",
        sets: 3,
        reps: "6–8",
        rest: "75s",
        instruction:
          "Pés elevados numa cadeira, mãos no chão. Faz o push-up normal. Aumenta o trabalho nos ombros e peito superior.",
        cue: "Corpo em linha — anca não cai nem sobe.",
      },
      {
        name: "Prancha com Toque de Ombro",
        sets: 3,
        reps: "10 total (5 cada)",
        rest: "45s",
        instruction:
          "Posição de push-up. Com uma mão toca no ombro oposto. A anca não roda — resiste à rotação.",
        cue: "Pernas mais abertas = mais estável.",
      },
    ],
    finishMessage: "Treino A completo. O corpo pediu. Entregaste.",
  },

  {
    id: "f-25-corpo-completo-b",
    name: "Corpo Completo B",
    type: "forca",
    phase: "fundacao",
    durationMinutes: 25,
    description: "Treino full-body com foco no puxar e posterior da coxa. Par com 'Corpo Completo A'.",
    exercises: [
      {
        name: "Ativação Posterior (3 min)",
        duration: "3 min",
        instruction:
          "Superman 10 reps, dead bug 8 cada lado, hip bridge 12 reps. Ativa o que vai trabalhar.",
        cue: "Liga o motor antes de o acelerar.",
      },
      {
        name: "Romanian Deadlift com Pausa",
        sets: 4,
        reps: "10 + 1s no fundo",
        rest: "75s",
        instruction:
          "Hip hinge até sentires tensão máxima nos isquiotibiais. Segura 1s. Volta com os glúteos a puxar.",
        cue: "Quando parares em baixo, sentes os isquiotibiais a puxar — isso é certo.",
      },
      {
        name: "Inverted Row (mesa ou barra baixa)",
        sets: 3,
        reps: "8–10",
        rest: "75s",
        instruction:
          "Deita-te sob uma mesa robusta. Agarra a beira. Corpo em linha. Puxa o peito até à beira da mesa. O melhor exercício de puxar sem barra.",
        cue: "Cotovelos colados ao corpo. Não balanças.",
      },
      {
        name: "Nordic Curl (assistido)",
        sets: 3,
        reps: "5–8",
        rest: "90s",
        instruction:
          "Joelhos no chão, alguém ou um objeto segura os tornozelos. Desce o corpo para a frente o mais lentamente possível. Usa as mãos para voltar.",
        cue: "Só a descida conta — 5 segundos. A subida é com ajuda.",
        safetyNote: "É intenso para os isquiotibiais. Se sentires cãibra, para imediatamente.",
      },
      {
        name: "Prancha Lateral com Elevação de Anca",
        sets: 3,
        reps: "10 cada lado",
        rest: "45s",
        instruction:
          "Posição de prancha lateral. Baixa a anca quase ao chão, sobe até à posição neutra. Lento e controlado.",
        cue: "O corpo mantém-se em linha — não tombas para a frente.",
      },
      {
        name: "Cool Down: Alongamento Posterior",
        duration: "3 min",
        instruction:
          "Pigeon pose 45s cada, forward fold em pé 30s, cat-cow 8 reps, child's pose 30s.",
        cue: "A recuperação é parte do treino.",
      },
    ],
    finishMessage: "Padrões de puxar e dobradiça. A base do atleta.",
  },

  {
    id: "f-25-hiit-iniciante",
    name: "HIIT Iniciante",
    type: "cardio",
    phase: "fundacao",
    durationMinutes: 25,
    description: "Intervalos controlados para iniciantes. Sem impacto elevado. Cardio que respeita as articulações.",
    exercises: [
      {
        name: "Aquecimento Progressivo",
        duration: "5 min",
        instruction:
          "Marcha no lugar 2min → step lateral 1min → squat suave 1min → rotações de ombro 30s + anca 30s.",
        cue: "Nunca pules o aquecimento no cardio.",
      },
      {
        name: "Bloco 1: Trabalho/Repouso (20s/40s × 4)",
        duration: "4 rondas",
        instruction:
          "20s de agachamento rápido + 40s de descanso ativo (marcha lenta). 4 rondas seguidas.",
        cue: "No trabalho: vai ao limite. No descanso: recupera a sério.",
      },
      {
        name: "Bloco 2: Mountain Climbers Alternados (20s/40s × 4)",
        duration: "4 rondas",
        instruction:
          "20s de mountain climbers moderados + 40s de respiração controlada de pé.",
        cue: "Anca em baixo. Se sobe, reduz o ritmo.",
      },
      {
        name: "Bloco 3: Step Laterais Rápidos (20s/40s × 4)",
        duration: "4 rondas",
        instruction:
          "20s de steps laterais o mais rápido possível + 40s de marcha lenta.",
        cue: "Aterragem suave. Absorve com os joelhos.",
      },
      {
        name: "Cool Down",
        duration: "4 min",
        instruction:
          "Caminhada lenta 1min, forward fold 30s, hip flexor 30s cada, respiração 4-6 por 1min.",
        cue: "O batimento cardíaco desce. Deixa-o.",
      },
    ],
    finishMessage: "Cardiovascular ativado. Cada sessão melhora a seguinte.",
  },

  // ═══════════════════════════════════════════════════════════════════
  // FASE 2 — CONSTRUÇÃO
  // Objetivo: aumentar volume, intensidade e complexidade.
  // Base: Kraemer & Häkkinen — periodização linear e unilateral.
  // ═══════════════════════════════════════════════════════════════════

  // ── CONSTRUÇÃO · 7 min ───────────────────────────────────────────

  {
    id: "c-7-ativacao-neural",
    name: "Ativação Neural",
    type: "forca",
    phase: "construcao",
    durationMinutes: 7,
    description: "7 minutos de ativação de alta qualidade. Para quando o tempo é curto mas a intenção é máxima.",
    exercises: [
      {
        name: "Hip Thrust Pulsante",
        sets: 2,
        reps: "20 pulsos",
        instruction:
          "Bridge no topo. Pulsos rápidos de 5cm. Glúteos contraídos o tempo todo. A tensão não baixa.",
        cue: "Não é velocidade — é contração contínua.",
      },
      {
        name: "Push-up Explosivo",
        sets: 2,
        reps: "5",
        instruction:
          "Push-up normal mas na subida empurras com força para as mãos perderem o contacto com o chão. Aterra suave.",
        cue: "Explosão total na subida. Controlo total na descida.",
      },
      {
        name: "Agachamento Isométrico (wall sit)",
        sets: 2,
        duration: "30s",
        rest: "20s",
        instruction:
          "Costas na parede, joelhos a 90°. Aperta as coxas, o core e respira normalmente.",
        cue: "O desconforto é a adaptação a acontecer.",
      },
    ],
    finishMessage: "Curto. Intenso. Feito.",
  },

  {
    id: "c-7-recuperacao-ativa",
    name: "Recuperação Ativa",
    type: "recuperacao",
    phase: "construcao",
    durationMinutes: 7,
    description: "Depois de treinos intensos. Sangue em movimento, músculos em recuperação.",
    exercises: [
      {
        name: "Caminhada com Respiração",
        duration: "2 min",
        instruction:
          "Caminha devagar. Inspira 4 passos, expira 4 passos. Sistema parassimpático ativo.",
        cue: "Ativa a recuperação — não a destruição.",
      },
      {
        name: "Pigeon Pose",
        duration: "45s cada lado",
        instruction:
          "Perna dianteira dobrada à frente, perna traseira estendida para trás. Inclina o torso para a frente sobre a perna dobrada.",
        cue: "Respira para dentro da tensão. Ela dissolve.",
      },
      {
        name: "Child's Pose + Lat Stretch",
        duration: "2 min",
        instruction:
          "Child's pose base 1min. Depois caminha as mãos para cada lado 30s — sentes o grande dorsal a alongar.",
        cue: "Deixa a gravidade trabalhar. Tu apenas respiras.",
      },
    ],
    finishMessage: "Recuperares bem é treinar bem.",
  },

  // ── CONSTRUÇÃO · 15 min ──────────────────────────────────────────

  {
    id: "c-15-forca-progressiva",
    name: "Força Progressiva",
    type: "forca",
    phase: "construcao",
    durationMinutes: 15,
    description: "Aumentamos a carga e o volume. O corpo já conhece os movimentos.",
    exercises: [
      {
        name: "Agachamento com Pausa",
        sets: 4,
        reps: "8 + 2s pausa em baixo",
        rest: "90s",
        instruction:
          "Desce, segura 2 segundos no fundo, sobe explosivo. A pausa elimina momentum e isola os músculos.",
        cue: "2 segundos de silêncio em baixo.",
      },
      {
        name: "Push-up com Descida Lenta",
        sets: 4,
        reps: "6–8 (5s descida)",
        rest: "90s",
        instruction:
          "Desce em 5 segundos. Sobe normal. A parte excêntrica é onde o músculo crescesse.",
        cue: "Conta em voz alta: 5-4-3-2-1.",
      },
      {
        name: "Isometric Hold (split squat)",
        sets: 3,
        duration: "30s cada perna",
        rest: "60s",
        instruction:
          "Estocada estática. Segura. Joelho de trás não toca. Torso ereto.",
        cue: "Aperta o glúteo da perna de trás.",
      },
      {
        name: "Superman Hold",
        sets: 3,
        reps: "10 + 2s hold",
        rest: "45s",
        instruction:
          "De barriga para baixo. Levanta braços e pernas ao mesmo tempo. Segura 2s, desce controlado.",
        cue: "Ativa glúteos e dorsais em simultâneo.",
      },
    ],
    finishMessage: "Estás a construir. Não a começar — a construir.",
  },

  {
    id: "c-15-unilateral-pernas",
    name: "Unilateral — Pernas",
    type: "forca",
    phase: "construcao",
    durationMinutes: 15,
    description: "Treino unilateral: uma perna de cada vez. Corrige desequilíbrios, trabalha mais o core e os estabilizadores.",
    exercises: [
      {
        name: "Step-Up (cadeira ou degrau)",
        sets: 3,
        reps: "10 cada perna",
        rest: "60s",
        instruction:
          "Coloca um pé numa cadeira resistente. Empurra com o calcanhar para subir. Sobe completamente antes de descer. Não saltas.",
        cue: "É o glúteo de cima que puxa — não o pé de baixo que empurra.",
      },
      {
        name: "Single-Leg Romanian Deadlift",
        sets: 3,
        reps: "8 cada lado",
        rest: "75s",
        instruction:
          "De pé, shift o peso para uma perna. Dobra a anca para a frente, a perna livre vai para trás em linha com o torso. Mantém a anca nivelada.",
        cue: "As duas ancas apontam para o chão — não rotes.",
        safetyNote: "Se perderes o equilíbrio, coloca a ponta do pé livre no chão levemente.",
      },
      {
        name: "Split Squat (estocada estática)",
        sets: 3,
        reps: "10 cada perna",
        rest: "75s",
        instruction:
          "Pé dianteiro à frente, pé traseiro atrás. Desce o joelho de trás até quase tocar o chão. Sobe. Não alternas — terminas todas as reps de um lado.",
        cue: "O joelho da frente mantém-se alinhado com o 2º dedo do pé.",
      },
      {
        name: "Single-Leg Glute Bridge",
        sets: 3,
        reps: "12 cada lado",
        rest: "45s",
        instruction:
          "Bridge normal mas com uma perna estendida no ar. A anca não tomba para o lado livre.",
        cue: "A anca fica nivelada. Core ativo.",
      },
    ],
    finishMessage: "Uma perna de cada vez. Equilíbrio real.",
  },

  {
    id: "c-15-empurrar-puxar",
    name: "Empurrar + Puxar",
    type: "forca",
    phase: "construcao",
    durationMinutes: 15,
    description: "Treino de pull/push superset. Máximo estímulo em mínimo tempo. Base da hipertrofia.",
    exercises: [
      {
        name: "Superset 1A: Push-up",
        sets: 4,
        reps: "8–10",
        instruction:
          "Push-up completo. Se ainda não consegues do chão, usa a variação de joelhos ou inclinada.",
        cue: "Corpo rígido como uma prancha. Do inicio ao fim.",
      },
      {
        name: "Superset 1B: Inverted Row (mesa)",
        sets: 4,
        reps: "8–10",
        rest: "60s (depois do par)",
        instruction:
          "Imediatamente após o push-up. Deita-te sob uma mesa, agarra a beira, puxa o peito até cima. Cotovelos colados ao corpo.",
        cue: "Escápulas juntas no topo. Segura 1s.",
      },
      {
        name: "Superset 2A: Pike Push-up",
        sets: 3,
        reps: "8",
        instruction:
          "Posição em V (pés e mãos no chão). Dobra os cotovelos e baixa a cabeça ao chão. Deltoides são o alvo.",
        cue: "Quanto mais vertical o teu torso, mais ombros trabalhas.",
      },
      {
        name: "Superset 2B: Australian Pull-up (toalha na porta)",
        sets: 3,
        reps: "8",
        rest: "75s",
        instruction:
          "Amarra uma toalha na maçaneta de uma porta robusta. Segura as pontas. Senta atrás, corpo recto. Puxa o peito às mãos.",
        cue: "A porta aguenta se estiver fechada e tu puxares em ângulo.",
      },
    ],
    finishMessage: "Peito, costas, ombros. Equilíbrio muscular feito.",
  },

  {
    id: "c-15-hiit-intermedio",
    name: "HIIT Intermédio",
    type: "cardio",
    phase: "construcao",
    durationMinutes: 15,
    description: "Intervalos mais curtos e mais intensos. O corpo já sabe o que é esforço.",
    exercises: [
      {
        name: "Aquecimento",
        duration: "2 min",
        instruction:
          "Marcha rápida no lugar 1min + 10 arm swings + 10 hip circles cada lado.",
        cue: "Prepara o sistema — não negligencies.",
      },
      {
        name: "Circuito 1 (30s on / 15s off × 3)",
        duration: "3 rondas",
        instruction:
          "30s de burpees modificados (sem salto) → 15s descanso. Repete 3 vezes seguidas.",
        cue: "Vai ao teu limite. Depois descansa. É isso.",
      },
      {
        name: "Circuito 2 (30s on / 15s off × 3)",
        duration: "3 rondas",
        instruction:
          "30s de mountain climbers rápidos → 15s descanso. 3 rondas.",
        cue: "Anca baixa. Ritmo alto. Core ativo.",
      },
      {
        name: "Circuito 3 (30s on / 15s off × 3)",
        duration: "3 rondas",
        instruction:
          "30s de agachamento com salto (ou agachamento rápido sem salto) → 15s descanso. 3 rondas.",
        cue: "Aterragem suave mesmo que faças com salto.",
      },
      {
        name: "Cool Down",
        duration: "2 min",
        instruction:
          "Respiração 4-6 por 1min, forward fold 30s, hip flexor 30s.",
        cue: "Desce o ritmo com intenção.",
      },
    ],
    finishMessage: "Capacidade cardiovascular a crescer. Sessão a sessão.",
  },

  {
    id: "c-15-mobilidade-avancada",
    name: "Mobilidade Avançada",
    type: "recuperacao",
    phase: "construcao",
    durationMinutes: 15,
    description: "Mobilidade de nível 2. Para quem já passou o básico e quer mais amplitude e controlo.",
    exercises: [
      {
        name: "90/90 Hip Stretch",
        duration: "1 min cada lado",
        instruction:
          "Senta-te com ambas as pernas dobradas a 90°. Uma perna à frente, outra ao lado. Inclina o torso sobre a perna dianteira. Troca.",
        cue: "Mantém a coluna direita enquanto inclinas — não arredondas.",
      },
      {
        name: "Deep Squat Hold",
        duration: "2 min",
        instruction:
          "Agachamento fundo, calcanhares no chão (se não consegues, põe um livro ou toalha enrolada sob os calcanhares). Mãos juntas a empurrar os joelhos para fora.",
        cue: "Respira. Deixa a anca afundar com cada expiração.",
      },
      {
        name: "Thoracic Extension (na cadeira)",
        sets: 2,
        reps: "10",
        instruction:
          "Senta-te numa cadeira. Entrelança as mãos atrás da cabeça. Deixa a coluna torácica arquejar para trás sobre o encosto da cadeira. Vértebra a vértebra.",
        cue: "É a coluna torácica que abre — não a zona lombar.",
      },
      {
        name: "Loaded Stretch Isquiotibiais",
        duration: "45s cada lado",
        instruction:
          "Pé elevado numa cadeira. Inclinares sobre a perna elevada com o torso recto. Dobra o joelho ligeiramente se necessário.",
        cue: "Sentes na parte de trás da coxa. Respira.",
      },
      {
        name: "Quadruped Hip CARs (Controlled Articular Rotations)",
        sets: 2,
        reps: "5 cada lado",
        instruction:
          "Gatas. Leva um joelho em rotação completa: fora, acima, dentro, abaixo. Movimento lento e controlado. Máxima amplitude possível.",
        cue: "Apenas o joelho se move. O torso e as costas ficam quietos.",
      },
    ],
    finishMessage: "Amplitude é força também. Nunca esqueças.",
  },

  // ── CONSTRUÇÃO · 25 min ──────────────────────────────────────────

  {
    id: "c-25-hipertrofia-a",
    name: "Hipertrofia — Trem Superior",
    type: "forca",
    phase: "construcao",
    durationMinutes: 25,
    description: "Volume alto para o trem superior. Peito, ombros, tríceps e costas. Progressão de carga com método superset.",
    exercises: [
      {
        name: "Aquecimento Ombros + Escapulas",
        duration: "3 min",
        instruction:
          "Arm circles 10 cada direção, band/toalha pull-aparts 15 reps, inseções escapulares em prancha 10 reps.",
        cue: "Os ombros são a articulação mais lesionada. Aquece-os bem.",
      },
      {
        name: "Superset A1: Push-up Inclinado (pés elevados)",
        sets: 4,
        reps: "8",
        rest: "imediatamente para A2",
        instruction:
          "Pés numa cadeira, mãos no chão. Faz push-up completo. Trabalha o peito superior e ombros anteriores.",
        cue: "Corpo em linha desde os calcanhares à cabeça.",
      },
      {
        name: "Superset A2: Inverted Row largo",
        sets: 4,
        reps: "8–10",
        rest: "90s",
        instruction:
          "Inverted row com mãos mais abertas que o normal. Cotovelos afastam do corpo — foco no trapézio médio.",
        cue: "Escápulas juntas no topo. Peito ao encontro das mãos.",
      },
      {
        name: "Superset B1: Pike Push-up",
        sets: 3,
        reps: "8–10",
        rest: "imediatamente para B2",
        instruction:
          "Em V invertido, baixa a cabeça entre as mãos. Trabalha os deltoides.",
        cue: "Quanto mais vertical o teu torso, mais ombros trabalhas.",
      },
      {
        name: "Superset B2: Remo com Mochila (unilateral)",
        sets: 3,
        reps: "10 cada lado",
        rest: "75s",
        instruction:
          "Apoias uma mão e joelho numa cadeira. Com a outra mão puxas a mochila ao longo do corpo até à anca.",
        cue: "Cotovelo sobe acima da linha das costas. Roda o ombro para cima.",
      },
      {
        name: "Superset C1: Dip (cadeira)",
        sets: 3,
        reps: "10–12",
        rest: "imediatamente para C2",
        instruction:
          "Mãos na borda da cadeira, pernas estendidas à frente. Baixas e subes. Trabalha tríceps e peito inferior.",
        cue: "Cotovelos apontam para trás, não para os lados.",
      },
      {
        name: "Superset C2: Dead Bug com Carga (livro pesado)",
        sets: 3,
        reps: "8 cada lado",
        rest: "60s",
        instruction:
          "Dead bug normal mas seguras um livro pesado com os braços estendidos ao tecto. Aumenta a exigência do core.",
        cue: "A zona lombar não sai do chão. Nunca.",
      },
    ],
    finishMessage: "Trem superior trabalhado a fundo. O músculo cresce no descanso — vai descansar.",
  },

  {
    id: "c-25-hipertrofia-b",
    name: "Hipertrofia — Trem Inferior",
    type: "forca",
    phase: "construcao",
    durationMinutes: 25,
    description: "Volume alto para o trem inferior. Glúteos, quadricípites, isquiotibiais e adutores.",
    exercises: [
      {
        name: "Aquecimento Glúteo + Anca",
        duration: "3 min",
        instruction:
          "Clamshell 15 cada lado, hip thrust com pausa 10 reps, fire hydrant 10 cada lado.",
        cue: "Liga o glúteo antes de o carregar.",
      },
      {
        name: "Bulgarian Split Squat",
        sets: 4,
        reps: "8 cada perna",
        rest: "90s",
        instruction:
          "Pé de trás elevado numa cadeira. Desce até coxa paralela ao chão. Usa peso corporal ou adiciona mochila.",
        cue: "O joelho da frente não ultrapassa o pé. Torso ligeiramente inclinado.",
        safetyNote: "Dor no joelho de trás (rótula) = reduz a elevação do pé.",
      },
      {
        name: "Hip Thrust com Carga",
        sets: 4,
        reps: "12",
        rest: "75s",
        instruction:
          "Costas no sofá ou cadeira. Mochila/peso no colo. Empurra os calcanhares, sobe a anca até à linha. Aperta no topo 2s.",
        cue: "Os joelhos ficam a 90° no topo. Mento no peito — não olhas para o tecto.",
      },
      {
        name: "Sumo Squat com Pausa",
        sets: 3,
        reps: "10 + 2s pausa",
        rest: "75s",
        instruction:
          "Pés bem abertos, bicos para fora. Desce, segura 2s, sobe. Trabalha adutores e glúteos internos.",
        cue: "Joelhos empurram para fora na descida E na subida.",
      },
      {
        name: "Nordico Assistido (isquiotibiais)",
        sets: 3,
        reps: "5–6",
        rest: "90s",
        instruction:
          "Joelhos no chão, pés seguros por algo. Desce o corpo para a frente lentamente em 5s. Usa as mãos para voltar.",
        cue: "A descida lenta é o exercício. Não atinjas velocidade.",
        safetyNote: "Muito intenso nos isquiotibiais. Começa com 3 reps se não tens treino prévio.",
      },
      {
        name: "Cool Down: Posterior Completo",
        duration: "3 min",
        instruction:
          "Pigeon pose 45s cada, lying hamstring stretch 30s cada, figure-4 stretch 30s cada.",
        cue: "Amanhã os músculos crescem. Agora descansam.",
      },
    ],
    finishMessage: "Glúteos e pernas no limite. O trabalho está feito.",
  },

  {
    id: "c-25-corpo-completo-intenso",
    name: "Full Body — Intensidade Total",
    type: "forca",
    phase: "construcao",
    durationMinutes: 25,
    description: "Treino completo de alta intensidade. Para os dias em que só há 25 minutos mas queres o máximo.",
    exercises: [
      {
        name: "Aquecimento (3 min)",
        duration: "3 min",
        instruction:
          "World's greatest stretch 5 cada lado + hip bridge 10 + arm circles 10 + squat to stand 8.",
        cue: "3 minutos para preparar 22 de trabalho real.",
      },
      {
        name: "Ronda 1: Agachamento + Push-up (AMRAP 5 min)",
        duration: "5 min AMRAP",
        instruction:
          "5 agachamentos + 5 push-ups. Repete o máximo de rondas possível em 5 minutos. Regista quantas rondas fizeste.",
        cue: "Ritmo sustentável — não arrancas a 100% na primeira ronda.",
      },
      {
        name: "Descanso",
        duration: "90s",
        instruction:
          "Recupera. Respira. Mantém-te de pé.",
        cue: "90 segundos é suficiente se trouxeres intenção.",
      },
      {
        name: "Ronda 2: Hip Hinge + Prancha (AMRAP 5 min)",
        duration: "5 min AMRAP",
        instruction:
          "8 romanian deadlifts + 20s prancha. Repete o máximo de rondas em 5 minutos.",
        cue: "A forma mantém-se mesmo quando cansas.",
      },
      {
        name: "Descanso",
        duration: "90s",
        instruction: "Recupera.",
        cue: "Última ronda a seguir.",
      },
      {
        name: "Ronda 3: Core Finisher (4 min)",
        duration: "4 min",
        instruction:
          "30s dead bug + 30s prancha lateral esq + 30s prancha lateral dir + 30s hollow hold. 2 voltas.",
        cue: "O core é o último a ir. Mantém.",
      },
    ],
    finishMessage: "AMRAP. Fizeste mais do que pensavas. Sempre.",
  },

  // ═══════════════════════════════════════════════════════════════════
  // FASE 3 — FORÇA
  // Objetivo: intensidade máxima, movimentos complexos, força real.
  // Base: Kraemer & Häkkinen — treino de força desportiva, potência.
  // ═══════════════════════════════════════════════════════════════════

  // ── FORÇA · 7 min ────────────────────────────────────────────────

  {
    id: "fo-7-potencia",
    name: "Potência em 7 Minutos",
    type: "forca",
    phase: "forca",
    durationMinutes: 7,
    description: "Alta intensidade, pouco tempo. Para quem está no nível 3 e não pode treinar muito.",
    exercises: [
      {
        name: "Squat Jump",
        sets: 3,
        reps: "6",
        rest: "30s",
        instruction:
          "Agachamento completo, salta o mais alto possível. Aterragem suave com joelhos dobrados. Absorves o impacto.",
        cue: "Braços ajudam na subida. Tudo explode ao mesmo tempo.",
        safetyNote: "Problemas no joelho = faz agachamento rápido sem salto.",
      },
      {
        name: "Push-up Explosivo",
        sets: 3,
        reps: "5",
        rest: "30s",
        instruction:
          "Push-up com impulso. Mãos perdem o contacto com o chão. Aterragem suave.",
        cue: "Potência total. Não há half-reps aqui.",
      },
      {
        name: "Tuck Jump",
        sets: 2,
        reps: "5",
        rest: "30s",
        instruction:
          "Salto com os joelhos a dobrar até ao peito no ar. Aterragem controlada.",
        cue: "Aterragem silenciosa = absorção perfeita.",
        safetyNote: "Só para quem não tem problemas no joelho ou tornozelo.",
      },
    ],
    finishMessage: "7 minutos de potência. Não precisa de mais.",
  },

  {
    id: "fo-7-reset-avancado",
    name: "Reset Avançado",
    type: "reset",
    phase: "forca",
    durationMinutes: 7,
    description: "Recuperação ativa para atletas. Mobilidade de alta amplitude.",
    exercises: [
      {
        name: "Cossack Squat",
        sets: 2,
        reps: "6 cada lado",
        instruction:
          "De pé com pés muito abertos. Transfere o peso para uma perna, dobra esse joelho, a outra perna estica. Calcanhar da perna dobrada fica no chão.",
        cue: "Se não consegues o calcanhar no chão, usa um livro sob ele.",
      },
      {
        name: "Thoracic Rotation (no chão)",
        sets: 2,
        reps: "8 cada lado",
        instruction:
          "Deitado de lado, joelhos dobrados. Braço de cima vai em arco pelo ar até ao outro lado, os olhos seguem. A anca fica quieta.",
        cue: "Abre o peito — não a anca.",
      },
      {
        name: "Hip 90/90 com Rotação Interna Ativa",
        duration: "1 min cada lado",
        instruction:
          "Posição 90/90. Empurra ativamente o joelho de trás para o chão. Segura 3s. Alivia. Repete.",
        cue: "A rotação interna é o que a maioria perde com o sedentarismo.",
      },
    ],
    finishMessage: "Mobilidade de atleta. Não de pessoa sedentária.",
  },

  // ── FORÇA · 15 min ───────────────────────────────────────────────

  {
    id: "fo-15-forca-maxima",
    name: "Força Máxima",
    type: "forca",
    phase: "forca",
    durationMinutes: 15,
    description: "Menos reps, mais intensidade. Treino de força máxima com progressão de carga.",
    exercises: [
      {
        name: "Bulgarian Split Squat (pesado)",
        sets: 5,
        reps: "5 cada perna",
        rest: "90s",
        instruction:
          "Com mochila pesada. 5 reps de alta qualidade por perna. Velocidade de descida controlada (3s), subida explosiva.",
        cue: "5 reps perfeitas valem mais que 10 medíocres.",
        safetyNote: "Reduz carga se a forma ceder na 3ª rep.",
      },
      {
        name: "Archer Push-up",
        sets: 4,
        reps: "6 cada lado",
        rest: "90s",
        instruction:
          "Push-up com um braço a estender para o lado enquanto o outro dobra. O braço estendido fica em linha com o ombro. Alterna.",
        cue: "É a progressão natural para o one-arm push-up.",
      },
      {
        name: "Prancha com Extensão de Braço",
        sets: 3,
        reps: "8 cada lado",
        rest: "60s",
        instruction:
          "De prancha, estende um braço em frente. Mantém 2s. Regressa. A anca não rota. Alterna.",
        cue: "O desafio é a anti-rotação — não a força do braço.",
      },
    ],
    finishMessage: "Força máxima exige coragem. Trouxeste-a.",
  },

  {
    id: "fo-15-hiit-avancado",
    name: "HIIT Avançado",
    type: "cardio",
    phase: "forca",
    durationMinutes: 15,
    description: "Protocolo Tabata-inspired. 20s de esforço máximo, 10s de descanso. Só para nível 3.",
    exercises: [
      {
        name: "Aquecimento (2 min)",
        duration: "2 min",
        instruction:
          "Marcha rápida 30s, jumping jacks 30s, squat pulsante 30s, arm swings 30s.",
        cue: "2 minutos de aquecimento protegem 15 de treino.",
      },
      {
        name: "Tabata 1: Squat Jump (8 rondas)",
        duration: "4 min",
        instruction:
          "20s de squat jumps + 10s de descanso. 8 rondas = 4 minutos. Esforço máximo em cada ronda.",
        cue: "Os últimos 20s devem doer tanto quanto os primeiros. Se não doem, não foste ao limite.",
      },
      {
        name: "Descanso ativo",
        duration: "1 min",
        instruction:
          "Caminha. Recupera. Prepara o sistema para o próximo bloco.",
        cue: "60 segundos. Aproveita cada um.",
      },
      {
        name: "Tabata 2: Burpee (8 rondas)",
        duration: "4 min",
        instruction:
          "20s de burpees completos + 10s descanso. 8 rondas. O burpee completo inclui salto e palmas em cima.",
        cue: "Forma antes de velocidade. Burpee errado não conta.",
      },
      {
        name: "Cool Down",
        duration: "2 min",
        instruction:
          "Caminhada 30s, forward fold 30s, hip flexor 30s cada, respiração 4-7-8 por 30s.",
        cue: "Nunca saltes o cool down depois de HIIT máximo.",
      },
    ],
    finishMessage: "Tabata. Só os que o fazem percebem.",
  },

  {
    id: "fo-15-mobilidade-desportiva",
    name: "Mobilidade Desportiva",
    type: "recuperacao",
    phase: "forca",
    durationMinutes: 15,
    description: "Recuperação de alta qualidade para atletas. Baseada em FRC (Functional Range Conditioning).",
    exercises: [
      {
        name: "CARs de Ombro",
        sets: 2,
        reps: "5 cada lado",
        instruction:
          "Braço em rotação completa e lenta. Máxima amplitude possível em cada grau. O corpo fica quieto — só o ombro se move.",
        cue: "Lento é a palavra. Cada grau de amplitude tem de ser conquistado com tensão.",
      },
      {
        name: "CARs de Anca",
        sets: 2,
        reps: "5 cada lado",
        instruction:
          "De pé, eleva um joelho à anca. Faz rotação completa. Fora → cima → dentro → baixo. O torso não se inclina.",
        cue: "Tudo o que a articulação consegue alcançar, alcança.",
      },
      {
        name: "Pancake Stretch",
        duration: "2 min",
        instruction:
          "Senta-te com as pernas em V aberto. Inclina o torso para a frente mantendo a coluna reta. Desce progressivamente.",
        cue: "Não arredondas a coluna para chegares mais longe. Isso é enganar — não alongar.",
      },
      {
        name: "Jefferson Curl",
        sets: 3,
        reps: "5 (muito lento)",
        instruction:
          "De pé, desce a coluna vértebra a vértebra para a frente — do pescoço à zona lombar. Toca nos pés se consegues. Volta do mesmo modo.",
        cue: "O exercício mais humilde que existe. E o mais eficaz para a coluna.",
        safetyNote: "Se tens hérnia ou dor lombar aguda, substitui por forward fold passivo.",
      },
      {
        name: "Couch Stretch",
        duration: "1 min cada lado",
        instruction:
          "Joelho de trás encostado à parede, pé de trás para cima. Perna da frente dobrada à frente. Fica ereto.",
        cue: "O flexor da anca está a ser libertado. Sentes. Respira.",
      },
    ],
    finishMessage: "Mobilidade de atleta. A amplitude é a tua vantagem.",
  },

  // ── FORÇA · 25 min ───────────────────────────────────────────────

  {
    id: "fo-25-forca-total",
    name: "Força Total",
    type: "forca",
    phase: "forca",
    durationMinutes: 25,
    description: "Fase avançada. Intensidade e volume altos. Só para quando já tens a consistência.",
    exercises: [
      {
        name: "Aquecimento Ativação",
        duration: "3 min",
        instruction:
          "Band pull-aparts (improvisado com toalha) 15 reps, hip thrusts 10 reps, inseção escapular em prancha 10 reps.",
        cue: "Ativa antes de carregar.",
      },
      {
        name: "Bulgarian Split Squat",
        sets: 4,
        reps: "8 cada perna",
        rest: "90s",
        instruction:
          "Pé de trás elevado numa cadeira. Desce até coxa paralela. Peso corporal ou com mochila.",
        cue: "O joelho da frente não ultrapassa o pé.",
        safetyNote: "Dor no joelho de trás (rótula) = reduz a elevação do pé.",
      },
      {
        name: "Pike Push-up",
        sets: 4,
        reps: "8–10",
        rest: "90s",
        instruction:
          "Posição em V invertido. Dobra os cotovelos e baixa a cabeça ao chão.",
        cue: "Trabalha os deltoides anteriores — o pré-requisito do shoulder press.",
      },
      {
        name: "Single-Leg RDL",
        sets: 3,
        reps: "8 cada lado",
        rest: "75s",
        instruction:
          "De pé numa perna. Dobra a anca para a frente, perna livre vai para trás em linha com o torso. Volta com controlo.",
        cue: "Mantém a anca nivelada. Sem rodar.",
      },
      {
        name: "Plank Complex",
        sets: 3,
        duration: "45s (com variações)",
        rest: "45s",
        instruction:
          "15s prancha normal + 15s prancha lateral esquerda + 15s prancha lateral direita.",
        cue: "A transição também é treino. Não colapes.",
      },
      {
        name: "Alongamento Intensivo",
        duration: "4 min",
        instruction:
          "Pigeon pose 45s cada lado, lat stretch 30s cada lado, peitoral + bíceps 30s cada, isquiotibiais 30s cada.",
        cue: "Respira para dentro da tensão. Ela dissolve.",
      },
    ],
    finishMessage: "Aqui estás. Mais forte do que estavas. É isso que importa.",
  },

  {
    id: "fo-25-atletismo-funcional",
    name: "Atletismo Funcional",
    type: "forca",
    phase: "forca",
    durationMinutes: 25,
    description: "Treino de força + potência + resistência. O treino do atleta completo.",
    exercises: [
      {
        name: "Aquecimento Ativo (3 min)",
        duration: "3 min",
        instruction:
          "Leg swings 10 cada lado, hip circles 10 cada lado, push-up suave 8, squat to stand 8.",
        cue: "Prepara o corpo para o que aí vem.",
      },
      {
        name: "Bloco Força: Squat + Press (5 rondas)",
        duration: "5 rondas",
        instruction:
          "5 bulgarian split squats cada perna → 8 pike push-ups. Sem descanso entre exercícios. 60s entre rondas.",
        cue: "A qualidade mantém-se mesmo na ronda 5.",
      },
      {
        name: "Descanso",
        duration: "2 min",
        instruction:
          "Hidrata. Respira. Prepara o bloco seguinte.",
        cue: "2 minutos para resetar o sistema.",
      },
      {
        name: "Bloco Potência: 3 exercícios × 3 rondas",
        duration: "9 min",
        instruction:
          "5 squat jumps + 5 push-ups explosivos + 10 mountain climbers rápidos. 30s descanso entre rondas. 3 rondas.",
        cue: "Potência = força × velocidade. Os dois têm de estar presentes.",
      },
      {
        name: "Bloco Core Final (3 min)",
        duration: "3 min",
        instruction:
          "Dead bug 8 cada lado + prancha 30s + hollow hold 20s. 2 voltas sem descanso.",
        cue: "O core não descansa no fim — é o último a ir.",
      },
    ],
    finishMessage: "Força. Potência. Resistência. Feito.",
  },

  {
    id: "fo-25-resistencia-muscular",
    name: "Resistência Muscular",
    type: "cardio",
    phase: "forca",
    durationMinutes: 25,
    description: "Volume altíssimo, pouco descanso. Treino de resistência muscular — força que dura.",
    exercises: [
      {
        name: "Aquecimento (3 min)",
        duration: "3 min",
        instruction:
          "Marcha alta 1min, jump rope simulado 1min, world's greatest stretch 4 cada lado.",
        cue: "Vai aquecendo porque o que vem a seguir não perdoa.",
      },
      {
        name: "Circuito 1 — Trem Inferior (12 min EMOM)",
        duration: "12 min",
        instruction:
          "Cada minuto no início do minuto: 8 split squats cada perna. O resto do minuto é descanso. 6 rondas.",
        cue: "EMOM = Every Minute On the Minute. A velocidade de execução determina o descanso.",
      },
      {
        name: "Descanso",
        duration: "2 min",
        instruction: "Recupera.",
        cue: "O último bloco é o mais duro.",
      },
      {
        name: "Circuito 2 — Trem Superior (6 min EMOM)",
        duration: "6 min",
        instruction:
          "Cada minuto: 8 push-ups + 8 remos (com mochila ou inverted row). O resto é descanso. 3 rondas.",
        cue: "Forma impecável mesmo no minuto 6.",
      },
      {
        name: "Finisher: 100 reps divididas",
        duration: "até acabar",
        instruction:
          "50 squats + 30 push-ups + 20 hip thrusts. Podes dividir como quiseres. Para quando acabares.",
        cue: "O tempo não importa. A qualidade importa.",
      },
    ],
    finishMessage: "Resistência muscular real. O músculo que resiste é o músculo que serve.",
  },

];

export function getWorkoutById(id: string): Workout | undefined {
  return workouts.find((w) => w.id === id);
}

export function getWorkoutsForPhase(
  phase: string,
  type?: string,
  duration?: number
): Workout[] {
  return workouts.filter((w) => {
    if (w.phase !== phase) return false;
    if (type && w.type !== type) return false;
    if (duration && w.durationMinutes !== duration) return false;
    return true;
  });
}

export function getDailyWorkout(
  phase: string,
  _segment: string,
  dayOfWeek: number
): Workout {
  const phaseWorkouts = workouts.filter((w) => w.phase === phase);
  const index = dayOfWeek % phaseWorkouts.length;
  return phaseWorkouts[index] || workouts[0];
}

export function getSavedayWorkout(): Workout {
  return (
    workouts.find((w) => w.durationMinutes === 7 && w.type === "reset") ||
    workouts[0]
  );
}
