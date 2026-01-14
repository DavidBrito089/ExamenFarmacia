export const products = [
  // MEDICAMENTOS
  {
    id: 1,
    name: "Paracetamol 500mg",
    category: "Medicamentos",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Tylenol_bottle_closeup.jpg/220px-Tylenol_bottle_closeup.jpg",
    price: 4.50,
    description: "Alivido efectivo para el dolor y la fiebre.",
    discount_percent: 20,
    is_daily_deal: true
  },
  {
    id: 2,
    name: "Ibuprofeno 400mg",
    category: "Medicamentos",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/IbuprofenBottle.JPG/220px-IbuprofenBottle.JPG",
    price: 5.20,
    description: "Antiinflamatorio no esteroideo para el dolor.",
    discount_percent: 0,
    is_daily_deal: false
  },
  {
    id: 3,
    name: "Aspirina Botella Grande",
    category: "Medicamentos",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/67/Big_Aspirin_Bottle.jpg",
    price: 8.90,
    description: "Analgésico clásico para dolores de cabeza.",
    discount_percent: 15,
    is_daily_deal: true
  },
  {
    id: 4,
    name: "Aspirina (Pastillas)",
    category: "Medicamentos",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Aspirin_%281%29.jpg",
    price: 3.50,
    description: "Formato de viaje.",
    discount_percent: 0,
    is_daily_deal: false
  },
  {
    id: 5,
    name: "Doxiciclina (Antibiótico)",
    category: "Medicamentos",
    image: "https://upload.wikimedia.org/wikipedia/commons/9/98/Bottle_of_Doxycycline_%2837280175550%29.jpg",
    price: 12.00,
    description: "Antibiótico de amplio espectro. Venta con receta.",
    discount_percent: 10,
    is_daily_deal: true
  },
  {
    id: 6,
    name: "Jarabe para la Tos",
    category: "Medicamentos",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/42/Vintage_Turkish_pediatric_cough_syrup_bottle.png",
    price: 7.80,
    description: "Alivio rápido para la tos seca y con flemas.",
    discount_percent: 0,
    is_daily_deal: false
  },
  {
    id: 7,
    name: "Pastillas para Garganta",
    category: "Medicamentos",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVdbdbLoWNn5BtmiqlMMnXebsgA-LDZy-LIQ&s",
    price: 4.00,
    description: "Suaviza la garganta irritada.",
    discount_percent: 0,
    is_daily_deal: false
  },
  {
    id: 8,
    name: "Ungüento Dérmico",
    category: "Medicamentos",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Diprosalic_ointment_tube.jpeg",
    price: 6.50,
    description: "Para irritaciones y afecciones de la piel.",
    discount_percent: 0,
    is_daily_deal: false
  },
  // SUPLEMENTOS
  {
    id: 9,
    name: "Vitamina C (Botella)",
    category: "Suplementos",
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c6/Vitamin_C_supplements_1.jpg",
    price: 9.90,
    description: "Refuerza tu sistema inmunológico.",
    discount_percent: 25,
    is_daily_deal: true
  },
  {
    id: 10,
    name: "Vitamina C (Pastillas)",
    category: "Suplementos",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Vitamin_C_Tablets.jpg",
    price: 5.50,
    description: "Comprimidos efervescentes.",
    discount_percent: 0,
    is_daily_deal: false
  },
  {
    id: 11,
    name: "Aceite de Pescado (Omega 3)",
    category: "Suplementos",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/16/Fish_Oil_Capsules.jpg",
    price: 14.50,
    description: "Salud cardiovascular y cerebral.",
    discount_percent: 30,
    is_daily_deal: true
  },
  {
    id: 12,
    name: "Multivitamínico Completo",
    category: "Suplementos",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Multivitamin_product.jpg",
    price: 18.00,
    description: "Todas las vitaminas que necesitas en uno.",
    discount_percent: 0,
    is_daily_deal: false
  },
  // EQUIPO MEDICO
  {
    id: 13,
    name: "Estetoscopio Profesional",
    category: "Equipo Médico",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/41/STETHOSCOPE.jpg",
    price: 45.00,
    description: "Alta sensibilidad acústica.",
    discount_percent: 0,
    is_daily_deal: false
  },
  {
    id: 14,
    name: "Medidor de Presión",
    category: "Equipo Médico",
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Sphygmomanometer.JPG",
    price: 32.00,
    description: "Monitor de presión arterial preciso.",
    discount_percent: 15,
    is_daily_deal: true
  },
  {
    id: 15,
    name: "Pack de Jeringas",
    category: "Equipo Médico",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Syringe_with_needle_%282%29.JPG",
    price: 8.50,
    description: "Estériles y desechables.",
    discount_percent: 0,
    is_daily_deal: false
  },
  {
    id: 16,
    name: "Silla de Ruedas",
    category: "Equipo Médico",
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Wheelchair.JPEG",
    price: 150.00,
    description: "Plegable y ligera.",
    discount_percent: 0,
    is_daily_deal: false
  },
  {
    id: 17,
    name: "Guantes de Látex",
    category: "Equipo Médico",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Latex_gloves-pair.jpg",
    price: 6.00,
    description: "Caja de 50 pares.",
    discount_percent: 0,
    is_daily_deal: false
  },
  // PRIMEROS AUXILIOS
  {
    id: 18,
    name: "Botiquín de Pared",
    category: "Primeros Auxilios",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/3e/First_aid_kit_on_wall.jpg",
    price: 25.00,
    description: "Completo para emergencias en casa.",
    discount_percent: 20,
    is_daily_deal: true
  },
  {
    id: 19,
    name: "Vendas Elásticas",
    category: "Primeros Auxilios",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/17/Bandage.jpg",
    price: 2.50,
    description: "Para torceduras y soporte.",
    discount_percent: 0,
    is_daily_deal: false
  },
  {
    id: 20,
    name: "Termómetro Clínico",
    category: "Primeros Auxilios",
    image: "https://http2.mlstatic.com/D_NQ_NP_965915-MLU70525033567_072023-O.webp",
    price: 5.90,
    description: "Lectura rápida y precisa.",
    discount_percent: 0,
    is_daily_deal: false
  },
  {
    id: 21,
    name: "Alcohol Antiséptico",
    category: "Primeros Auxilios",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Rubbing_alcohol.JPG",
    price: 3.00,
    description: "Desinfección de heridas.",
    discount_percent: 0,
    is_daily_deal: false
  },
  {
    id: 22,
    name: "Mascarillas Quirúrgicas",
    category: "Primeros Auxilios",
    image: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Surgical_face_mask.jpg",
    price: 4.50,
    description: "Pack de 10 unidades.",
    discount_percent: 0,
    is_daily_deal: false
  },
  {
    id: 23,
    name: "Bolsa de Agua Caliente",
    category: "Primeros Auxilios",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/53/Hot_water_bottle.jpg",
    price: 10.00,
    description: "Para aliviar dolores musculares.",
    discount_percent: 0,
    is_daily_deal: false
  },
  // CUIDADO PERSONAL
  {
    id: 24,
    name: "Desinfectante de Manos",
    category: "Cuidado Personal",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Hand_sanitizer.jpg",
    price: 3.50,
    description: "Elimina el 99.9% de gérmenes.",
    discount_percent: 0,
    is_daily_deal: false
  },
  {
    id: 25,
    name: "Pasta de Dientes",
    category: "Cuidado Personal",
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Tube.jpg",
    price: 2.80,
    description: "Protección anticaries.",
    discount_percent: 0,
    is_daily_deal: false
  },
  {
    id: 26,
    name: "Shampoo Revitalizante",
    category: "Cuidado Personal",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/59/Metric_shampoo_bottle.jpg",
    price: 6.20,
    description: "Para todo tipo de cabello.",
    discount_percent: 0,
    is_daily_deal: false
  },
  {
    id: 27,
    name: "Jabón en Barra",
    category: "Cuidado Personal",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/5e/A_bar_of_soap.jpg",
    price: 1.50,
    description: "Suave e hidratante.",
    discount_percent: 0,
    is_daily_deal: false
  },
  {
    id: 28,
    name: "Gotas para Ojos",
    category: "Cuidado Personal",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Eye_drop.jpg",
    price: 5.80,
    description: "Alivio para ojos secos.",
    discount_percent: 0,
    is_daily_deal: false
  },
  {
    id: 29,
    name: "Hisopos (Q-Tips)",
    category: "Cuidado Personal",
    image: "https://i5.walmartimages.com/seo/Q-tips-Cotton-Swabs-Original-375-Count_f802e608-9a92-49cd-930d-068248af16a7.387c1952c8c79339811cfdb51e6d2884.jpeg",
    price: 2.00,
    description: "Algodón 100% natural.",
    discount_percent: 0,
    is_daily_deal: false
  },
  {
    id: 30,
    name: "Gafas de Lectura",
    category: "Cuidado Personal",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/61/Reading-Glasses.jpg",
    price: 12.00,
    description: "Diseño clásico y cómodo.",
    discount_percent: 0,
    is_daily_deal: false
  },
  // BEBÉS
  {
    id: 31,
    name: "Pañales Desechables",
    category: "Bebés",
    image: "https://bebemundo.ec/cdn/shop/files/0037000765141-7.png?v=1709582027",
    price: 18.50,
    description: "Máxima absorción para tu bebé.",
    discount_percent: 10,
    is_daily_deal: true
  }
];
