export const GROUP_COLOR_MAP: Map<string, string> = new Map([
  ["CA-CTCF", "Chromatin Accessible with CTCF:#00B0F0"],
  ["CA-TF", "Chromatin Accessible with TF:#be28e5"],
  ["CA-H3K4me3", "Chromatin Accessible with H3K4me3:#ffaaaa"],
  ["TF", "TF:#d876ec"],
  ["CA", "Chromatin Accessible Only:#06DA93"],
  ["pELS","Proximal Enhancer:#FFA700"],
  ["dELS","Distal Enhancer:#FFCD00"],
  ["PLS","Promoter:#ff0000"],    
  ["noclass","Unclassified:#8c8c8c"],
  ["InActive","Inactive:#e1e1e1"]  
])

export const DATA_SOURCE_COLOR_MAP: Map<string, string> = new Map([
  ["P", "Chip-Seq:#1161eb"],
  ["S", "HT-Selex:#c211eb"],
  ["M", "Methyl HT-Selex:#eb1161"],
  ["G", "Genomic HT-Selex:#8beb11"],
  ["I", "SMiLe-Seq:#11ebb2"],
  ["B","PBM:#eb8b11"],
  ["none", "None:grey"],
])

export const QUALITY_COLOR_MAP: Map<string, string> = new Map([
  ["A", "Found in both Chip-Seq and Ht-Selex:#6a43eb"],
  ["B", "Reproducible in Chip-Seq or HT-Selex:#9b31eb"],
  ["C", "Found in a single dataset:#f58f8f"],
  ["D", "Subtypes built from motifs exclusively inherited from HOCOMOCO-v12:#ec4ce0"],
  ["none", "None:grey"],
])