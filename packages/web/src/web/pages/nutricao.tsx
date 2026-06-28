import { useState, useEffect } from "react";
import { BottomNav } from "../components/nav";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Food {
  id: string; name: string;
  kcal: number; protein: number; carbs: number; fat: number;
  fiber?: number; category: string;
}
interface LogEntry {
  id: string; food: Food; grams: number;
  meal: "pequeno_almoco" | "almoco" | "lanche" | "jantar"; date: string;
}
interface Recipe {
  id: string; name: string;
  kcal: number; protein: number; carbs: number; fat: number;
  prepMinutes: number; tags: string[]; ingredients: string[]; steps: string[];
}

// ── Objetivo / Macros ─────────────────────────────────────────────────────────
type Objetivo = "bulk" | "manutencao" | "cut";
const OBJETIVO_CONFIG: Record<Objetivo, { label: string; desc: string; kcalMod: number; proteinPct: number; carbsPct: number; fatPct: number }> = {
  bulk:       { label: "Bulk",       desc: "Ganho muscular · excedente calórico",    kcalMod: +300, proteinPct: 0.30, carbsPct: 0.45, fatPct: 0.25 },
  manutencao: { label: "Manutenção", desc: "Recomposição · calorias de manutenção",  kcalMod:    0, proteinPct: 0.30, carbsPct: 0.45, fatPct: 0.25 },
  cut:        { label: "Cut",        desc: "Redução de gordura · défice calórico",    kcalMod: -300, proteinPct: 0.35, carbsPct: 0.40, fatPct: 0.25 },
};

// ── Food Database (75 alimentos) ──────────────────────────────────────────────
const FOOD_DB: Food[] = [
  // Proteínas animais
  { id:"f1",  name:"Frango grelhado (peito)",    kcal:165, protein:31,  carbs:0,   fat:3.6,  category:"proteína" },
  { id:"f2",  name:"Ovo inteiro",                kcal:155, protein:13,  carbs:1.1, fat:11,   category:"proteína" },
  { id:"f3",  name:"Clara de ovo",               kcal:52,  protein:11,  carbs:0.7, fat:0.2,  category:"proteína" },
  { id:"f4",  name:"Atum em lata (água)",        kcal:116, protein:26,  carbs:0,   fat:1,    category:"proteína" },
  { id:"f5",  name:"Salmão grelhado",            kcal:208, protein:20,  carbs:0,   fat:13,   category:"proteína" },
  { id:"f6",  name:"Carne vaca magra",           kcal:250, protein:26,  carbs:0,   fat:15,   category:"proteína" },
  { id:"f7",  name:"Peru (peito)",               kcal:135, protein:30,  carbs:0,   fat:1,    category:"proteína" },
  { id:"f8",  name:"Camarão cozido",             kcal:99,  protein:24,  carbs:0,   fat:0.3,  category:"proteína" },
  { id:"f9",  name:"Bacalhau cozido",            kcal:105, protein:23,  carbs:0,   fat:0.9,  category:"proteína" },
  { id:"f10", name:"Sardinha em lata (azeite)",  kcal:208, protein:25,  carbs:0,   fat:11,   category:"proteína" },
  { id:"f11", name:"Porco lombo grelhado",       kcal:195, protein:27,  carbs:0,   fat:9,    category:"proteína" },
  { id:"f12", name:"Borrego costela",            kcal:294, protein:25,  carbs:0,   fat:21,   category:"proteína" },
  { id:"f13", name:"Frango coxa s/ pele",        kcal:209, protein:26,  carbs:0,   fat:11,   category:"proteína" },
  { id:"f14", name:"Carne picada vaca (5% gord)",kcal:218, protein:26,  carbs:0,   fat:12,   category:"proteína" },
  { id:"f15", name:"Peixe espada grelhado",      kcal:147, protein:20,  carbs:0,   fat:7,    category:"proteína" },
  // Laticínios / ovos
  { id:"f16", name:"Queijo cottage",             kcal:98,  protein:11,  carbs:3.4, fat:4.3,  category:"laticínio" },
  { id:"f17", name:"Iogurte grego (0%)",         kcal:59,  protein:10,  carbs:3.6, fat:0.4,  category:"laticínio" },
  { id:"f18", name:"Whey protein (scoop 30g)",   kcal:120, protein:24,  carbs:3,   fat:1.5,  category:"suplemento" },
  { id:"f19", name:"Queijo mozzarella",          kcal:280, protein:28,  carbs:2.2, fat:17,   category:"laticínio" },
  { id:"f20", name:"Leite meio-gordo",           kcal:52,  protein:3.4, carbs:5,   fat:1.8,  category:"laticínio" },
  { id:"f21", name:"Queijo parmesão",            kcal:392, protein:36,  carbs:3.2, fat:26,   category:"laticínio" },
  { id:"f22", name:"Requeijão",                  kcal:95,  protein:7,   carbs:4.2, fat:5.5,  category:"laticínio" },
  { id:"f23", name:"Leite de vaca (magro)",      kcal:35,  protein:3.4, carbs:5,   fat:0.1,  category:"laticínio" },
  // Hidratos
  { id:"f24", name:"Arroz branco cozido",        kcal:130, protein:2.7, carbs:28,  fat:0.3,  category:"hidrato" },
  { id:"f25", name:"Arroz integral cozido",      kcal:111, protein:2.6, carbs:23,  fat:0.9,  category:"hidrato" },
  { id:"f26", name:"Batata doce cozida",         kcal:86,  protein:1.6, carbs:20,  fat:0.1,  category:"hidrato" },
  { id:"f27", name:"Aveia em flocos",            kcal:389, protein:17,  carbs:66,  fat:7,    fiber:10, category:"hidrato" },
  { id:"f28", name:"Pão integral (fatia 30g)",   kcal:74,  protein:3,   carbs:13,  fat:1,    category:"hidrato" },
  { id:"f29", name:"Massa integral cozida",      kcal:124, protein:5,   carbs:25,  fat:1.1,  category:"hidrato" },
  { id:"f30", name:"Massa branca cozida",        kcal:131, protein:4.5, carbs:27,  fat:0.9,  category:"hidrato" },
  { id:"f31", name:"Batata cozida",              kcal:87,  protein:1.9, carbs:20,  fat:0.1,  category:"hidrato" },
  { id:"f32", name:"Quinoa cozida",              kcal:120, protein:4.4, carbs:22,  fat:1.9,  fiber:2.8, category:"hidrato" },
  { id:"f33", name:"Pão de centeio (fatia)",     kcal:65,  protein:2.2, carbs:12,  fat:0.9,  category:"hidrato" },
  { id:"f34", name:"Torrada integral",           kcal:335, protein:11,  carbs:65,  fat:3.7,  category:"hidrato" },
  { id:"f35", name:"Granola s/ açúcar",          kcal:390, protein:11,  carbs:55,  fat:14,   category:"hidrato" },
  // Leguminosas
  { id:"f36", name:"Feijão preto cozido",        kcal:132, protein:8.9, carbs:24,  fat:0.5,  fiber:8.7, category:"leguminosa" },
  { id:"f37", name:"Grão cozido",                kcal:164, protein:8.9, carbs:27,  fat:2.6,  fiber:7.6, category:"leguminosa" },
  { id:"f38", name:"Lentilhas cozidas",          kcal:116, protein:9,   carbs:20,  fat:0.4,  fiber:7.9, category:"leguminosa" },
  { id:"f39", name:"Feijão encarnado cozido",    kcal:127, protein:8.7, carbs:22,  fat:0.5,  fiber:7.4, category:"leguminosa" },
  { id:"f40", name:"Feijão branco cozido",       kcal:139, protein:9.7, carbs:25,  fat:0.4,  fiber:6.3, category:"leguminosa" },
  { id:"f41", name:"Ervilhas cozidas",           kcal:84,  protein:5.4, carbs:15,  fat:0.4,  fiber:5.7, category:"leguminosa" },
  // Legumes
  { id:"f42", name:"Brócolo cozido",             kcal:35,  protein:2.4, carbs:7,   fat:0.4,  fiber:2.6, category:"legume" },
  { id:"f43", name:"Espinafres crus",            kcal:23,  protein:2.9, carbs:3.6, fat:0.4,  fiber:2.2, category:"legume" },
  { id:"f44", name:"Couve portuguesa",           kcal:28,  protein:2,   carbs:5,   fat:0.4,  category:"legume" },
  { id:"f45", name:"Alface",                     kcal:15,  protein:1.4, carbs:2.9, fat:0.2,  category:"legume" },
  { id:"f46", name:"Tomate",                     kcal:18,  protein:0.9, carbs:3.9, fat:0.2,  category:"legume" },
  { id:"f47", name:"Pepino",                     kcal:16,  protein:0.7, carbs:3.6, fat:0.1,  category:"legume" },
  { id:"f48", name:"Cenoura crua",               kcal:41,  protein:0.9, carbs:10,  fat:0.2,  category:"legume" },
  { id:"f49", name:"Curgete cozida",             kcal:17,  protein:1.2, carbs:3.5, fat:0.2,  category:"legume" },
  { id:"f50", name:"Pimento vermelho",           kcal:31,  protein:1,   carbs:7,   fat:0.3,  category:"legume" },
  { id:"f51", name:"Cogumelos salteados",        kcal:35,  protein:3.6, carbs:5.2, fat:0.5,  category:"legume" },
  { id:"f52", name:"Cebola crua",                kcal:40,  protein:1.1, carbs:9.3, fat:0.1,  category:"legume" },
  // Fruta
  { id:"f53", name:"Banana",                     kcal:89,  protein:1.1, carbs:23,  fat:0.3,  category:"fruta" },
  { id:"f54", name:"Maçã",                       kcal:52,  protein:0.3, carbs:14,  fat:0.2,  category:"fruta" },
  { id:"f55", name:"Laranja",                    kcal:47,  protein:0.9, carbs:12,  fat:0.1,  category:"fruta" },
  { id:"f56", name:"Morango",                    kcal:32,  protein:0.7, carbs:7.7, fat:0.3,  category:"fruta" },
  { id:"f57", name:"Mirtilos",                   kcal:57,  protein:0.7, carbs:14,  fat:0.3,  category:"fruta" },
  { id:"f58", name:"Abacate (metade)",           kcal:160, protein:2,   carbs:8.5, fat:15,   category:"fruta" },
  { id:"f59", name:"Kiwi",                       kcal:61,  protein:1.1, carbs:15,  fat:0.5,  category:"fruta" },
  // Gorduras / frutos secos
  { id:"f60", name:"Azeite",                     kcal:884, protein:0,   carbs:0,   fat:100,  category:"gordura" },
  { id:"f61", name:"Amêndoas",                   kcal:579, protein:21,  carbs:22,  fat:50,   category:"gordura" },
  { id:"f62", name:"Nozes",                      kcal:654, protein:15,  carbs:14,  fat:65,   category:"gordura" },
  { id:"f63", name:"Manteiga amendoim (nat.)",   kcal:588, protein:25,  carbs:20,  fat:50,   category:"gordura" },
  { id:"f64", name:"Sementes chia",              kcal:486, protein:17,  carbs:42,  fat:31,   fiber:34, category:"gordura" },
  { id:"f65", name:"Azeite de côco",             kcal:862, protein:0,   carbs:0,   fat:100,  category:"gordura" },
  { id:"f66", name:"Cajus",                      kcal:553, protein:18,  carbs:30,  fat:44,   category:"gordura" },
  // Bebidas / outros
  { id:"f67", name:"Leite de amêndoa (s/ açúcar)",kcal:13, protein:0.5, carbs:0.3, fat:1.1, category:"bebida" },
  { id:"f68", name:"Sumo de laranja natural",    kcal:45,  protein:0.7, carbs:10,  fat:0.2,  category:"bebida" },
  { id:"f69", name:"Café (expresso)",            kcal:2,   protein:0.1, carbs:0,   fat:0,    category:"bebida" },
  { id:"f70", name:"Creatina (scoop 5g)",        kcal:0,   protein:0,   carbs:0,   fat:0,    category:"suplemento" },
  { id:"f71", name:"Mel",                        kcal:304, protein:0.3, carbs:82,  fat:0,    category:"outro" },
  { id:"f72", name:"Molho soja",                 kcal:53,  protein:8.1, carbs:4.9, fat:0.6,  category:"outro" },
  { id:"f73", name:"Arroz de milho cozido",      kcal:130, protein:2.5, carbs:28,  fat:0.5,  category:"hidrato" },
  { id:"f74", name:"Flocos de milho (cornflakes)",kcal:357,protein:7,   carbs:84,  fat:0.9,  category:"hidrato" },
  { id:"f75", name:"Iogurte natural (sem açúcar)",kcal:61, protein:3.5, carbs:4.7, fat:3.3,  category:"laticínio" },
];

