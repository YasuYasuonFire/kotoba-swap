export type SeedPhrase = {
  id: string;
  category:
    | "自堕落"
    | "食生活"
    | "ダラダラ"
    | "学習"
    | "健康"
    | "人間関係"
    | "仕事"
    | "金銭"
    | "その他";
  from: string;
  to: string;
  imageUrl?: string;
  tags?: string[];
};

// 年末年始の自虐ネタメイン！Xでウケそうなオバハン的・共感を呼ぶネタを厚めに。
export const SEED_PHRASES: SeedPhrase[] = [
  {
    id: "s001",
    category: "自堕落",
    from: "食べて飲んでばっかりだわ…",
    to: "栄養をしっかりチャージ中！来年も健康第一でいきましょう🎄",
    imageUrl: "/kotoba-swap-1767013595901.png",
  },
  {
    id: "s004",
    category: "ダラダラ",
    from: "正月からダラダラしすぎてる",
    to: "充電期間として最適！来年の英気を養っていますわね💪",
    imageUrl: "/kotoba-swap-1767015651758.png",
  },
  {
    id: "s016",
    category: "仕事",
    from: "仕事のメール来てるの無視したい",
    to: "心の準備が大事！来年の仕事も頑張りましょう💼",
    imageUrl: "/kotoba-swap-1767015783886.png",
  },
];

export const INPUT_EXAMPLES = [
  "体重増えたかも…",
  "何もしたくない…",
  "お年玉あげるの辛い",
  "寒くて布団から出られない",
  "飲みすぎて頭痛い",
];
