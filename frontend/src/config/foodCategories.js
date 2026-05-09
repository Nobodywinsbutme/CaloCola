/**
 * FOOD_CATEGORIES.js
 * --------------------------------------------------------------
 * Single source of truth for mapping database food categories
 * (from foods.json / DB) → pyramid tier → UI config (icon, color,
 * portion info). Easy to extend — add a new tier here and the
 * entire PyramidChart + Strategy page will pick it up automatically.
 * --------------------------------------------------------------
 */

// ── Icons (emoji) per tier. Swap emojis for SVG components if needed.
// Using emoji keeps the component self-contained; to switch to SVG,
// just replace the emoji string with a <YourIcon /> JSX component.
export const TIER_ICONS = {
  ngu_coc: '🌾',  // Grains / Cereals
  khoai_cu: '🥔',  // Tubers / Roots
  hat: '🥜',  // Nuts & Seeds
  thit: '🥩',  // Meat
  thuy_san: '🐟',  // Seafood
  trung: '🥚',  // Eggs
  do_hop: '🥫',  // Canned / processed
  do_ngot: '🍩',  // Sweets / desserts
  gia_vi: '🧂',  // Spices & seasonings
  nuoc: '🧃',  // Beverages
  // Catch-all fallback
  default: '🍽️',
}