const FOOD_CATEGORIES = ["todos", "proteína", "hidrato", "leguminosa", "legume", "fruta", "gordura", "laticínio", "suplemento", "bebida"];

// ── Recipe Database (30 receitas) ─────────────────────────────────────────────
const RECIPES: Recipe[] = [
  { id:"r1",  name:"Bowl de Frango High-Protein",      kcal:520, protein:48, carbs:42, fat:12, prepMinutes:20, tags:["alta proteína","sem glúten","sem lactose"],             ingredients:["200g peito de frango","150g arroz integral","80g brócolo","1 col. azeite","Limão, alho"],        steps:["Grelha o frango temperado com limão e alho 8-10 min.","Coze o arroz integral.","Brócolo a vapor 5 min.","Monta o bowl. Rega com azeite."] },
  { id:"r2",  name:"Omelete 4 Ovos com Espinafres",    kcal:380, protein:32, carbs:4,  fat:26, prepMinutes:10, tags:["alta proteína","sem glúten","sem lactose","sem açúcar","vegetariano"], ingredients:["4 ovos","80g espinafres","1 col. azeite","Sal, pimenta"],                              steps:["Bate ovos com sal e pimenta.","Salteia espinafres 2 min.","Junta ovos. Dobra quando firmar."] },
  { id:"r3",  name:"Salmão com Batata Doce",           kcal:490, protein:35, carbs:38, fat:14, prepMinutes:25, tags:["alta proteína","sem glúten","sem lactose"],             ingredients:["180g salmão","200g batata doce","Alecrim, alho, azeite","Limão"],                             steps:["Assa batata doce 20 min (200°C).","Grelha salmão 4 min cada lado.","Serve com limão e ervas."] },
  { id:"r4",  name:"Porridge de Aveia Proteico",       kcal:420, protein:28, carbs:52, fat:8,  prepMinutes:5,  tags:["vegetariano","sem açúcar","alta proteína"],             ingredients:["80g aveia","250ml leite","1 scoop whey baunilha","Canela"],                                 steps:["Cozinha aveia em leite 3-4 min.","Retira do lume, mistura whey.","Polvilha canela."] },
  { id:"r5",  name:"Wrap de Peru com Queijo",          kcal:440, protein:38, carbs:36, fat:14, prepMinutes:8,  tags:["alta proteína","sem açúcar"],                          ingredients:["150g peito de peru","2 wraps integrais","50g queijo mozzarella","Alface, tomate"],             steps:["Monta os wraps com peru, queijo e legumes.","Aquece 2 min em frigideiro."] },
  { id:"r6",  name:"Atum com Feijão Preto",            kcal:350, protein:36, carbs:28, fat:4,  prepMinutes:5,  tags:["alta proteína","sem glúten","sem lactose","sem açúcar"],ingredients:["1 lata atum","200g feijão preto","Cebola roxa, salsa","Azeite, vinagre"],                      steps:["Mistura tudo numa taça.","Tempera com azeite, vinagre, sal.","Serve frio."] },
  { id:"r7",  name:"Smoothie Banana + Whey",           kcal:320, protein:30, carbs:38, fat:3,  prepMinutes:3,  tags:["alta proteína","sem glúten","vegetariano"],             ingredients:["1 banana","1 scoop whey","200ml leite ou água","Gelo"],                                       steps:["Bate tudo 30 segundos.","Bebe logo."] },
  { id:"r8",  name:"Camarão Grelhado com Massa",       kcal:460, protein:34, carbs:50, fat:9,  prepMinutes:15, tags:["alta proteína","sem lactose"],                          ingredients:["200g camarão","120g massa integral","Alho, azeite","Salsa, limão"],                          steps:["Coze a massa al dente.","Salteia alho em azeite. Junta camarão 3-4 min.","Mistura tudo. Finaliza com salsa e limão."] },
  { id:"r9",  name:"Bowl Vegano de Lentilhas",         kcal:390, protein:22, carbs:52, fat:8,  prepMinutes:15, tags:["vegan","vegetariano","sem glúten","sem lactose","sem açúcar","alta proteína"], ingredients:["200g lentilhas cozidas","150g arroz","Espinafres","Curcuma, cominho","Azeite"],   steps:["Salteia espinafres em azeite.","Tempera lentilhas com curcuma.","Monta bowl."] },
  { id:"r10", name:"Frango ao Forno com Amêndoas",     kcal:520, protein:46, carbs:8,  fat:32, prepMinutes:30, tags:["alta proteína","sem glúten","sem lactose","sem açúcar"],ingredients:["200g peito de frango","30g amêndoas laminadas","Azeite, mel","Alecrim"],                     steps:["Cobre frango com amêndoas + alecrim. Rega azeite.","Forno 190°C, 25-28 min.","Descansa 5 min."] },
  { id:"r11", name:"Bife com Ovos e Batata Doce",      kcal:620, protein:52, carbs:35, fat:26, prepMinutes:20, tags:["alta proteína","sem glúten","sem lactose"],             ingredients:["200g bife vaca","2 ovos","200g batata doce","Azeite, alho"],                                steps:["Assa batata doce 15 min.","Grelha bife 3 min cada lado.","Frita ovos. Serve tudo."] },
  { id:"r12", name:"Frango Teriyaki com Arroz",        kcal:510, protein:44, carbs:52, fat:10, prepMinutes:20, tags:["alta proteína","sem lactose"],                          ingredients:["200g peito frango","150g arroz","3 col. molho soja","1 col. mel","Alho, gergelim"],         steps:["Marina frango em soja+mel+alho 10 min.","Grelha 8-10 min.","Serve com arroz e gergelim."] },
  { id:"r13", name:"Panquecas Proteicas",              kcal:380, protein:34, carbs:38, fat:9,  prepMinutes:10, tags:["alta proteína","sem açúcar","vegetariano"],             ingredients:["2 ovos","1 scoop whey","40g aveia moída","100ml leite","½ banana"],                         steps:["Bate tudo na liquidificadora.","Cozinha 2 min cada lado.","Come com iogurte grego."] },
  { id:"r14", name:"Bacalhau com Grão e Espinafres",   kcal:420, protein:38, carbs:34, fat:10, prepMinutes:20, tags:["alta proteína","sem glúten","sem lactose","sem açúcar"],ingredients:["200g bacalhau","200g grão","Espinafres, alho","Azeite, pimentão"],                            steps:["Coze bacalhau 10 min. Lasca.","Salteia alho + espinafres.","Junta grão e bacalhau. Rega azeite."] },
  { id:"r15", name:"Poke de Atum e Arroz",             kcal:450, protein:36, carbs:48, fat:8,  prepMinutes:10, tags:["alta proteína","sem glúten","sem lactose"],             ingredients:["150g atum","150g arroz","Abacate, pepino","Molho soja, sésamo"],                           steps:["Prepara arroz.","Corta ingredientes.","Monta tigela. Rega soja + sésamo."] },
  { id:"r16", name:"Carne Picada com Massa",           kcal:560, protein:42, carbs:48, fat:18, prepMinutes:20, tags:["alta proteína","sem lactose"],                          ingredients:["200g carne picada","100g massa integral","Curgete, pimento","Alho, azeite"],               steps:["Salteia carne picada com alho.","Junta legumes 8 min.","Mistura com massa cozida."] },
  { id:"r17", name:"Salada de Grão com Atum",          kcal:360, protein:32, carbs:28, fat:10, prepMinutes:5,  tags:["alta proteína","sem glúten","sem lactose","sem açúcar"],ingredients:["1 lata atum","200g grão","Tomate, pepino, cebola roxa","Azeite, vinagre"],                 steps:["Mistura tudo.","Tempera com azeite, vinagre e sal.","Come frio."] },
  { id:"r18", name:"Frango com Couve e Batata",        kcal:480, protein:42, carbs:38, fat:14, prepMinutes:30, tags:["alta proteína","sem glúten","sem lactose"],             ingredients:["200g coxa frango s/ pele","200g batata","Couve","Alho, azeite, louro"],                    steps:["Coze frango 20 min.","Coze batata e couve.","Serve com azeite e alho."] },
  { id:"r19", name:"Ovos Mexidos com Queijo e Peru",   kcal:340, protein:36, carbs:2,  fat:20, prepMinutes:8,  tags:["alta proteína","sem glúten","sem açúcar"],             ingredients:["4 ovos","80g peru em cubos","30g mozzarella","Azeite, cebolinho"],                         steps:["Salteia peru 2 min.","Junta ovos batidos. Mexe em lume médio.","Adiciona queijo no fim."] },
  { id:"r20", name:"Bowl Proteico Pós-Treino",         kcal:450, protein:45, carbs:42, fat:8,  prepMinutes:5,  tags:["alta proteína","sem açúcar","vegetariano"],             ingredients:["200g iogurte grego 0%","1 scoop whey","30g granola s/ açúcar","1 banana","Canela"],       steps:["Mistura iogurte com whey.","Por camadas: iogurte, granola, banana.","Polvilha canela."] },
  { id:"r21", name:"Massa com Frango e Pesto",         kcal:540, protein:40, carbs:52, fat:16, prepMinutes:15, tags:["alta proteína"],                                        ingredients:["150g peito frango","100g massa integral","2 col. pesto","Tomate cherry","Parmesão"],        steps:["Coze massa al dente.","Grelha frango em tiras.","Mistura massa, frango e pesto."] },
  { id:"r22", name:"Tortilha Espanhola Proteica",      kcal:390, protein:28, carbs:22, fat:20, prepMinutes:20, tags:["alta proteína","sem glúten","vegetariano"],             ingredients:["5 ovos","2 batatas médias","1 cebola","Azeite, salsa"],                                    steps:["Frita batata + cebola até moles.","Escorre azeite. Mistura com ovos batidos.","Cozinha 5 min cada lado."] },
  { id:"r23", name:"Frango com Abacate e Limão",       kcal:480, protein:40, carbs:8,  fat:30, prepMinutes:15, tags:["alta proteína","sem glúten","sem lactose","sem açúcar"],ingredients:["200g peito frango","1 abacate","Limão, coentros","Alho, azeite"],                           steps:["Grelha frango 8 min.","Esmaga abacate com limão e sal.","Serve frango sobre guacamole."] },
  { id:"r24", name:"Sopa Proteica de Legumes",         kcal:280, protein:22, carbs:28, fat:7,  prepMinutes:25, tags:["alta proteína","sem glúten","sem lactose","sem açúcar"],ingredients:["150g frango desfiado","Cenoura, alho-francês, aipo","100g feijão branco","Caldo, azeite"],  steps:["Refoga legumes 5 min.","Adiciona caldo 15 min.","Junta feijão + frango. Coze 5 min."] },
  { id:"r25", name:"Bifanas de Peru Grelhadas",        kcal:420, protein:44, carbs:28, fat:12, prepMinutes:12, tags:["alta proteína","sem lactose"],                          ingredients:["200g peru em fatias","2 pães integrais","Mostarda, alho, pimentão"],                       steps:["Marina peru com alho + pimentão.","Grelha 3 min cada lado.","Monta no pão com alface."] },
  { id:"r26", name:"Taças de Alface com Carne Picada", kcal:390, protein:38, carbs:10, fat:22, prepMinutes:15, tags:["alta proteína","sem glúten","sem lactose","sem açúcar"],ingredients:["200g carne picada magra","Folhas alface","Alho, gengibre, soja","Pimento, gergelim"],       steps:["Salteia alho + gengibre. Junta carne.","Adiciona pimento + soja.","Serve nas folhas de alface."] },
  { id:"r27", name:"Hambúrguer Caseiro Sem Pão",       kcal:460, protein:46, carbs:12, fat:24, prepMinutes:15, tags:["alta proteína","sem glúten","sem lactose","sem açúcar"],ingredients:["250g carne picada","1 ovo","Alho, salsa","Tomate, alface, mostarda"],                       steps:["Mistura carne com ovo + alho + salsa.","Grelha 4 min cada lado.","Serve em alface com tomate."] },
  { id:"r28", name:"Frango Picante com Feijão",        kcal:490, protein:44, carbs:38, fat:14, prepMinutes:25, tags:["alta proteína","sem glúten","sem lactose"],             ingredients:["200g peito frango","200g feijão preto","Pimentão picante, curcuma","Tomate, alho, azeite"],steps:["Salteia cebola + alho. Junta tomate + especiarias.","Adiciona frango em cubos 10 min.","Junta feijão 5 min. Finaliza com coentros."] },
  { id:"r29", name:"Salada de Massa com Atum",         kcal:430, protein:30, carbs:52, fat:9,  prepMinutes:10, tags:["alta proteína","sem lactose"],                          ingredients:["100g massa integral","1 lata atum","Milho, tomate, pepino","Azeite, orégãos"],             steps:["Coze massa. Arrefece.","Mistura com atum e legumes.","Tempera com azeite e orégãos."] },
  { id:"r30", name:"Risotto Frango e Cogumelos",       kcal:500, protein:38, carbs:54, fat:12, prepMinutes:30, tags:["alta proteína","sem lactose"],                          ingredients:["150g peito frango","120g arroz arbóreo","150g cogumelos","Caldo, alho, azeite"],          steps:["Salteia cebola + alho. Tosta arroz 2 min.","Adiciona caldo concha a concha, mexendo.","Junta frango grelhado + cogumelos."] },
];

