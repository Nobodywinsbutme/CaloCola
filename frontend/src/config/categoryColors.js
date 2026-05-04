const CATEGORY_COLOR_MAP = {
  'Ngũ cốc':   '#EF9F27',
  'Khoai củ':  '#D85A30',
  'Hạt & Đậu': '#854F0B',
  'Thịt':      '#E24B4A',
  'Thủy sản':  '#378ADD',
  'Trứng':     '#FAC775',
  'Sữa':       '#B5D4F4',
  'Đồ hộp':    '#888780',
  'Đồ ngọt':   '#D4537E',
  'Gia vị':    '#1D9E75',
  'Đồ uống':   '#7F77DD',
}

const FALLBACK_PALETTE = [
  '#534AB7', '#0F6E56', '#993C1D', '#185FA5',
  '#854F0B', '#993556', '#3B6D11', '#A32D2D',
]

export function buildColorMap(categories) {
  const colorMap = {}
  let fallbackIndex = 0

  for (const cat of categories) {
    if (CATEGORY_COLOR_MAP[cat]) {
      colorMap[cat] = CATEGORY_COLOR_MAP[cat]
    } else {
      colorMap[cat] = FALLBACK_PALETTE[fallbackIndex % FALLBACK_PALETTE.length]
      fallbackIndex++
    }
  }

  return colorMap
}