// ── Pyramid tier order (bottom = eat most, top = eat sparingly).
// Each entry: { id, label, color, categories[], portionPer100g }
// `id`        – must match keys in TIER_ICONS
// `categories – array of DB category strings to group into this tier
// `portionPer100g` – display label shown in tier tooltip
export const PYRAMID_TIERS = [
  // ── Bottom layer: eat most ─────────────────────────────────
  {
    id: 'ngu_coc',
    label: 'Ngũ Cốc',
    subtitle: '6–11 phần / ngày',
    width: 75,
    color: '#ffd766',
    categories: ['Ngũ cốc'],
    description: 'Nền tảng năng lượng. Cung cấp carbohydrate phức tạp, chất xơ và vitamin B. Ưu tiên ngũ cốc nguyên hạt như gạo lứt, yến mạch, bánh mì nguyên cám.',
    tip: 'Chọn ngũ cốc nguyên hạt thay vì tinh chế để giữ chất xơ và dưỡng chất.',
    servingHint: '1 phần = ~80g cơm chín (Cỡ nắm tay)',
    portionPer100g: {
      calories: '~320–370',
      protein: '7–10g',
      carbs: '65–80g',
      fat: '1–3g',
    },
    // Average of range — used for stacked bar chart in popup
    avgNutrition: { calories: 345, protein: 8.5, carbs: 72.5, fat: 2 },
  },
  {
    id: 'khoai_cu',
    label: 'Khoai & Củ',
    subtitle: '2–4 phần / ngày',
    width: 66,
    color: '#d4a843',
    categories: ['Khoai củ'],
    description: 'Nguồn tinh bột tự nhiên, giàu kali, vitamin C và chất xơ. Khoai lang, khoai tây, sắn là lựa chọn lành mạnh thay thế cơm trắng.',
    tip: 'Hấp hoặc luộc thay vì chiên để giảm lượng calo và chất béo.',
    servingHint: '1 phần = 100g (Cỡ 1 củ khoai vừa)',
    portionPer100g: {
      calories: '~70–130',
      protein: '1–3g',
      carbs: '15–30g',
      fat: '<1g',
    },
    avgNutrition: { calories: 100, protein: 2, carbs: 22.5, fat: 0.5 },
  },
  {
    id: 'thit',
    label: 'Thịt',
    subtitle: '2–3 phần / ngày',
    width: 60,
    color: '#ff79b0',
    categories: ['Thịt'],
    description: 'Nguồn protein động vật hoàn chỉnh với đầy đủ amino acid thiết yếu. Ưu tiên thịt nạc như ức gà, thịt heo nạc. Hạn chế thịt đỏ chế biến sẵn.',
    tip: 'Nên ăn thịt gia cầm và hải sản nhiều hơn thịt đỏ để bảo vệ tim mạch.',
    servingHint: '1 phần = 100g (Cỡ lòng bàn tay)',
    portionPer100g: {
      calories: '~150–250',
      protein: '18–27g',
      carbs: '0–5g',
      fat: '8–20g',
    },
    avgNutrition: { calories: 200, protein: 22.5, carbs: 2.5, fat: 14 },
  },
  {
    id: 'thuy_san',
    label: 'Thuỷ Sản',
    subtitle: '2–3 phần / ngày',
    width: 52,
    color: '#5bbcff',
    categories: ['Thuỷ sản'],
    description: 'Giàu protein chất lượng cao, omega-3 và khoáng chất. Cá béo như cá hồi, cá thu rất tốt cho tim mạch và não bộ. Tôm, cua cung cấp kẽm và selen.',
    tip: 'Ăn cá ít nhất 2 lần/tuần để đảm bảo đủ omega-3 cho não và tim mạch.',
    servingHint: '1 phần = 100g (Cỡ lòng bàn tay)',
    portionPer100g: {
      calories: '~80–150',
      protein: '15–25g',
      carbs: '0–5g',
      fat: '2–8g',
    },
    avgNutrition: { calories: 115, protein: 20, carbs: 2.5, fat: 5 },
  },
  {
    id: 'hat',
    label: 'Hạt & Đậu',
    subtitle: '1–2 phần / ngày',
    width: 45,
    color: '#b094ff',
    categories: ['Hạt'],
    description: 'Nguồn protein thực vật, chất béo lành mạnh và chất xơ tuyệt vời. Đậu phộng, hạt điều, hạnh nhân, đậu đen, đậu lăng đều rất bổ dưỡng.',
    tip: 'Một nắm nhỏ hạt (30g) mỗi ngày giúp kiểm soát cholesterol và đường huyết.',
    servingHint: '1 phần = 30g (1 nắm nhỏ)',
    portionPer100g: {
      calories: '~500–600',
      protein: '15–25g',
      carbs: '20–35g',
      fat: '35–50g',
    },
    avgNutrition: { calories: 550, protein: 20, carbs: 27.5, fat: 42.5 },
  },
  {
    id: 'trung',
    label: 'Trứng',
    subtitle: '1–2 phần / ngày',
    width: 33,
    color: '#f0c040',
    categories: ['Trứng'],
    description: 'Một trong những thực phẩm giàu dưỡng chất nhất. Trứng chứa protein hoàn chỉnh, choline, lutein và zeaxanthin tốt cho mắt và não bộ.',
    tip: 'Trứng luộc hoặc hấp lành mạnh hơn trứng chiên. Cả lòng đỏ đều có giá trị dinh dưỡng cao.',
    servingHint: '1 phần = 1 quả trứng (~50g)',
    portionPer100g: {
      calories: '~140–160',
      protein: '12–14g',
      carbs: '1–2g',
      fat: '10–12g',
    },
    avgNutrition: { calories: 150, protein: 13, carbs: 1.5, fat: 11 },
  },
  {
    id: 'nuoc',
    label: 'Nước Giải Khát',
    subtitle: 'Uống vừa phải',
    width: 26,
    color: '#7dd6f5',
    categories: ['Nước giải khát'],
    description: 'Nên ưu tiên nước lọc, trà xanh không đường và nước trái cây tươi ép. Hạn chế nước ngọt có ga, đồ uống có cồn và nước tăng lực chứa nhiều đường.',
    tip: 'Uống đủ 2–2.5 lít nước mỗi ngày. Tránh thay thế nước lọc bằng nước ngọt.',
    servingHint: '1 phần = 200ml (1 ly vừa)',
    portionPer100g: {
      calories: '~20–100',
      protein: '0g',
      carbs: '5–25g',
      fat: '0g',
    },
    avgNutrition: { calories: 60, protein: 0, carbs: 15, fat: 0 },
  },
  {
    id: 'do_ngot',
    label: 'Đồ Ngọt',
    subtitle: 'Ăn ít — hạn chế',
    width: 20,
    color: '#ff5a5a',
    categories: ['Đồ ngọt'],
    description: 'Bánh kẹo, kem, chè, đồ ngọt chứa nhiều đường và calo rỗng. Tiêu thụ nhiều làm tăng nguy cơ tiểu đường, béo phì và sâu răng.',
    tip: 'Nếu thèm ngọt, hãy chọn trái cây tươi hoặc dark chocolate >70% cacao thay thế.',
    servingHint: '1 phần = 30g (2 miếng nhỏ / 1 thìa)',
    portionPer100g: {
      calories: '~300–500',
      protein: '2–6g',
      carbs: '50–80g',
      fat: '5–25g',
    },
    avgNutrition: { calories: 400, protein: 4, carbs: 65, fat: 15 },
  },
  {
    id: 'gia_vi',
    label: 'Gia Vị',
    subtitle: 'Dùng vừa phải',
    width: 16,
    color: '#c8a87a',
    categories: ['Gia vị'],
    description: 'Gia vị tạo hương vị cho món ăn. Nhiều loại gia vị như nghệ, gừng, tỏi có tác dụng chống viêm. Tuy nhiên nên hạn chế muối và nước mắm để tránh huyết áp cao.',
    tip: 'Giảm muối trong nấu ăn bằng cách dùng thảo mộc tươi như rau mùi, húng quế thay thế.',
    servingHint: '1 phần = 5–10g (1–2 thìa cà phê)',
    portionPer100g: {
      calories: '~10–50',
      protein: '<1g',
      carbs: '1–10g',
      fat: '<1g',
    },
    avgNutrition: { calories: 30, protein: 0.5, carbs: 5.5, fat: 0.5 },
  },
  {
    id: 'do_hop',
    label: 'Đồ Hộp',
    subtitle: 'Hạn chế tối đa',
    width: 10,
    color: '#b0b0b0',
    categories: ['Đồ hộp'],
    description: 'Thực phẩm chế biến sẵn thường chứa nhiều muối, đường, chất bảo quản và chất phụ gia. Nên hạn chế tối đa và ưu tiên thực phẩm tươi sống thay thế.',
    tip: 'Khi phải dùng đồ hộp, chọn loại không thêm muối/đường và rửa sạch trước khi dùng.',
    servingHint: '1 phần = 100g (½ hộp nhỏ)',
    portionPer100g: {
      calories: '~80–250',
      protein: '3–15g',
      carbs: '5–25g',
      fat: '3–15g',
    },
    avgNutrition: { calories: 165, protein: 9, carbs: 15, fat: 9 },
  },
]

/**
 * Map a DB category string → pyramid tier id.
 * Returns null if the category should not appear in the pyramid.
 */
export function categoryToTierId(dbCategory) {
  for (const tier of PYRAMID_TIERS) {
    if (tier.categories.some(c => dbCategory?.toLowerCase().includes(c.toLowerCase()))) {
      return tier.id
    }
  }
  return null
}

/**
 * Get tier config by id.
 */
export function getTierById(id) {
  return PYRAMID_TIERS.find(t => t.id === id) || null
}

/**
 * Get icon for a tier id or DB category string.
 * Works with both tier IDs ("thit") and DB category strings ("Thịt").
 */
export function getIconForTier(tierIdOrCategory) {
  if (!tierIdOrCategory) return TIER_ICONS.default
  if (TIER_ICONS[tierIdOrCategory]) return TIER_ICONS[tierIdOrCategory]
  const tierId = categoryToTierId(tierIdOrCategory)
  return tierId && TIER_ICONS[tierId] ? TIER_ICONS[tierId] : TIER_ICONS.default
}