const ALL_TAGS = ["alta proteína", "sem glúten", "sem lactose", "vegan", "vegetariano", "sem açúcar"];
const MEAL_LABELS: Record<string, string> = { pequeno_almoco:"Pequeno-almoço", almoco:"Almoço", lanche:"Lanche", jantar:"Jantar" };
const MEAL_ICONS: Record<string, string> = { pequeno_almoco:"☀", almoco:"◑", lanche:"◔", jantar:"◐" };

// ── Planos semanais ───────────────────────────────────────────────────────────
const WEEKLY_PLANS: Record<Objetivo, { day: string; meals: { label: string; desc: string }[] }[]> = {
  bulk: [
    { day:"Segunda", meals:[{label:"PA",desc:"Porridge de aveia proteico + banana"},{label:"Almoço",desc:"Bowl frango 200g + arroz 150g + brócolo"},{label:"Lanche",desc:"Smoothie whey + amendoim"},{label:"Jantar",desc:"Bife 200g + batata doce + ovo frito"}] },
    { day:"Terça",   meals:[{label:"PA",desc:"Ovos mexidos 4un + pão integral 2 fatias"},{label:"Almoço",desc:"Massa integral 120g + frango 180g + tomate"},{label:"Lanche",desc:"Iogurte grego + granola + frutos vermelhos"},{label:"Jantar",desc:"Salmão 180g + batata doce 200g"}] },
    { day:"Quarta",  meals:[{label:"PA",desc:"Panquecas proteicas + mel"},{label:"Almoço",desc:"Arroz 150g + frango 200g + feijão preto 100g"},{label:"Lanche",desc:"Banana + whey shake"},{label:"Jantar",desc:"Carne picada 200g + massa 100g + legumes"}] },
    { day:"Quinta",  meals:[{label:"PA",desc:"Porridge aveia + amêndoas + banana"},{label:"Almoço",desc:"Frango teriyaki 200g + arroz 150g"},{label:"Lanche",desc:"Queijo cottage + fruta"},{label:"Jantar",desc:"Bifanas de peru 200g + batata cozida"}] },
    { day:"Sexta",   meals:[{label:"PA",desc:"Ovos mexidos 4un + peru + queijo"},{label:"Almoço",desc:"Bowl atum + arroz + abacate"},{label:"Lanche",desc:"Whey shake + aveia"},{label:"Jantar",desc:"Hambúrguer caseiro 250g + batata doce assada"}] },
    { day:"Sábado",  meals:[{label:"PA",desc:"Tortilha espanhola + pão integral"},{label:"Almoço",desc:"Frango ao forno com amêndoas + arroz"},{label:"Lanche",desc:"Fruta + nozes 30g"},{label:"Jantar",desc:"Risotto frango + cogumelos 400g"}] },
    { day:"Domingo", meals:[{label:"PA",desc:"Panquecas proteicas + iogurte grego"},{label:"Almoço",desc:"Frango coxa + couve + batata"},{label:"Lanche",desc:"Bowl proteico pós-treino"},{label:"Jantar",desc:"Sopa proteica + pão integral 2 fatias"}] },
  ],
  manutencao: [
    { day:"Segunda", meals:[{label:"PA",desc:"Aveia 60g + leite + fruta"},{label:"Almoço",desc:"Frango 160g + arroz 120g + salada"},{label:"Lanche",desc:"Iogurte grego + maçã"},{label:"Jantar",desc:"Salmão 150g + legumes grelhados"}] },
    { day:"Terça",   meals:[{label:"PA",desc:"Omelete 3 ovos + espinafres"},{label:"Almoço",desc:"Massa integral 100g + atum + tomate"},{label:"Lanche",desc:"Queijo cottage + frutos vermelhos"},{label:"Jantar",desc:"Peru grelhado 160g + batata doce"}] },
    { day:"Quarta",  meals:[{label:"PA",desc:"Porridge proteico + canela"},{label:"Almoço",desc:"Bowl grão + atum + legumes"},{label:"Lanche",desc:"Banana + amêndoas 20g"},{label:"Jantar",desc:"Frango picante + feijão 180g"}] },
    { day:"Quinta",  meals:[{label:"PA",desc:"Pão integral 2 fatias + ovo cozido"},{label:"Almoço",desc:"Arroz 120g + bife 160g + brócolo"},{label:"Lanche",desc:"Smoothie proteico"},{label:"Jantar",desc:"Bacalhau + grão + espinafres"}] },
    { day:"Sexta",   meals:[{label:"PA",desc:"Granola s/açúcar + iogurte grego"},{label:"Almoço",desc:"Poke atum + arroz"},{label:"Lanche",desc:"Fruta + nozes"},{label:"Jantar",desc:"Carne picada + massa + legumes"}] },
    { day:"Sábado",  meals:[{label:"PA",desc:"Ovos mexidos 3un + tomate"},{label:"Almoço",desc:"Frango ao limão + batata doce"},{label:"Lanche",desc:"Iogurte + granola"},{label:"Jantar",desc:"Camarão + massa integral"}] },
    { day:"Domingo", meals:[{label:"PA",desc:"Tortilha espanhola 3 ovos"},{label:"Almoço",desc:"Frango 160g + couve + batata"},{label:"Lanche",desc:"Banana + whey"},{label:"Jantar",desc:"Sopa proteica de legumes"}] },
  ],
  cut: [
    { day:"Segunda", meals:[{label:"PA",desc:"Claras 6un + espinafres + tomate"},{label:"Almoço",desc:"Frango 180g + salada grande + azeite mínimo"},{label:"Lanche",desc:"Iogurte grego 0% + mirtilos"},{label:"Jantar",desc:"Bacalhau 160g + brócolo a vapor"}] },
    { day:"Terça",   meals:[{label:"PA",desc:"Aveia 50g + água + canela"},{label:"Almoço",desc:"Atum + grão + salada"},{label:"Lanche",desc:"Maçã + queijo cottage 100g"},{label:"Jantar",desc:"Peru grelhado 160g + espinafres"}] },
    { day:"Quarta",  meals:[{label:"PA",desc:"Omelete 3 ovos sem gema + peru"},{label:"Almoço",desc:"Frango 180g + lentilhas + legumes"},{label:"Lanche",desc:"Iogurte grego 0%"},{label:"Jantar",desc:"Salmão 150g + pepino + tomate"}] },
    { day:"Quinta",  meals:[{label:"PA",desc:"Smoothie whey + água + frutos vermelhos"},{label:"Almoço",desc:"Bowl frango + quinoa + legumes"},{label:"Lanche",desc:"Fruta + amêndoas 15g"},{label:"Jantar",desc:"Taças alface + carne picada magra"}] },
    { day:"Sexta",   meals:[{label:"PA",desc:"Aveia 40g + iogurte grego"},{label:"Almoço",desc:"Bacalhau + grão + salada"},{label:"Lanche",desc:"Maçã"},{label:"Jantar",desc:"Frango 180g + brócolo + cenoura"}] },
    { day:"Sábado",  meals:[{label:"PA",desc:"Ovos mexidos 3 claras 1 gema"},{label:"Almoço",desc:"Poke atum light + salada"},{label:"Lanche",desc:"Iogurte grego 0% + kiwi"},{label:"Jantar",desc:"Sopa proteica de legumes s/ massa"}] },
    { day:"Domingo", meals:[{label:"PA",desc:"Porridge aveia 40g + água + canela"},{label:"Almoço",desc:"Frango 160g + lentilhas + legumes"},{label:"Lanche",desc:"Cottage + pepino"},{label:"Jantar",desc:"Peru 160g + espinafres + cogumelos"}] },
  ],
};

