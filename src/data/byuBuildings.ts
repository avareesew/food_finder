/**
 * BYU Provo buildings: display names, text aliases, short codes (for tokens like WSC3220 / TNRB 710),
 * and approximate map coordinates for pin placement (reference only).
 */
export type ByuBuilding = {
  id: string;
  name: string;
  /**
   * Campus abbreviation for lists and map pins (e.g. TNRB for Tanner).
   * If omitted, the first `codes` entry is uppercased (e.g. wsc → WSC).
   */
  abbr?: string;
  /** Multi-word or phrase matches (substring, case-insensitive). Longer phrases first per building in matcher. */
  aliases: string[];
  /** Codes matched against alphanumeric tokens; prefix allowed if code length >= 3 (except `cb` = exact only). */
  codes: string[];
  lat: number;
  lng: number;
};

/** Abbreviation shown next to building names and on map pins. */
export function buildingAbbreviation(b: ByuBuilding): string {
  return (b.abbr ?? b.codes[0] ?? b.id).toUpperCase();
}

export const BYU_BUILDINGS: ByuBuilding[] = [
  {
    id: 'wsc',
    name: 'Wilkinson Student Center',
    codes: ['wsc'],
    lat: 40.251,
    lng: -111.6506,
    aliases: ['wilkinson student center', 'wilkinson student', 'wilkinson center', 'student center wsc'],
  },
  {
    id: 'hbll',
    name: 'Harold B. Lee Library',
    codes: ['hbll'],
    lat: 40.2487,
    lng: -111.6491,
    aliases: ['harold b lee library', 'h b lee', 'lee library', 'byu library', 'main library'],
  },
  {
    id: 'jfsb',
    name: 'Joseph F. Smith Building',
    codes: ['jfsb'],
    lat: 40.2468,
    lng: -111.6511,
    aliases: ['joseph f smith', 'j f smith', 'smith building jfsb', 'jfsb lobby'],
  },
  {
    id: 'jkb',
    name: 'Jesse Knight Building',
    codes: ['jkb'],
    lat: 40.2494,
    lng: -111.6504,
    aliases: ['jesse knight', 'knight building', 'kmb'],
  },
  {
    id: 'jrcb',
    name: 'JRCB',
    codes: ['jrcb'],
    lat: 40.2476,
    lng: -111.6532,
    aliases: [],
  },
  {
    id: 'tnrb',
    name: 'Tanner Building',
    codes: ['tnrb'],
    lat: 40.2532,
    lng: -111.6509,
    aliases: ['tanner building', 'marriott school of business', 'marriott school', 'business school'],
  },
  {
    id: 'tmcb',
    name: 'Tanner Management Center',
    codes: ['tmcb'],
    lat: 40.2498,
    lng: -111.6469,
    aliases: ['tanner management', 'tanner management center', 'management center'],
  },
  {
    id: 'ctab',
    name: 'Crabtree Technology Building',
    codes: ['ctab'],
    lat: 40.2473,
    lng: -111.6469,
    aliases: ['crabtree technology', 'crabtree'],
  },
  {
    id: 'cb',
    name: 'Classroom Building',
    codes: ['cb'],
    lat: 40.2482,
    lng: -111.6487,
    aliases: ['classroom building', 'the cb'],
  },
  {
    id: 'esc',
    name: 'Engineering Building',
    codes: ['esc'],
    lat: 40.2469,
    lng: -111.6466,
    aliases: ['engineering building', 'engineering lab', 'engineering'],
  },
  {
    id: 'snlb',
    name: 'Snell Building',
    codes: ['snlb'],
    lat: 40.2458,
    lng: -111.649,
    aliases: ['snell building', 'snell'],
  },
  {
    id: 'marb',
    name: 'Museum of Art',
    abbr: 'MOA',
    codes: ['marb'],
    lat: 40.2506,
    lng: -111.6478,
    aliases: ['museum of art', 'byu moa', 'moa '],
  },
  {
    id: 'hfac',
    name: 'Harris Fine Arts Center',
    codes: ['hfac'],
    lat: 40.2505,
    lng: -111.6515,
    aliases: ['harris fine arts', 'fine arts center', 'fine arts'],
  },
  {
    id: 'mckb',
    name: 'McKay Building',
    codes: ['mckb'],
    lat: 40.2483,
    lng: -111.6461,
    aliases: ['mckay building', 'mckay'],
  },
  {
    id: 'swkt',
    name: 'Spencer W. Kimball Tower',
    codes: ['swkt'],
    lat: 40.2503,
    lng: -111.6456,
    aliases: ['kimball tower', 'spencer w kimball', 's w kimball tower'],
  },
  {
    id: 'asb',
    name: 'Abraham Smoot Building',
    codes: ['asb'],
    lat: 40.2517,
    lng: -111.6509,
    aliases: ['abraham smoot', 'smoot building', 'smoot admin'],
  },
  {
    id: 'brmb',
    name: 'Brigham Young Building',
    codes: ['brmb'],
    lat: 40.2521,
    lng: -111.652,
    aliases: ['brigham young building'],
  },
  {
    id: 'conf',
    name: 'Conference Center',
    codes: ['conf'],
    lat: 40.253,
    lng: -111.6481,
    aliases: ['byu conference center', 'conference center'],
  },
  {
    id: 'music',
    name: 'Music Building',
    abbr: 'MUSIC',
    codes: ['music'],
    lat: 40.2499,
    lng: -111.6524,
    aliases: [
      'music building',
      'byu music building',
      'music dept',
      'school of music',
      'music building concert',
    ],
  },
  {
    id: 'life',
    name: 'Life Sciences Building',
    codes: ['life'],
    lat: 40.2462,
    lng: -111.6452,
    aliases: ['life sciences building', 'life sciences', 'life science'],
  },
];

export function buildingById(id: string): ByuBuilding | undefined {
  return BYU_BUILDINGS.find((b) => b.id === id);
}
