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

export function useCompassRegions() {
  const [compassRegions, setCompassRegions] = useState<InputRegions>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/compassTesting.vcf')
      .then(res => res.text())
      .then(text => {
        setCompassRegions(parseVCFToRegions(text));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { compassRegions, loading };
}