function today() { return new Date().toISOString().split("T")[0]; }

// ── Water Tracker ─────────────────────────────────────────────────────────────
function WaterTracker() {
  const key = `water_${today()}`;
  const [ml, setMl] = useState(() => Number(localStorage.getItem(key) || "0"));
  const goal = 3000;
  const pct = Math.min(100, (ml / goal) * 100);
  const cups = Math.round(ml / 250);

  function add(amount: number) {
    setMl(prev => {
      const next = Math.max(0, prev + amount);
      localStorage.setItem(key, String(next));
      return next;
    });
  }

  const segments = 12; // 250ml each = 3000ml total
  const filled = Math.min(segments, Math.round(ml / 250));

  return (
    <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"20px", marginBottom:"16px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <div>
          <p className="label" style={{ color:"var(--text-3)", fontSize:"11px", letterSpacing:"0.06em", margin:0 }}>ÁGUA · HOJE</p>
          <div style={{ display:"flex", alignItems:"baseline", gap:"6px", marginTop:"4px" }}>
            <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:"32px", color: ml >= goal ? "var(--accent)" : "var(--text)", lineHeight:1 }}>
              {ml >= 1000 ? `${(ml/1000).toFixed(1)}L` : `${ml}ml`}
            </span>
            <span style={{ color:"var(--text-3)", fontSize:"13px" }}>/ 3.0L</span>
          </div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:"24px", color:"var(--text-2)" }}>{cups}</div>
          <div style={{ fontSize:"10px", color:"var(--text-3)", letterSpacing:"0.04em" }}>COPOS</div>
        </div>
      </div>

      {/* Segments */}
      <div style={{ display:"flex", gap:"4px", marginBottom:"16px" }}>
        {Array.from({ length: segments }).map((_, i) => (
          <div key={i} style={{
            flex:1, height:"8px", borderRadius:"4px",
            background: i < filled ? "var(--accent)" : "var(--border)",
            transition:"background 0.3s ease",
          }} />
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display:"flex", gap:"8px" }}>
        {[250, 500].map(amt => (
          <button key={amt} onClick={() => add(amt)} style={{
            flex:1, padding:"10px", background:"var(--accent-glow)",
            border:"1px solid var(--accent)", borderRadius:"10px",
            color:"var(--accent)", fontFamily:"'Barlow Condensed', sans-serif",
            fontWeight:800, fontSize:"15px", letterSpacing:"0.04em", cursor:"pointer",
          }}>
            +{amt}ml
          </button>
        ))}
        <button onClick={() => add(-250)} disabled={ml === 0} style={{
          padding:"10px 14px", background:"var(--surface)", border:"1px solid var(--border)",
          borderRadius:"10px", color:"var(--text-3)", fontFamily:"'Barlow Condensed', sans-serif",
          fontWeight:700, fontSize:"15px", cursor: ml === 0 ? "default" : "pointer",
          opacity: ml === 0 ? 0.4 : 1,
        }}>
          −
        </button>
      </div>

      {ml >= goal && (
        <div style={{ marginTop:"10px", textAlign:"center", color:"var(--accent)", fontSize:"12px", fontWeight:700, letterSpacing:"0.06em" }}>
          META ATINGIDA ✓
        </div>
      )}
    </div>
  );
}

