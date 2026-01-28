import { useEffect, useState } from 'react';
import { InputRegions } from '../types';

function parseVCFToRegions(vcfText: string): InputRegions {
    const lines = vcfText.split('\n');

    const regions: InputRegions = [];

    for (const line of lines) {
        if (!line || line.startsWith('#')) continue;

        const [chrom, pos, ref, alt, id, CLNSIG_category] = line.split('\t');

        const start = Number(pos) - 1;
        const end = Number(pos);

        regions.push({
            chr: chrom,
            start,
            end,
            regionID: CLNSIG_category + "_" + id,
            ref,
            alt,
            strand: '+',
        });
    }

    return regions;
}

const collectionFileMap: { [key: string]: string } = {
  "Default": "/compassTesting.vcf",
  "Migraine": "/filteredMigraine.vcf",
  "Xeroderma Pigmentosum": "/Xeroderma_pigmentosum.vcf",
  "Meckel Syndrome": "/Meckel_syndrome.vcf",
};

export function useCompassRegions(collection: string = "Default") {
  const [compassRegions, setCompassRegions] = useState<InputRegions>([]);
  const [loading, setLoading] = useState(true);

  console.log(collectionFileMap[collection]);

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
