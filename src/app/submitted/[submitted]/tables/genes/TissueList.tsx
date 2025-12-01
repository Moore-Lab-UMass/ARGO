import { Box, Typography, Divider } from "@mui/material";

export default function TissueList({ onSelect, selected }) {
  return (
    <Box
      sx={{
        maxHeight: 600,
        overflowY: "auto",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
      }}
    >
      {tissues.map((tissue, index) => {
        const isSelected = selected === tissue;

        return (
          <Box key={tissue}>
            <Typography
              onClick={() => onSelect(tissue)}
              sx={{
                cursor: "pointer",
                p: 1.5,
                backgroundColor: isSelected ? "action.hover" : "transparent",
                fontWeight: isSelected ? "bold" : "normal",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              {tissue}
            </Typography>

            {index < tissues.length - 1 && <Divider />}
          </Box>
        );
      })}
    </Box>
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
