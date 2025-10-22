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
  ["P", "Chip-Seq:#00B0F0"],
  ["S", "HT-Selex:#be28e5"],
  ["M", "Methyl HT-Selex:#ffaaaa"],
  ["G", "Genomic HT-Selex:#d876ec"],
  ["I", "SMiLe-Seq:#06DA93"],
  ["B","PBM:#FFA700"],
])

export const QUALITY_COLOR_MAP: Map<string, string> = new Map([
  ["A", "Found in both Chip-Seq and Ht-Selex:#00B0F0"],
  ["B", "Reproducible in Chip-Seq or HT-Selex:#be28e5"],
  ["C", "Found in a single dataset:#ffaaaa"],
  ["D", "Subtypes built from motifs exclusively inherited from HOCOMOCO-v12:#d876ec"],
])