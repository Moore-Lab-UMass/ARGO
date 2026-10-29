import { ReactNode } from "react";
import { Box, Link, Stack, Tooltip, Typography } from "@mui/material";
import { MONO_FONT } from "@/app/theme";
import { BRAND, CATEGORY_COLORS, COLORS, RankCategory } from "@/lib/colors";
import { HOCOMOCO_MOTIF_URL, SCREEN_URL } from "@/lib/constants";
import { Allele, GeneScore } from "@/types/rows";

/** Link that opens in a new tab, with a tooltip. */
export function ExternalLink({ href, tooltip, children, placement = "left", color }: {
    href: string;
    tooltip: string;
    children: ReactNode;
    placement?: "left" | "right";
    color?: string;
}) {
    return (
        <Tooltip title={tooltip} arrow placement={placement}>
            <Link href={href} target="_blank" rel="noopener noreferrer" underline="none" sx={color ? { color } : undefined}>
                {children}
            </Link>
        </Tooltip>
    );
}

export const MotifLink = ({ id }: { id?: string }) =>
    id ? (
        <ExternalLink href={`${HOCOMOCO_MOTIF_URL}/${id}`} tooltip="Open Motif In HOCOMOCO" color={COLORS.accent}>
            {id}
        </ExternalLink>
    ) : (
        <>None</>
    );

export const GeneLink = ({ name }: { name: string }) => (
    <ExternalLink href={`${SCREEN_URL}/GRCh38/gene/${name}`} tooltip="Open gene in SCREEN" placement="right">
        {name}
    </ExternalLink>
);

export const CcreLink = ({ assembly, accession }: { assembly: string; accession: string }) => (
    <ExternalLink href={`${SCREEN_URL}/${assembly}/ccre/${accession}`} tooltip="Open cCRE In SCREEN">
        {accession}
    </ExternalLink>
);

/** Shortens long allele sequences to 5 bases. */
const shortAllele = (sequence: string, shorten: boolean) =>
    shorten && sequence.length > 5 ? `${sequence.slice(0, 5)}...` : sequence;

/** An allele's motif score, with the allele sequence in a tooltip. */
export function AlleleScore({ allele, shorten = false }: { allele?: Allele; shorten?: boolean }) {
    if (!allele) return <>N/A</>;
    return (
        <Tooltip
            title={allele.sequence && <span><strong>Allele:</strong> {shortAllele(allele.sequence, shorten)}</span>}
            arrow
            placement="left"
        >
            <Typography fontSize="14px">{allele.score ? Number(allele.score).toFixed(2) : "N/A"}</Typography>
        </Tooltip>
    );
}

export const AlleleSequence = ({ allele }: { allele?: Allele }) => (allele ? <>{shortAllele(allele.sequence, true)}</> : <>N/A</>);

/** A gene score, with the gene it came from (unless it is an average across genes). */
export function GeneScoreCell({ value }: { value?: GeneScore }) {
    if (!value) return <>N/A</>;
    const score = <Typography fontSize="14px">{value.score.toFixed(2)}</Typography>;
    if (value.geneName === "Average") return score;
    return (
        <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip title={value.linkedBy ? <span><strong>Linked By:</strong> {value.linkedBy}</span> : ""} arrow placement="left">
                {score}
            </Tooltip>
            <GeneLink name={value.geneName} />
        </Stack>
    );
}

/** A number styled as a link that opens a details dialog. */
export const CountButton = ({ count, onClick }: { count: number; onClick: () => void }) => (
    <button
        onClick={onClick}
        style={{
            background: "none",
            border: "none",
            padding: 0,
            fontFamily: "arial, sans-serif",
            color: COLORS.accent,
            cursor: "pointer",
            outline: "none",
        }}
    >
        {count}
    </button>
);

/** Sorts numbers ascending with missing values (`isMissing`) always last. */
export const missingLastComparator =
    (isMissing: (v: unknown) => boolean) =>
    (a: unknown, b: unknown): number => {
        const aMissing = isMissing(a);
        const bMissing = isMissing(b);
        if (aMissing && !bMissing) return 1;
        if (!aMissing && bMissing) return -1;
        if (aMissing && bMissing) return 0;
        return Number(a) - Number(b);
    };

/** A category rank (Sequence, Elements, Genes) as a colored pill; 0 means not ranked. */
export function RankPill({ rank, category }: { rank?: number; category: RankCategory }) {
    if (!rank) return <Typography sx={{ fontSize: 12, color: BRAND.muted }}>N/A</Typography>;
    const { pillBg, pillText } = CATEGORY_COLORS[category];
    return (
        <Box
            component="span"
            sx={{ fontSize: 12, fontWeight: 600, px: "9px", py: "2px", borderRadius: 999, backgroundColor: pillBg, color: pillText }}
        >
            {rank}
        </Box>
    );
}

/** The aggregate rank as a square badge (the main table turns `.rank-badge` navy on the selected row). */
export const RankBadge = ({ rank }: { rank?: number }) => (
    <Box
        component="span"
        className="rank-badge"
        sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 26,
            height: 26,
            px: 0.5,
            borderRadius: "7px",
            fontWeight: 700,
            fontSize: 12,
            backgroundColor: BRAND.track,
            color: BRAND.text,
        }}
    >
        {rank}
    </Box>
);

/** Monospace text for coordinates, accessions and scores. */
export const Mono = ({ children, color }: { children: ReactNode; color?: string }) => (
    <Box component="span" sx={{ fontFamily: MONO_FONT, fontSize: 12, color }}>
        {children}
    </Box>
);