// ── Macro Settings ────────────────────────────────────────────────────────────
// ── TDEE Calculator ───────────────────────────────────────────────────────────
type ActivityLevel = "sedentario" | "leve" | "moderado" | "ativo" | "muito_ativo";
type WorkDemand = "escritorio" | "misto" | "fisico" | "muito_fisico";

const ACTIVITY_CONFIG: Record<ActivityLevel, { label: string; desc: string; factor: number }> = {
  sedentario:   { label:"Sedentário",    desc:"Sem exercício / raramente",              factor: 1.2   },
  leve:         { label:"Leve",          desc:"1–2x/semana treino ligeiro",             factor: 1.375 },
  moderado:     { label:"Moderado",      desc:"3–4x/semana treino",                     factor: 1.55  },
  ativo:        { label:"Ativo",         desc:"5–6x/semana treino intenso",             factor: 1.725 },
  muito_ativo:  { label:"Muito Ativo",   desc:"2x/dia ou atleta",                       factor: 1.9   },
};

const WORK_DEMAND: Record<WorkDemand, { label: string; kcal: number }> = {
  escritorio:   { label:"Escritório / Sentado",     kcal:   0 },
  misto:        { label:"Misto (em pé + movimento)", kcal: 150 },
  fisico:       { label:"Físico (construção, etc.)", kcal: 350 },
  muito_fisico: { label:"Muito físico (obras pesadas)", kcal: 600 },
};

function calcBMR(weight: number, height: number, age: number, isMale: boolean): number {
  // Mifflin-St Jeor
  const base = 10 * weight + 6.25 * height - 5 * age;
  return isMale ? base + 5 : base - 161;
}

