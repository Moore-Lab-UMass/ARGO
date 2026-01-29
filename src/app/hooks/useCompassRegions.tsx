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
            // SNV or MNV
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

const collectionFileMap: { [key: string]: string } = {
  "Default": "/compassTesting.vcf",
  "Inborn Genetic Diseases": "/Inborn_genetic_diseases.vcf",
  "Melanoma Pancreatic Cancer": "/Melanoma-pancreatic_cancer_syndrome.vcf",
  "Primary Ciliary Dyskinesia": "/Primary_ciliary_dyskinesia.vcf",
  "Hereditary Breast Ovarian Cancer Syndrome": "/Hereditary_breast_ovarian_cancer_syndrome.vcf",
  "Spastic Paraplegia": "/Spastic_paraplegia.vcf",
};

export function useCompassRegions(collection: string = "Default") {
  const [compassRegions, setCompassRegions] = useState<InputRegions>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(collectionFileMap[collection])
      .then(res => res.text())
      .then(text => {
        setCompassRegions(parseVCFToRegions(text));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [collection]);

  return { compassRegions, loading };
}
