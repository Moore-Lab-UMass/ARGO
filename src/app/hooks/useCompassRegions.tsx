import { useEffect, useState } from 'react';
import { InputRegions } from '../types';

function parseVCFToRegions(vcfText: string): InputRegions {
    const lines = vcfText.split('\n');
    const regions: InputRegions = [];

    for (const line of lines) {
        if (!line || line.startsWith('#')) continue;

        const [
            chrom,
            pos,
            ref,
            alt,
            id,
            CLNSIG_category
        ] = line.split('\t');

        const start = Number(pos) - 1;

        let end: number;

        if (ref.length === alt.length) {
            end = start + ref.length;
        } else if (ref.length > alt.length) {
            // Deletion
            end = start + ref.length;
        } else {
            // Insertion
            end = start + 1;
        }

        regions.push({
            chr: chrom,
            start,
            end,
            regionID: `${CLNSIG_category}_${id}`,
            ref,
            alt,
            strand: '+',
        });
    }

    return regions;
}

export const collectionFileMap: Record<
  string,
  { file: string; count: number }
> = {
  "Clinvar Test": {
    file: "/Test-Clinvar-Subset.vcf",
    count: 250,
  },
  "Hereditary Breast Ovarian Cancer Syndrome": {
    file: "/Hereditary_breast_ovarian_cancer_syndrome_cleaned.vcf",
    count: 43,
  },
  "Primary Ciliary Dyskinesia": {
    file: "/Primary_ciliary_dyskinesia_cleaned.vcf",
    count: 250,
  },
  "Inborn Genetic Diseases": {
    file: "/Inborn_genetic_diseases_cleaned.vcf",
    count: 96,
  },
  "Spastic Paraplegia": {
    file: "/Spastic_paraplegia_cleaned.vcf",
    count: 151,
  },
};

export function useCompassRegions(collection: string = "Default") {
  const [compassRegions, setCompassRegions] = useState<InputRegions>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(collectionFileMap[collection].file)
      .then(res => res.text())
      .then(text => {
        setCompassRegions(parseVCFToRegions(text));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [collection]);

  return { compassRegions, loading };
}
