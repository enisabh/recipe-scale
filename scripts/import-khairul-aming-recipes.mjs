import { writeFile } from 'node:fs/promises';

const recipeIds = [
  14260, 8628, 14243, 14229, 14216, 9850, 9902, 9905, 8255, 7152, 8272, 14814,
  9945, 11993, 12012, 14288, 14474, 14496, 14512, 14541,
];

const categoryPriority = [
  'Ayam',
  'Daging',
  'Ikan',
  'Seafood',
  'Nasi, Pulut & Bubur',
  'Pasta & Pizza',
  'Sambal, Sos & Pencicah',
  'Snack',
  'Pencuci Mulut',
  'Kek, Roti & Pastri',
  'Sup',
];

// Ringkasan editorial berdasarkan cara memasak pada sumber asal. Disimpan secara
// manual supaya import semula data tidak menyalin teks penerbit secara bulat-bulat.
const methodSummaries = {
  14260: [
    'Rebus ayam bersama serai, halia, bawang putih, air kelapa, santan dan garam. Balikkan ayam sekali-sekala supaya santan kekal elok.',
    'Kisar tomato, cili padi, bawang merah, bawang putih dan belacan dengan sedikit minyak.',
    'Tumis bahan kisar hingga kering, kemudian masukkan daun limau purut. Tambah sedikit air dan santan, perasakan lalu masak hingga pecah minyak.',
    'Keluarkan ayam yang telah masak serta asingkan serai dan halia daripada air rebusan.',
    'Masukkan santan, gula dan sedikit bancuhan tepung jagung ke dalam air rebusan. Masak hingga kuah sebati dan sedikit pekat.',
    'Hidangkan ayam bersama kuah santan, sambal dan nasi putih. Tambah pucuk ubi rebus jika suka.',
  ],
  8628: [
    'Masukkan lada besar, cili padi, tomato dan bawang putih ke dalam air fryer pada 200°C selama kira-kira 10 minit.',
    'Gaul ayam dengan kunyit, ketumbar, lada hitam, garam dan sedikit minyak.',
    'Kisar bahan sambal yang telah dibakar bersama belacan, sedikit garam dan air hingga mencapai tekstur yang disukai.',
    'Masak ayam dalam air fryer pada 200°C selama kira-kira 25 minit atau hingga garing dan masak sepenuhnya.',
    'Hidangkan ayam bersama sambal, nasi, ulam dan sedikit kicap manis.',
  ],
  14243: [
    'Gaul ayam dengan lada hitam dan sos tiram sehingga rata.',
    'Masak ayam dalam air fryer pada 200°C selama kira-kira 20 minit hingga keperangan.',
    'Cincang lada besar, cili padi, bawang merah dan bawang putih, kemudian tumis hingga layu serta harum.',
    'Tambah sedikit air, sos plum, sos tiram, kicap manis dan sos ikan. Kacau hingga sebati.',
    'Masukkan serai, cili padi dan daun limau purut, kemudian campurkan ayam yang telah dibakar.',
    'Masak seketika hingga sos menyaluti ayam sebelum dihidangkan.',
  ],
  14229: [
    'Kisar atau cincang bawang merah, bawang putih, ikan bilis dan cili kering yang telah direndam.',
    'Goreng telur dalam minyak panas, kemudian angkat dan ketepikan.',
    'Tumis bahan kisar dalam kuali yang sama hingga harum dan betul-betul masak.',
    'Masukkan nasi sejuk, perencah nasi goreng dan kicap manis. Gaul hingga warna serta rasa sekata.',
    'Campurkan semula telur dan sayur, lalu goreng sehingga semuanya panas dan sebati.',
  ],
  14216: [
    'Cincang bawang merah, cili padi, lada besar dan bawang putih.',
    'Tumis bahan cincang hingga layu dan harum, kemudian masukkan serai serta serbuk kunyit.',
    'Campurkan kuah sardin dengan sedikit air dan santan.',
    'Tuang campuran kuah ke dalam tumisan, perasakan dengan garam dan masak hingga pecah minyak.',
    'Masukkan isi sardin dan masak seketika supaya kuah meresap.',
    'Angkat dan perahkan limau nipis sebelum makan jika suka.',
  ],
  9850: [
    'Kisar bawang merah, bawang putih, halia, kunyit hidup, cili padi dan belacan bakar.',
    'Tumis bahan kisar bersama serai, kemudian tambah cili kisar dan teruskan sehingga pecah minyak.',
    'Masukkan ayam, garam dan serbuk perasa. Gaul hingga permukaan ayam bersalut tumisan.',
    'Tambah air mengikut jumlah kuah yang diingini dan biarkan ayam masak.',
    'Masukkan pes asam jawa, daun kesum dan bunga kantan lalu renehkan hingga kuah pekat.',
    'Akhiri dengan tomato dan bendi; masak sebentar sebelum dihidangkan.',
  ],
  9902: [
    'Tumis bawang merah dan bawang putih dengan sedikit minyak hingga harum.',
    'Masukkan akar ketumbar serta cili kering dan tumis seketika.',
    'Tambah ayam dan garam, kemudian tuang air serta perencah sup Siam.',
    'Reneh selama 20–30 minit atau sehingga ayam empuk dan kuah cukup berasa.',
    'Masukkan tomato dan cili padi, lalu masak sebentar.',
    'Tutup api sebelum menambah sos ikan dan jus limau nipis. Tabur daun ketumbar untuk dihidang.',
  ],
  9905: [
    'Tumis bawang merah dan bawang putih hingga harum, kemudian masukkan rempah sup ikan.',
    'Tambah akar ketumbar dan cili kering, tumis seketika lalu tuang air untuk kuah.',
    'Masukkan perencah sup Siam dan kacau hingga larut.',
    'Masukkan ikan dan garam, kemudian reneh perlahan supaya isi ikan tidak hancur.',
    'Tambah cili padi serta tomato dan biarkan mendidih seketika.',
    'Tutup api, masukkan sos ikan dan jus limau nipis, kemudian tabur daun ketumbar.',
  ],
  8255: [
    'Sangai beras hingga perang, kemudian tumbuk halus untuk dijadikan pemekat kuah.',
    'Rebus daging dengan kira-kira 2 liter air menggunakan api perlahan selama 2 jam atau hingga empuk.',
    'Masukkan lengkuas, serai, akar ketumbar, daun limau purut dan bawang merah. Reneh lagi kira-kira 10 minit.',
    'Tambah air asam jawa, cili padi, cili kering dan tomato; tambah air jika kuah terlalu sedikit.',
    'Perasakan dengan garam, gula dan serbuk perasa, kemudian masukkan sos ikan, chili flakes serta beras tumbuk.',
    'Masak beberapa minit lagi. Tutup api, perah limau nipis dan tabur daun ketumbar sebelum dihidang.',
  ],
  7152: [
    'Lumurkan ikan dengan garam, tepung jagung atau tepung beras, dan kunyit. Biarkan seketika.',
    'Untuk sos, tumis bawang merah, bawang putih, serai dan halia yang telah dicincang atau dihiris.',
    'Masukkan sos cili Thai, sos tiram, sos ikan dan gula. Didihkan, kemudian pekatkan dengan sedikit bancuhan tepung jagung.',
    'Tutup api lalu campurkan cili padi tumbuk, daun limau purut, jus limau nipis dan daun ketumbar.',
    'Goreng ikan dalam minyak panas hingga rangup dan keperangan.',
    'Letakkan ikan di atas pinggan dan tuang sos Thai di atasnya ketika hendak dihidangkan.',
  ],
  8272: [
    'Cairkan mentega dan tumis bawang Holland, bawang putih serta cendawan hingga kekuningan.',
    'Masukkan tepung gandum, kacau rata dan tuang air sedikit demi sedikit.',
    'Tambah sos tiram, kicap manis, kiub pati lembu dan lada hitam, lalu masak hingga sebati.',
    'Kisar sos tersebut dan masak semula sehingga licin serta mencapai kepekatan yang sesuai.',
    'Panggang daging oblong, kemudian salut atau celupkan ke dalam sos lada hitam.',
    'Sapu mentega pada roti dan bakar di kuali. Susun daging bersos serta hirisan bawang di dalam roti.',
  ],
  14814: [
    'Masak daging kisar tanpa minyak hingga lemak keluar dan daging sedikit garing, kemudian ketepikan.',
    'Cincang seleri, bawang Holland, lobak merah dan bawang putih. Tumis dalam kuali yang sama hingga lembut.',
    'Masukkan tomato puri dan tomato segar yang telah dikisar dengan sedikit air.',
    'Campurkan semula daging, oregano, chili flakes, lada hitam, daun salam dan kiub pati lembu. Perasakan dengan garam.',
    'Tutup dan reneh sos kira-kira 15 minit; tambah air jika perlu hingga kuah berkilat dan tidak terlalu pekat.',
    'Rebus spaghetti mengikut arahan bungkusan, kemudian hidangkan bersama sos dan keju Parmesan.',
  ],
  9945: [
    'Tumis bawang Holland dan bawang putih hingga harum, kemudian masukkan daging cincang.',
    'Tambah serbuk kari, sos tomato, sos tiram dan sos cili. Tuang sedikit air dan masak hingga inti sempurna.',
    'Perasakan inti dengan lada hitam, garam dan serbuk perasa.',
    'Belah roti burger, sapu mentega serta mayonis, kemudian isi dengan daging, sos cili dan keju jika suka.',
    'Balut setiap roti berinti dengan kulit popia dan lekatkan bahagian hujung menggunakan sedikit air.',
    'Goreng dalam minyak panas hingga balutan garing dan keemasan, kemudian toskan sebelum dihidang.',
  ],
  11993: [
    'Rebus daging bersama sedikit bahagian berlemak selama kira-kira 30 minit atau hingga empuk dan air hampir kering.',
    'Masukkan kunyit serta sedikit minyak, kemudian goreng daging hingga permukaannya agak garing.',
    'Kisar bawang putih dan halia lalu masukkan ke dalam periuk.',
    'Tambah kicap, sos cili, sos tomato dan sos tiram. Gaul hingga daging bersalut rata.',
    'Perasakan dengan garam serta serbuk perasa; tambah sedikit air jika tumisan terlalu kering.',
    'Masukkan bawang Holland, cili padi dan kacang panjang. Masak hingga sayur lembut tetapi masih bertekstur.',
  ],
  12012: [
    'Panaskan air bersama daun pandan dan gula Melaka hingga gula larut.',
    'Masukkan santan dan kacau menggunakan api sederhana.',
    'Tambah isi durian, kemudian kacau selalu hingga buah mula hancur dan kuah menjadi pekat.',
    'Perasakan dengan secubit garam untuk mengimbangkan rasa manis.',
    'Laraskan kepekatan dengan sedikit air atau tambah gula Melaka mengikut cita rasa.',
    'Hidangkan serawa ketika panas bersama roti atau pulut.',
  ],
  14288: [
    'Cairkan gula terus di dalam kuali tanpa air. Goyangkan kuali perlahan hingga menjadi karamel, kemudian tuang ke dalam loyang.',
    'Buang kulit tepi roti dan potong kecil agar mudah dikisar.',
    'Kisar kremer sejat, roti, telur, kremer manis, krim keju, vanila dan garam hingga halus.',
    'Tapis adunan dan tuang perlahan-lahan ke atas lapisan karamel.',
    'Tutup loyang dengan aluminium foil dan kukus menggunakan api sederhana selama kira-kira 45 minit.',
    'Sejukkan pada suhu bilik sebelum disimpan beberapa jam di dalam peti sejuk dan dikeluarkan daripada loyang.',
  ],
  14474: [
    'Hiris tempe nipis, kemudian goreng tanpa garam atau kunyit hingga perang dan rangup. Toskan.',
    'Potong cili padi, lada merah, tomato, bawang merah dan bawang putih supaya mudah digoreng.',
    'Goreng semua bahan sambal dalam minyak yang sama hingga lembut, kemudian angkat dan toskan.',
    'Tumbuk bahan sambal mengikut tekstur yang disukai dan perasakan dengan garam, gula serta serbuk perasa.',
    'Masukkan tempe goreng dan tumbuk perlahan agar sebahagiannya kekal rangup.',
    'Gaul bersama jus limau kasturi dan sedikit kicap jika suka, kemudian hidangkan dengan nasi panas.',
  ],
  14496: [
    'Kupas dan potong pisang masak, kemudian hiris gula Melaka supaya cepat larut.',
    'Masak sagu hingga kembang dan jernih, lalu toskan.',
    'Larutkan gula Melaka bersama air di dalam periuk.',
    'Masukkan pisang dan masak hingga lembut, kemudian tambah secubit garam.',
    'Campurkan sagu dan kacau seketika hingga semuanya sebati. Tutup api dan sejukkan.',
    'Hidangkan campuran pisang sagu di atas ais dan tuang susu cair secukupnya.',
  ],
  14512: [
    'Bancuh sebahagian tepung berperisa dengan air hingga agak pekat.',
    'Celup isi ayam ke dalam bancuhan basah, kemudian salut sekali lagi dengan tepung kering.',
    'Goreng ayam hingga keemasan dan masak sepenuhnya, lalu toskan.',
    'Campur paprika, cayenne, chili flakes, serbuk bawang putih dan gula perang. Tuang sedikit minyak gorengan panas dan kacau.',
    'Masukkan sos barbeku serta madu ke dalam campuran rempah, kemudian gaulkan dengan ayam goreng hingga bersalut.',
    'Sediakan pencicah daripada yogurt, mayonis, lemon, lada hitam, bawang putih dan garam. Hidangkan bersama ayam.',
  ],
  14541: [
    'Letakkan satu skop aiskrim di antara dua keping roti.',
    'Tekan roti supaya padat, kemudian gunakan bibir cawan untuk memotong bentuk bulat dan menutup tepinya rapat.',
    'Ulang untuk baki roti dan perisa aiskrim yang diingini.',
    'Susun di atas dulang dan bekukan selama 2–3 jam sehingga benar-benar keras.',
    'Panaskan minyak sehingga betul-betul panas, kemudian goreng setiap bungkusan selama kira-kira 10 saat sahaja.',
    'Angkat, toskan dan hidangkan segera supaya bahagian luar kekal panas serta aiskrim tidak cair.',
  ],
};
const quantityPattern = String.raw`(?:\d+(?:[.,]\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞])`;
const unitPattern = String.raw`(?:kg|g|gram|ml|l|liter|cawan|sudu(?:\s+(?:besar|kecil))?|biji|ulas|batang|keping|helai|ekor|bungkus|kotak|tin|tangkai|ketul|paket|kiub|akar|penutup|blok|inci|cm|mm)`;

