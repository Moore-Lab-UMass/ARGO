import { GridColDef, Table, useGridApiRef } from "@weng-lab/ui-components";
import { useMemo } from "react";
import { CompBiosample } from "../../../../types";

interface TissueListProps {
  selected: CompBiosample | null;
  onSelect: (tissue: string) => void;
}

export default function TissueList({ onSelect, selected }: TissueListProps) {
  const rows = useMemo(
    () =>
      tissues.map((tissue) => ({
        id: tissue,
        tissue,
      })),
    []
  );

  const columns: GridColDef[] = [
    {
      field: "tissue",
      headerName: "Tissue",
      flex: 1,
      sortable: false,
      filterable: false,
    },
  ];

  const apiRef = useGridApiRef();

  return (
    <Table
      apiRef={apiRef}
      rows={rows}
      columns={columns}
      onRowClick={(row) => onSelect(row.id as string)}
      rowSelectionModel={
        selected
          ? { type: "include", ids: new Set([selected.name]) }
          : { type: "include", ids: new Set() }
      }
      getRowId={(row) => row.id}
      divHeight={{ height: "600px" }}
      label={"Select a Tissue"}
    />
  );
}

export const tissues = [
  "Adipose Subcutaneous",
  "Adipose Visceral Omentum",
  "Adrenal Gland",
  "Artery Aorta",
  "Artery Coronary",
  "Artery Tibial",
  "Brain Amygdala",
  "Brain Anterior cingulate cortex BA24",
  "Brain Caudate basal ganglia",
  "Brain Cerebellar Hemisphere",
  "Brain Cerebellum",
  "Brain Cortex",
  "Brain Frontal Cortex BA9",
  "Brain Hippocampus",
  "Brain Hypothalamus",
  "Brain Nucleus accumbens basal ganglia",
  "Brain Putamen basal ganglia",
  "Brain Spinal cord cervical c-1",
  "Brain Substantia nigra",
  "Breast Mammary Tissue",
  "Cells Cultured fibroblasts",
  "Cells EBV-transformed lymphocytes",
  "Colon Sigmoid",
  "Colon Transverse",
  "Esophagus Gastroesophageal Junction",
  "Esophagus Mucosa",
  "Esophagus Muscularis",
  "Heart Atrial Appendage",
  "Heart Left Ventricle",
  "Kidney Cortex",
  "Liver",
  "Lung",
  "Minor Salivary Gland",
  "Muscle Skeletal",
  "Nerve Tibial",
  "Ovary",
  "Pancreas",
  "Pituitary",
  "Prostate",
  "Skin Not Sun Exposed Suprapubic",
  "Skin Sun Exposed Lower leg",
  "Small Intestine Terminal Ileum",
  "Spleen",
  "Stomach",
  "Testis",
  "Thyroid",
  "Uterus",
  "Vagina",
  "Whole Blood",
];