function TDEECalculator({ onSet }: { onSet: (kcal: number) => void }) {
  const [open, setOpen] = useState(false);
  const [peso, setPeso]       = useState(() => localStorage.getItem("tdee_peso") || "");
  const [altura, setAltura]   = useState(() => localStorage.getItem("tdee_altura") || "");
  const [idade, setIdade]     = useState(() => localStorage.getItem("tdee_idade") || "");
  const [sexo, setSexo]       = useState<"m"|"f">(() => (localStorage.getItem("tdee_sexo") as "m"|"f") || "m");
  const [activity, setActivity] = useState<ActivityLevel>(() => (localStorage.getItem("tdee_activity") as ActivityLevel) || "moderado");
  const [work, setWork]       = useState<WorkDemand>(() => (localStorage.getItem("tdee_work") as WorkDemand) || "escritorio");

  const tdee = (() => {
    const w = Number(peso); const h = Number(altura); const a = Number(idade);
    if (!w || !h || !a) return null;
    const bmr = calcBMR(w, h, a, sexo === "m");
    return Math.round(bmr * ACTIVITY_CONFIG[activity].factor + WORK_DEMAND[work].kcal);
  })();

  function save() {
    localStorage.setItem("tdee_peso", peso);
    localStorage.setItem("tdee_altura", altura);
    localStorage.setItem("tdee_idade", idade);
    localStorage.setItem("tdee_sexo", sexo);
    localStorage.setItem("tdee_activity", activity);
    localStorage.setItem("tdee_work", work);
    if (tdee) { onSet(tdee); setOpen(false); }
  }

  return (
    <div style={{ marginBottom:"12px" }}>
      <button onClick={() => setOpen(s => !s)} style={{
        width:"100%", padding:"12px 16px",
        background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px",
        color:"var(--text-2)", fontFamily:"'Barlow Condensed', sans-serif",
        fontWeight:700, fontSize:"14px", letterSpacing:"0.05em",
        cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center",
      }}>
        <span>🧮 CALCULAR TDEE (PESO + ALTURA + ACTIVIDADE)</span>
        <span style={{ fontSize:"18px", transition:"transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
      </button>

      {open && (
        <div className="animate-fade-up" style={{
          background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px",
          padding:"20px", marginTop:"8px",
        }}>
          {/* Sexo */}
          <div style={{ marginBottom:"16px" }}>
            <p style={{ color:"var(--text-3)", fontSize:"11px", letterSpacing:"0.06em", marginBottom:"8px" }}>SEXO BIOLÓGICO</p>
            <div style={{ display:"flex", gap:"8px" }}>
              {(["m","f"] as const).map(s => (
                <button key={s} onClick={() => setSexo(s)} style={{
                  flex:1, padding:"10px",
                  background: sexo === s ? "var(--accent)" : "var(--bg)",
                  border:`1px solid ${sexo === s ? "var(--accent)" : "var(--border)"}`,
                  borderRadius:"8px", color: sexo === s ? "#000" : "var(--text-2)",
                  fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:"15px",
                  cursor:"pointer",
                }}>
                  {s === "m" ? "Masculino" : "Feminino"}
                </button>
              ))}
            </div>
          </div>

          {/* Métricas */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginBottom:"16px" }}>
            {[
              { label:"PESO (kg)", val:peso, set:setPeso, placeholder:"80" },
              { label:"ALTURA (cm)", val:altura, set:setAltura, placeholder:"175" },
              { label:"IDADE", val:idade, set:setIdade, placeholder:"35" },
            ].map(f => (
              <div key={f.label}>
                <p style={{ color:"var(--text-3)", fontSize:"10px", letterSpacing:"0.06em", marginBottom:"6px" }}>{f.label}</p>
                <input type="number" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                  style={{ width:"100%", padding:"10px 8px", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--text)", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:"18px", outline:"none", boxSizing:"border-box" }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--accent)"}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border)"}
                />
              </div>
            ))}
          </div>

          {/* Actividade física */}
          <div style={{ marginBottom:"16px" }}>
            <p style={{ color:"var(--text-3)", fontSize:"11px", letterSpacing:"0.06em", marginBottom:"8px" }}>NÍVEL DE ACTIVIDADE FÍSICA</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
              {(Object.entries(ACTIVITY_CONFIG) as [ActivityLevel, typeof ACTIVITY_CONFIG[ActivityLevel]][]).map(([k, v]) => (
                <button key={k} onClick={() => setActivity(k)} style={{
                  padding:"10px 14px", textAlign:"left",
                  background: activity === k ? "var(--accent-glow)" : "var(--bg)",
                  border:`1px solid ${activity === k ? "var(--accent)" : "var(--border)"}`,
                  borderRadius:"8px", cursor:"pointer",
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                }}>
                  <div>
                    <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:"14px", color: activity === k ? "var(--accent)" : "var(--text)" }}>{v.label}</span>
                    <span style={{ fontSize:"11px", color:"var(--text-3)", marginLeft:"8px" }}>{v.desc}</span>
                  </div>
                  <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:"13px", color:"var(--text-3)" }}>×{v.factor}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Exigência do trabalho */}
          <div style={{ marginBottom:"20px" }}>
            <p style={{ color:"var(--text-3)", fontSize:"11px", letterSpacing:"0.06em", marginBottom:"8px" }}>EXIGÊNCIA FÍSICA DO TRABALHO</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
              {(Object.entries(WORK_DEMAND) as [WorkDemand, typeof WORK_DEMAND[WorkDemand]][]).map(([k, v]) => (
                <button key={k} onClick={() => setWork(k)} style={{
                  padding:"10px 14px", textAlign:"left",
                  background: work === k ? "var(--accent-glow)" : "var(--bg)",
                  border:`1px solid ${work === k ? "var(--accent)" : "var(--border)"}`,
                  borderRadius:"8px", cursor:"pointer",
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                }}>
                  <span style={{ fontFamily:"'Inter', sans-serif", fontSize:"13px", color: work === k ? "var(--accent)" : "var(--text-2)" }}>{v.label}</span>
                  {v.kcal > 0 && <span style={{ fontSize:"11px", color:"var(--text-3)" }}>+{v.kcal} kcal</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Resultado */}
          {tdee && (
            <div style={{ background:"var(--bg)", border:"1px solid var(--accent)", borderRadius:"12px", padding:"16px", marginBottom:"16px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:"36px", color:"var(--accent)", lineHeight:1 }}>
                {tdee} <span style={{ fontSize:"18px" }}>kcal</span>
              </div>
              <div style={{ color:"var(--text-3)", fontSize:"12px", marginTop:"4px" }}>TDEE estimado · manutenção calórica</div>
            </div>
          )}

          <button onClick={save} disabled={!tdee} style={{
            width:"100%", padding:"14px",
            background: tdee ? "var(--accent)" : "var(--border)",
            color: tdee ? "#000" : "var(--text-3)",
            border:"none", borderRadius:"10px",
            fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800,
            fontSize:"16px", letterSpacing:"0.06em", cursor: tdee ? "pointer" : "not-allowed",
          }}>
            {tdee ? `USAR ${tdee} KCAL COMO BASE` : "PREENCHE OS DADOS"}
          </button>
        </div>
      )}
    </div>
  );
}

function MacroSetup({ objetivo, setObjetivo, baseKcal, setBaseKcal }: {
  objetivo: Objetivo; setObjetivo: (o: Objetivo) => void;
  baseKcal: number; setBaseKcal: (k: number) => void;
}) {
  const cfg = OBJETIVO_CONFIG[objetivo];
  const totalKcal = baseKcal + cfg.kcalMod;

  const protein = Math.round((totalKcal * cfg.proteinPct) / 4);
  const carbs   = Math.round((totalKcal * cfg.carbsPct) / 4);
  const fat     = Math.round((totalKcal * cfg.fatPct) / 9);

  return (
    <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"20px", marginBottom:"16px" }}>
      <p className="label" style={{ color:"var(--text-3)", fontSize:"11px", letterSpacing:"0.06em", marginBottom:"12px" }}>OBJETIVO</p>

      {/* Objetivo toggle */}
      <div style={{ display:"flex", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"10px", padding:"3px", gap:"3px", marginBottom:"14px" }}>
        {(["bulk","manutencao","cut"] as Objetivo[]).map(o => (
          <button key={o} onClick={() => setObjetivo(o)} style={{
            flex:1, padding:"8px 4px",
            background: objetivo === o ? "var(--accent)" : "transparent",
            border:"none", borderRadius:"8px",
            color: objetivo === o ? "#000" : "var(--text-2)",
            fontFamily:"'Barlow Condensed', sans-serif",
            fontWeight:800, fontSize:"13px", letterSpacing:"0.06em",
            cursor:"pointer", transition:"all 0.2s",
          }}>
            {OBJETIVO_CONFIG[o].label.toUpperCase()}
          </button>
        ))}
      </div>

      <p style={{ color:"var(--text-3)", fontSize:"12px", marginBottom:"14px" }}>{cfg.desc}</p>

      {/* Base kcal */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px" }}>
        <span style={{ color:"var(--text-2)", fontSize:"13px" }}>Manutenção base</span>
        <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:"16px", color:"var(--text-2)", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"6px", padding:"4px 10px" }}>{baseKcal} kcal</span>
      </div>

      {/* Macro grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"8px" }}>
        {[
          { label:"KCAL", value:totalKcal, unit:"", color:"var(--accent)" },
          { label:"PROT", value:protein, unit:"g", color:"#60A0B8" },
          { label:"HC",   value:carbs,   unit:"g", color:"#B8A060" },
          { label:"GORD", value:fat,     unit:"g", color:"#E07040" },
        ].map(m => (
          <div key={m.label} style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"10px", padding:"10px", textAlign:"center" }}>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:"20px", color:m.color, lineHeight:1 }}>
              {m.value}{m.unit}
            </div>
            <div style={{ fontSize:"9px", color:"var(--text-3)", fontWeight:600, letterSpacing:"0.06em", marginTop:"3px" }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Calorie Counter ───────────────────────────────────────────────────────────
function CalorieCounter({ goalKcal }: { goalKcal: number }) {
  const [log, setLog] = useState<LogEntry[]>(() => { try { return JSON.parse(localStorage.getItem("nutri_log") || "[]"); } catch { return []; } });
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("todos");
  const [selected, setSelected] = useState<Food | null>(null);
  const [grams, setGrams] = useState("100");
  const [meal, setMeal] = useState<LogEntry["meal"]>("almoco");
  const [viewDate, setViewDate] = useState(today());

  useEffect(() => { localStorage.setItem("nutri_log", JSON.stringify(log)); }, [log]);

  const todayLog = log.filter(e => e.date === viewDate);
  const totals = todayLog.reduce((acc, e) => {
    const m = e.grams / 100;
    return { kcal: acc.kcal + e.food.kcal * m, protein: acc.protein + e.food.protein * m, carbs: acc.carbs + e.food.carbs * m, fat: acc.fat + e.food.fat * m };
  }, { kcal:0, protein:0, carbs:0, fat:0 });

  const pct = Math.min(100, (totals.kcal / goalKcal) * 100);

  const filtered = (() => {
    let list = FOOD_DB;
    if (catFilter !== "todos") list = list.filter(f => f.category === catFilter);
    if (search.length >= 2) list = list.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
    else if (search.length < 2 && catFilter === "todos") list = [];
    return list.slice(0, 15);
  })();

  function addEntry() {
    if (!selected || !grams) return;
    setLog(prev => [{ id:Math.random().toString(36).slice(2), food:selected, grams:Number(grams), meal, date:viewDate }, ...prev]);
    setSelected(null); setSearch(""); setGrams("100");
  }

  const byMeal = (["pequeno_almoco","almoco","lanche","jantar"] as const).reduce((acc, m) => {
    acc[m] = todayLog.filter(e => e.meal === m); return acc;
  }, {} as Record<string, LogEntry[]>);

  const proteinGoal = Math.round(goalKcal * 0.30 / 4);
  const carbsGoal   = Math.round(goalKcal * 0.45 / 4);
  const fatGoal     = Math.round(goalKcal * 0.25 / 9);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
        <input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)}
          style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"8px", padding:"8px 12px", color:"var(--text)", fontFamily:"'Inter', sans-serif", fontSize:"13px", outline:"none" }} />
        <span style={{ color: pct >= 100 ? "#E05040" : "var(--accent)", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:"15px" }}>
          {Math.round(goalKcal - totals.kcal) > 0 ? `${Math.round(goalKcal - totals.kcal)} kcal restantes` : "Meta atingida!"}
        </span>
      </div>

      {/* Progress ring */}
      <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"18px", marginBottom:"14px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"18px", marginBottom:"12px" }}>
          <svg width="76" height="76" viewBox="0 0 76 76" style={{ flexShrink:0 }}>
            <circle cx="38" cy="38" r="32" fill="none" stroke="var(--border)" strokeWidth="7" />
            <circle cx="38" cy="38" r="32" fill="none" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round"
              strokeDasharray={`${2*Math.PI*32}`}
              strokeDashoffset={`${2*Math.PI*32*(1-pct/100)}`}
              transform="rotate(-90 38 38)" style={{ transition:"stroke-dashoffset 0.4s ease" }} />
            <text x="38" y="34" textAnchor="middle" fill="var(--text)" fontSize="13" fontWeight="800" fontFamily="'Barlow Condensed', sans-serif">{Math.round(totals.kcal)}</text>
            <text x="38" y="46" textAnchor="middle" fill="var(--text-3)" fontSize="9" fontFamily="'Inter', sans-serif">kcal</text>
          </svg>
          <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px" }}>
            {[
              { label:"Prot", val:totals.protein, goal:proteinGoal, color:"#60A0B8" },
              { label:"HC",   val:totals.carbs,   goal:carbsGoal,   color:"#B8A060" },
              { label:"Gord", val:totals.fat,      goal:fatGoal,     color:"#E07040" },
            ].map(m => (
              <div key={m.label}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"3px" }}>
                  <span style={{ fontSize:"10px", color:"var(--text-3)", fontWeight:600 }}>{m.label}</span>
                  <span style={{ fontSize:"10px", color:"var(--text-2)", fontWeight:700 }}>{Math.round(m.val)}g</span>
                </div>
                <div style={{ height:"4px", background:"var(--border)", borderRadius:"2px", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${Math.min(100,(m.val/m.goal)*100)}%`, background:m.color, borderRadius:"2px", transition:"width 0.4s ease" }} />
                </div>
                <div style={{ fontSize:"9px", color:"var(--text-3)", marginTop:"2px" }}>/ {m.goal}g</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add food */}
      <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"14px", padding:"16px", marginBottom:"14px" }}>
        <p className="label" style={{ color:"var(--text-3)", marginBottom:"10px", fontSize:"11px", letterSpacing:"0.06em" }}>ADICIONAR</p>

        {/* Category filter */}
        <div style={{ display:"flex", gap:"5px", overflowX:"auto", paddingBottom:"6px", marginBottom:"8px" }}>
          {FOOD_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setCatFilter(cat); setSelected(null); setSearch(""); }}
              style={{
                padding:"4px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:600, whiteSpace:"nowrap",
                background: catFilter === cat ? "var(--accent)" : "var(--bg)",
                border:`1px solid ${catFilter === cat ? "var(--accent)" : "var(--border)"}`,
                color: catFilter === cat ? "#000" : "var(--text-2)",
                cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:"0.04em",
                textTransform:"capitalize",
              }}>
              {cat}
            </button>
          ))}
        </div>

        <input type="text" value={selected ? selected.name : search} onChange={e => { setSearch(e.target.value); setSelected(null); }}
          placeholder="Pesquisar alimento..."
          style={{ width:"100%", padding:"10px 12px", boxSizing:"border-box", background:"var(--bg)", border:`1px solid ${selected ? "var(--accent)" : "var(--border)"}`, borderRadius:"8px", color:"var(--text)", fontFamily:"'Inter', sans-serif", fontSize:"14px", outline:"none", marginBottom:"8px" }} />

        {filtered.length > 0 && !selected && (
          <div style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"10px", overflow:"hidden", marginBottom:"10px", maxHeight:"160px", overflowY:"auto" }}>
            {filtered.map(f => (
              <button key={f.id} onClick={() => { setSelected(f); setSearch(""); }}
                style={{ display:"flex", justifyContent:"space-between", width:"100%", padding:"10px 12px", background:"none", border:"none", borderBottom:"1px solid var(--border)", cursor:"pointer", textAlign:"left" }}>
                <div>
                  <span style={{ color:"var(--text)", fontSize:"13px" }}>{f.name}</span>
                  <span style={{ color:"var(--text-3)", fontSize:"11px", marginLeft:"6px", textTransform:"capitalize" }}>· {f.category}</span>
                </div>
                <span style={{ color:"var(--text-3)", fontSize:"12px", flexShrink:0 }}>{f.kcal} kcal/100g</span>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"8px" }}>
              <div>
                <label style={{ display:"block", fontSize:"10px", fontWeight:600, color:"var(--text-3)", marginBottom:"4px", letterSpacing:"0.05em", textTransform:"uppercase" }}>Quantidade (g)</label>
                <input type="number" value={grams} onChange={e => setGrams(e.target.value)}
                  style={{ width:"100%", padding:"10px", boxSizing:"border-box", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--text)", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:"16px", outline:"none" }} />
              </div>
              <div>
                <label style={{ display:"block", fontSize:"10px", fontWeight:600, color:"var(--text-3)", marginBottom:"4px", letterSpacing:"0.05em", textTransform:"uppercase" }}>Refeição</label>
                <select value={meal} onChange={e => setMeal(e.target.value as LogEntry["meal"])}
                  style={{ width:"100%", padding:"10px", boxSizing:"border-box", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--text)", fontFamily:"'Inter', sans-serif", fontSize:"13px", outline:"none" }}>
                  {(["pequeno_almoco","almoco","lanche","jantar"] as const).map(m => <option key={m} value={m}>{MEAL_LABELS[m]}</option>)}
                </select>
              </div>
            </div>
            {grams && (
              <div style={{ background:"var(--accent-glow)", border:"1px solid var(--accent)", borderRadius:"8px", padding:"8px 12px", marginBottom:"8px", display:"flex", gap:"12px", fontSize:"12px", color:"var(--accent)", fontWeight:700 }}>
                {(() => { const m = Number(grams)/100; return <><span>{Math.round(selected.kcal*m)} kcal</span><span>P: {Math.round(selected.protein*m)}g</span><span>HC: {Math.round(selected.carbs*m)}g</span><span>G: {Math.round(selected.fat*m)}g</span></>; })()}
              </div>
            )}
          </>
        )}

        <button onClick={addEntry} disabled={!selected || !grams}
          style={{ width:"100%", padding:"12px", background: selected && grams ? "var(--accent)" : "var(--border)", border:"none", borderRadius:"10px", color: selected && grams ? "#000" : "var(--text-3)", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:"16px", letterSpacing:"0.06em", cursor: selected && grams ? "pointer" : "default", transition:"all 0.2s" }}>
          + ADICIONAR
        </button>
      </div>

      {/* Log */}
      {(["pequeno_almoco","almoco","lanche","jantar"] as const).map(m => {
        const entries = byMeal[m];
        if (!entries.length) return null;
        const mTotal = entries.reduce((acc, e) => acc + e.food.kcal * (e.grams/100), 0);
        return (
          <div key={m} style={{ marginBottom:"12px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
              <span className="label" style={{ color:"var(--text-3)", fontSize:"11px", letterSpacing:"0.06em" }}>{MEAL_ICONS[m]} {MEAL_LABELS[m].toUpperCase()}</span>
              <span style={{ color:"var(--text-2)", fontSize:"11px", fontWeight:700 }}>{Math.round(mTotal)} kcal</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
              {entries.map(e => {
                const mult = e.grams/100;
                return (
                  <div key={e.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"10px", padding:"10px 12px" }}>
                    <div>
                      <div style={{ color:"var(--text)", fontSize:"13px", fontWeight:600 }}>{e.food.name}</div>
                      <div style={{ color:"var(--text-3)", fontSize:"11px" }}>{e.grams}g · {Math.round(e.food.kcal*mult)} kcal · P:{Math.round(e.food.protein*mult)}g</div>
                    </div>
                    <button onClick={() => setLog(prev => prev.filter(x => x.id !== e.id))}
                      style={{ background:"none", border:"none", color:"var(--text-3)", cursor:"pointer", fontSize:"18px", lineHeight:1 }}>×</button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {!todayLog.length && <div style={{ textAlign:"center", padding:"20px", color:"var(--text-3)", fontSize:"14px" }}>Ainda nada hoje. Adiciona o primeiro alimento.</div>}
    </div>
  );
}

// ── Receitas ──────────────────────────────────────────────────────────────────
function Receitas() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const filtered = activeTag ? RECIPES.filter(r => r.tags.includes(activeTag)) : RECIPES;

  return (
    <div>
      <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"16px" }}>
        <button onClick={() => setActiveTag(null)} style={{ padding:"5px 12px", borderRadius:"20px", fontSize:"11px", fontWeight:600, background:!activeTag ? "var(--accent)" : "var(--surface)", border:`1px solid ${!activeTag ? "var(--accent)" : "var(--border)"}`, color:!activeTag ? "#000" : "var(--text-2)", cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:"0.04em" }}>TODOS</button>
        {ALL_TAGS.map(tag => (
          <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            style={{ padding:"5px 12px", borderRadius:"20px", fontSize:"11px", fontWeight:600, background:activeTag===tag ? "var(--accent)" : "var(--surface)", border:`1px solid ${activeTag===tag ? "var(--accent)" : "var(--border)"}`, color:activeTag===tag ? "#000" : "var(--text-2)", cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:"0.04em", textTransform:"uppercase" }}>
            {tag}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        {filtered.map(r => {
          const isOpen = openId === r.id;
          return (
            <div key={r.id} style={{ background:"var(--surface)", border:`1px solid ${isOpen ? "var(--accent)" : "var(--border)"}`, borderRadius:"14px", overflow:"hidden", transition:"border-color 0.2s" }}>
              <button onClick={() => setOpenId(isOpen ? null : r.id)} style={{ width:"100%", padding:"16px", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"12px" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:"17px", color:"var(--text)", lineHeight:1.2, marginBottom:"6px" }}>{r.name}</div>
                    <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
                      <span style={{ color: isOpen ? "var(--accent)" : "var(--text-2)", fontSize:"13px", fontWeight:700 }}>{r.kcal} kcal</span>
                      <span style={{ color:"var(--text-3)", fontSize:"12px" }}>P:{r.protein}g</span>
                      <span style={{ color:"var(--text-3)", fontSize:"12px" }}>HC:{r.carbs}g</span>
                      <span style={{ color:"var(--text-3)", fontSize:"12px" }}>G:{r.fat}g</span>
                      <span style={{ color:"var(--text-3)", fontSize:"12px" }}>⏱{r.prepMinutes}min</span>
                    </div>
                  </div>
                  <span style={{ color:"var(--text-3)", fontSize:"14px", flexShrink:0 }}>{isOpen ? "▲" : "▼"}</span>
                </div>
                <div style={{ display:"flex", gap:"4px", flexWrap:"wrap", marginTop:"8px" }}>
                  {r.tags.map(t => <span key={t} style={{ padding:"2px 8px", borderRadius:"10px", background:"var(--bg)", border:"1px solid var(--border)", fontSize:"10px", color:"var(--text-3)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.04em" }}>{t}</span>)}
                </div>
              </button>
              {isOpen && (
                <div style={{ padding:"0 16px 16px", borderTop:"1px solid var(--border)" }}>
                  <div style={{ paddingTop:"14px" }}>
                    <p className="label" style={{ color:"var(--text-3)", fontSize:"10px", marginBottom:"8px", letterSpacing:"0.06em" }}>INGREDIENTES</p>
                    <ul style={{ margin:"0 0 14px 16px", padding:0 }}>{r.ingredients.map((ing,i) => <li key={i} style={{ color:"var(--text-2)", fontSize:"13px", marginBottom:"3px" }}>{ing}</li>)}</ul>
                    <p className="label" style={{ color:"var(--text-3)", fontSize:"10px", marginBottom:"8px", letterSpacing:"0.06em" }}>PREPARAÇÃO</p>
                    <ol style={{ margin:"0 0 0 16px", padding:0 }}>{r.steps.map((step,i) => <li key={i} style={{ color:"var(--text-2)", fontSize:"13px", marginBottom:"6px", lineHeight:1.5 }}>{step}</li>)}</ol>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Plano Semanal ─────────────────────────────────────────────────────────────
function PlanoSemanal({ objetivo }: { objetivo: Objetivo }) {
  const [activeDay, setActiveDay] = useState(0);
  const plan = WEEKLY_PLANS[objetivo];
  const days = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];

  return (
    <div>
      <div style={{ background:"var(--surface)", border:"1px solid var(--accent)", borderLeft:"3px solid var(--accent)", borderRadius:"0 12px 12px 0", padding:"14px 16px", marginBottom:"16px" }}>
        <span className="label" style={{ fontSize:"10px", color:"var(--accent)", letterSpacing:"0.06em" }}>PLANO: {OBJETIVO_CONFIG[objetivo].label.toUpperCase()}</span>
        <p style={{ color:"var(--text-2)", fontSize:"13px", marginTop:"4px" }}>{OBJETIVO_CONFIG[objetivo].desc}</p>
      </div>

      {/* Day selector */}
      <div style={{ display:"flex", gap:"5px", marginBottom:"16px", overflowX:"auto", paddingBottom:"2px" }}>
        {days.map((d, i) => (
          <button key={d} onClick={() => setActiveDay(i)} style={{
            padding:"8px 10px", borderRadius:"10px", whiteSpace:"nowrap",
            background: activeDay === i ? "var(--accent)" : "var(--surface)",
            border:`1px solid ${activeDay === i ? "var(--accent)" : "var(--border)"}`,
            color: activeDay === i ? "#000" : "var(--text-2)",
            fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:"13px",
            cursor:"pointer", transition:"all 0.2s",
          }}>
            {d}
          </button>
        ))}
      </div>

      {/* Day meals */}
      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        {plan[activeDay].meals.map((m, i) => (
          <div key={i} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"16px", display:"flex", gap:"14px", alignItems:"flex-start" }}>
            <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:"var(--accent-glow)", border:"1px solid var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontSize:"14px" }}>{["☀","◑","◔","◐"][i]}</span>
            </div>
            <div>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:"12px", color:"var(--accent)", letterSpacing:"0.06em", marginBottom:"4px" }}>{m.label.toUpperCase()}</div>
              <div style={{ color:"var(--text)", fontSize:"14px", lineHeight:1.5 }}>{m.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:"16px", padding:"14px", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px" }}>
        <p style={{ color:"var(--text-3)", fontSize:"12px", lineHeight:1.5, margin:0 }}>
          Este plano é orientativo. Ajusta as quantidades às tuas necessidades calóricas definidas acima.
        </p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
type Tab = "contador" | "receitas" | "plano";

export default function NutricaoPage() {
  const [tab, setTab] = useState<Tab>("contador");
  const [objetivo, setObjetivo] = useState<Objetivo>(() => (localStorage.getItem("nutri_objetivo") as Objetivo) || "manutencao");
  const [baseKcal, setBaseKcal] = useState(() => Number(localStorage.getItem("base_kcal") || "2200"));

  function handleSetObjetivo(o: Objetivo) {
    setObjetivo(o);
    localStorage.setItem("nutri_objetivo", o);
  }

  const cfg = OBJETIVO_CONFIG[objetivo];
  const goalKcal = baseKcal + cfg.kcalMod;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", paddingBottom:"100px" }}>
      <div style={{ padding:"48px 24px 20px" }}>
        <h1 className="display" style={{ fontSize:"clamp(36px, 8vw, 52px)", color:"var(--text)", lineHeight:1, marginBottom:"6px" }}>NUTRIÇÃO</h1>
        <p style={{ color:"var(--text-2)", fontSize:"14px" }}>Combustível certo. Resultados reais.</p>
      </div>

      {/* Tabs */}
      <div style={{ padding:"0 24px", marginBottom:"20px" }}>
        <div style={{ display:"flex", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"4px", gap:"4px" }}>
          {([{key:"contador",label:"Contador"},{key:"receitas",label:"Receitas"},{key:"plano",label:"Plano"}] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex:1, padding:"10px",
              background: tab === t.key ? "var(--accent)" : "transparent",
              border:"none", borderRadius:"8px",
              color: tab === t.key ? "#000" : "var(--text-2)",
              fontFamily:"'Barlow Condensed', sans-serif",
              fontWeight:800, fontSize:"14px", letterSpacing:"0.06em",
              cursor:"pointer", transition:"all 0.2s",
            }}>
              {t.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"0 24px" }}>
        {/* TDEE Calculator + Macro setup — sempre visível no contador e plano */}
        {(tab === "contador" || tab === "plano") && (
          <>
            <TDEECalculator onSet={(kcal) => { setBaseKcal(kcal); localStorage.setItem("base_kcal", String(kcal)); }} />
            <MacroSetup objetivo={objetivo} setObjetivo={handleSetObjetivo} baseKcal={baseKcal} setBaseKcal={setBaseKcal} />
          </>
        )}

        {/* Water — apenas no contador */}
        {tab === "contador" && <WaterTracker />}

        {tab === "contador" && <CalorieCounter goalKcal={goalKcal} />}
        {tab === "receitas" && <Receitas />}
        {tab === "plano" && <PlanoSemanal objetivo={objetivo} />}
      </div>

      <BottomNav />
    </div>
  );
}