function decodeHtml(value = '') {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeIngredient(value) {
  const parentheticalRange = value.match(
    new RegExp(
      String.raw`^(.+?)\s*\((${quantityPattern})\s*(${unitPattern})\s*[–-]\s*(${quantityPattern})\s*(${unitPattern})\)$`,
      'iu',
    ),
  );
  if (
    parentheticalRange &&
    parentheticalRange[3].toLowerCase() === parentheticalRange[5].toLowerCase()
  ) {
    return `${parentheticalRange[2]}–${parentheticalRange[4]} ${parentheticalRange[3]} ${parentheticalRange[1]}`;
  }

  const parentheticalQuantity = value.match(
    new RegExp(
      String.raw`^(.+?)\s*\((${quantityPattern})\s*(${unitPattern})(?:\s*[,/]\s*(.*?))?\)$`,
      'iu',
    ),
  );
  if (parentheticalQuantity) {
    const note = parentheticalQuantity[4]
      ? ` (${parentheticalQuantity[4]})`
      : '';
    return `${parentheticalQuantity[2]} ${parentheticalQuantity[3]} ${parentheticalQuantity[1]}${note}`;
  }

  const trailingRange = value.match(
    new RegExp(
      String.raw`^(.+?)\s+(${quantityPattern})\s*[–-]\s*(${quantityPattern})\s*(${unitPattern})$`,
      'iu',
    ),
  );
  if (trailingRange)
    return `${trailingRange[2]}–${trailingRange[3]} ${trailingRange[4]} ${trailingRange[1]}`;

  const trailingQuantity = value.match(
    new RegExp(
      String.raw`^(.+?)\s+(${quantityPattern})\s*(${unitPattern})(\s*\(.*\))?$`,
      'iu',
    ),
  );
  if (trailingQuantity) {
    return `${trailingQuantity[2]} ${trailingQuantity[3]} ${trailingQuantity[1]}${trailingQuantity[4] ?? ''}`;
  }

  return value;
}

function extractIngredients(meta) {
  const groups = Object.entries(meta)
    .filter(
      ([key, value]) =>
        /^bahan-(utama|tambahan)/.test(key) &&
        value &&
        typeof value === 'object',
    )
    .map(([, value]) => value);

  const ingredients = groups.flatMap((group) =>
    Object.values(group)
      .map((item) => normalizeIngredient(decodeHtml(item?.bahan ?? '')))
      .filter(Boolean),
  );

  return [...new Set(ingredients)];
}

function pickCategory(meta) {
  const flags = meta['category-resipi'] ?? {};
  return (
    categoryPriority.find((category) => flags[category] === 'true') ??
    meta['jenis-masakan'] ??
    'Lain-lain'
  );
}

const posts = await Promise.all(
  recipeIds.map(async (id) => {
    const response = await fetch(
      `https://www.resipikita.com/wp-json/wp/v2/resipi/${id}`,
    );
    if (!response.ok)
      throw new Error(`Resipi ${id} gagal dimuatkan: ${response.status}`);
    return response.json();
  }),
);

const recipes = posts.map((post) => {
  const meta = post.meta ?? {};
  return {
    id: post.id,
    slug: post.slug,
    name: decodeHtml(meta['nama-resipi'] || post.title?.rendered).replace(
      /^Resepi\s+/i,
      '',
    ),
    servings: Number(meta['jumlah-hidangan']) || 4,
    minutes: Number(meta['jumlah-masa']) || null,
    level: decodeHtml(meta.level) || 'Mudah',
    category: pickCategory(meta),
    ingredients: extractIngredients(meta),
    steps: methodSummaries[post.id] ?? [],
    sourceUrl: post.link,
  };
});

await writeFile(
  new URL('../lib/khairul-aming-recipes.json', import.meta.url),
  `${JSON.stringify(recipes, null, 2)}\n`,
  'utf8',
);

console.log(
  `Imported ${recipes.length} recipes with ${recipes.reduce((sum, recipe) => sum + recipe.ingredients.length, 0)} ingredients.`,
);
