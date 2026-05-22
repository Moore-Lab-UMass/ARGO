/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\nquery getcCREDetails($assembly: String!, $accession: [String!], $coordinates: [GenomicRangeInput]) {\n  getmaxZScoresQuery(assembly: $assembly, accession: $accession, coordinates: $coordinates) {\n    chromosome\n    primates\n    vertebrates\n    mammals\n    start\n    ccre_group\n    stop\n    nearestgenes { gene distance }\n    accession\n    atac_max_zscore\n    ctcf_max_zscore\n    dnase_max_zscore\n    h3k27ac_max_zscore\n    h3k4me3_max_zscore\n  }\n}\n": typeof types.GetcCreDetailsDocument,
    "\nquery getcCREZscoresDetails($assembly: String!, $accession: [String!], $coordinates: [GenomicRangeInput], $biosample_value: [String]) {\n  getcCREZScoresQuery(assembly: $assembly, accession: $accession, coordinates: $coordinates, biosample_value: $biosample_value, include_biosample_details: true) {\n    chromosome\n    start\n    stop\n    accession\n    atac_max_zscore\n    ctcf_max_zscore\n    dnase_max_zscore\n    h3k27ac_max_zscore\n    h3k4me3_max_zscore\n    zscores\n  }\n}\n": typeof types.GetcCreZscoresDetailsDocument,
    "\n  query geneSpecificity($geneids: [String]){\n  geneSpecificity(geneid: $geneids) {\n    score\n    stop\n    start\n    chromosome\n    name\n  }\n}\n  ": typeof types.GeneSpecificityDocument,
    "\n  query closestAndLinked($accessions: [String]!){\n  closestGenetocCRE(ccre: $accessions) {\n    ccre\n    strand\n    chromosome\n    start\n    stop\n    transcriptid\n    gene {\n      name\n      type\n      geneid\n      chromosome\n      stop\n      start\n    }\n  }\n}\n  ": typeof types.ClosestAndLinkedDocument,
    "\n  query orthoQuery($accessions: [String], $assembly: String){\n  orthologQuery(accession: $accessions, assembly: $assembly) {\n    assembly\n    accession\n    ortholog\n     { \n      accession\n    }\n  }\n}\n   ": typeof types.OrthoQueryDocument,
    "\n    query BigRequestQuery($requests: [BigRequest!]!) {\n  bigRequests(requests: $requests) {\n    data\n  }\n}\n     ": typeof types.BigRequestQueryDocument,
    "\n  query occurrences($range: [GenomicRegionInput!], $limit: Int) {\n        meme_occurrences(genomic_region: $range, , limit: $limit) {\n            motif {\n              id\n                pwm\n                peaks_file {\n                    assembly\n                    accession\n                    dataset_accession\n                }\n              \n                tomtom_matches {\n                    jaspar_name\n                    target_id\n                    e_value\n                  \n                }\n                flank_p_value\n                shuffled_p_value\n            }\n            strand\n            peaks_accession\n            consensus_regex\n            q_value\n            genomic_region {\n                chromosome\n                start\n                end\n            }\n        }\n    }\n  ": typeof types.OccurrencesDocument,
    "\n    query tomtomMatches($peaks_accessions: [String!]!, $ids: [String!]!) {\n        target_motifs(peaks_accessions: $peaks_accessions, motif_id: $ids) {\n            target_id\n            e_value\n            jaspar_name\n        }\n    }\n": typeof types.TomtomMatchesDocument,
    "\n  query bigRequestsMultipleRegionsSequence($requests: MultipleRegionBigRequest!) {\n  bigRequestsMultipleRegions(requests: $requests) {\n    data\n    error {\n      errortype\n      message\n    }\n  }  \n}\n  ": typeof types.BigRequestsMultipleRegionsSequenceDocument,
    "\n    query geneOrthologQuery($name: [String]!, $assembly: String!) {\n    geneOrthologQuery: geneorthologQuery(name: $name, assembly: $assembly) {\n      humanGene: external_gene_name\n      mouseGene: mmusculus_homolog_associated_gene_name\n    }\n  }\n    ": typeof types.GeneOrthologQueryDocument,
    "\n  query test_geneEXpBiosampleQuery($genes: [String!]!, $tissue:  [String!], $biosample:  [String!], $aggregateBy: AggregateByEnum) {\n    geneexpressiontpms(genes: $genes, tissue: $tissue, biosample: $biosample, aggregateBy: $aggregateBy) {\n      tpm \n      gene\n      geneid\n    }\n  }\n  ": typeof types.Test_GeneEXpBiosampleQueryDocument,
    "\n  query MotifRankingQuery($motifinputs: [MotifRankingInput!]) {\n    motifranking(motifinputs: $motifinputs) {\n      alt\n      ref\n      diff\n      regionid    \n      threshold\n      motif\n    }\n  }\n  ": typeof types.MotifRankingQueryDocument,
    "\n    query RefCheckMotifRankingQuery($inputs: [MotifRankingRefCheckInput!]!) {\n  refcheckmotifranking(refcheckmotifinputs: $inputs) {\n    chrom\n    start\n    end\n    ref\n    regionid\n    refTrue\n  }\n}\n    ": typeof types.RefCheckMotifRankingQueryDocument,
    "\n  query fetchSNPAllele($snp: [String]!){\n  getSNPAllele(snp:$snp){\n    altallele\n    refallele\n    chrom\n    start\n    stop\n    snp\n  }\n}\n": typeof types.FetchSnpAlleleDocument,
    "\nquery bedIntersectCCRE_1 ($user_ccres: [cCRE]!, $assembly: String!, $max_ouput_length: Int) {\n  intersection (\n    userCcres: $user_ccres,\n    assembly: $assembly,\n    maxOutputLength: $max_ouput_length\n  )\n}\n": typeof types.BedIntersectCcre_1Document,
    "\n  query GetLinkedGenesCelltypesByAssay($assay: [String], $method: [String], $biosample_value:[String]){\n  getLinkedGenesCelltypesByAssay(assay: $assay, method: $method,\n    biosample_value: $biosample_value ) {          \n    displayname\n    tissue\n    assay\n    biosample_value\n    celltype  \n  }\n}\n  ": typeof types.GetLinkedGenesCelltypesByAssayDocument,
    "\n  query getCompuLinkedGenesCelltypesQuery($method: [String]){\n\tgetCompuLinkedGenesCelltypes(method: $method ) {    \n    method\n    tissue\n    biosample_value\n    biosample_mapping\n  }\n}\n  ": typeof types.GetCompuLinkedGenesCelltypesQueryDocument,
    "\n  query ComputationalGeneLinks($accession: [String]!, $biosample_value: [String], $method: [String]){\n    ComputationalGeneLinksQuery(accession: $accession, biosample_value:$biosample_value, method: $method){\n      gene: genename\n      geneid\n      genetype\n      method\n      celltype\n      score\n      methodregion\n      fileaccession\n    }\n  }\n  ": typeof types.ComputationalGeneLinksDocument,
    "\n    query getLinkedGenes($assembly: String!, $celltype: [String],$assaytype: [String], $accession: [String!]!, $tissue: [String], $method: [String] ){\n  linkedGenesQuery(assembly: $assembly,    \n    celltype: $celltype,\n    assaytype:$assaytype,\n    accession: $accession,\n    tissue: $tissue,\n    method: $method\n    ) {\n      accession  \n      p_val\n      gene\n      geneid\n    biosample_value\n      genetype\n      method\n      grnaid\n      effectsize\n      assay      \n      experiment_accession\n      tissue\n      variantid\n      source\n      slope\n      score\n      displayname\n    }\n}\n    ": typeof types.GetLinkedGenesDocument,
};
const documents: Documents = {
    "\nquery getcCREDetails($assembly: String!, $accession: [String!], $coordinates: [GenomicRangeInput]) {\n  getmaxZScoresQuery(assembly: $assembly, accession: $accession, coordinates: $coordinates) {\n    chromosome\n    primates\n    vertebrates\n    mammals\n    start\n    ccre_group\n    stop\n    nearestgenes { gene distance }\n    accession\n    atac_max_zscore\n    ctcf_max_zscore\n    dnase_max_zscore\n    h3k27ac_max_zscore\n    h3k4me3_max_zscore\n  }\n}\n": types.GetcCreDetailsDocument,
    "\nquery getcCREZscoresDetails($assembly: String!, $accession: [String!], $coordinates: [GenomicRangeInput], $biosample_value: [String]) {\n  getcCREZScoresQuery(assembly: $assembly, accession: $accession, coordinates: $coordinates, biosample_value: $biosample_value, include_biosample_details: true) {\n    chromosome\n    start\n    stop\n    accession\n    atac_max_zscore\n    ctcf_max_zscore\n    dnase_max_zscore\n    h3k27ac_max_zscore\n    h3k4me3_max_zscore\n    zscores\n  }\n}\n": types.GetcCreZscoresDetailsDocument,
    "\n  query geneSpecificity($geneids: [String]){\n  geneSpecificity(geneid: $geneids) {\n    score\n    stop\n    start\n    chromosome\n    name\n  }\n}\n  ": types.GeneSpecificityDocument,
    "\n  query closestAndLinked($accessions: [String]!){\n  closestGenetocCRE(ccre: $accessions) {\n    ccre\n    strand\n    chromosome\n    start\n    stop\n    transcriptid\n    gene {\n      name\n      type\n      geneid\n      chromosome\n      stop\n      start\n    }\n  }\n}\n  ": types.ClosestAndLinkedDocument,
    "\n  query orthoQuery($accessions: [String], $assembly: String){\n  orthologQuery(accession: $accessions, assembly: $assembly) {\n    assembly\n    accession\n    ortholog\n     { \n      accession\n    }\n  }\n}\n   ": types.OrthoQueryDocument,
    "\n    query BigRequestQuery($requests: [BigRequest!]!) {\n  bigRequests(requests: $requests) {\n    data\n  }\n}\n     ": types.BigRequestQueryDocument,
    "\n  query occurrences($range: [GenomicRegionInput!], $limit: Int) {\n        meme_occurrences(genomic_region: $range, , limit: $limit) {\n            motif {\n              id\n                pwm\n                peaks_file {\n                    assembly\n                    accession\n                    dataset_accession\n                }\n              \n                tomtom_matches {\n                    jaspar_name\n                    target_id\n                    e_value\n                  \n                }\n                flank_p_value\n                shuffled_p_value\n            }\n            strand\n            peaks_accession\n            consensus_regex\n            q_value\n            genomic_region {\n                chromosome\n                start\n                end\n            }\n        }\n    }\n  ": types.OccurrencesDocument,
    "\n    query tomtomMatches($peaks_accessions: [String!]!, $ids: [String!]!) {\n        target_motifs(peaks_accessions: $peaks_accessions, motif_id: $ids) {\n            target_id\n            e_value\n            jaspar_name\n        }\n    }\n": types.TomtomMatchesDocument,
    "\n  query bigRequestsMultipleRegionsSequence($requests: MultipleRegionBigRequest!) {\n  bigRequestsMultipleRegions(requests: $requests) {\n    data\n    error {\n      errortype\n      message\n    }\n  }  \n}\n  ": types.BigRequestsMultipleRegionsSequenceDocument,
    "\n    query geneOrthologQuery($name: [String]!, $assembly: String!) {\n    geneOrthologQuery: geneorthologQuery(name: $name, assembly: $assembly) {\n      humanGene: external_gene_name\n      mouseGene: mmusculus_homolog_associated_gene_name\n    }\n  }\n    ": types.GeneOrthologQueryDocument,
    "\n  query test_geneEXpBiosampleQuery($genes: [String!]!, $tissue:  [String!], $biosample:  [String!], $aggregateBy: AggregateByEnum) {\n    geneexpressiontpms(genes: $genes, tissue: $tissue, biosample: $biosample, aggregateBy: $aggregateBy) {\n      tpm \n      gene\n      geneid\n    }\n  }\n  ": types.Test_GeneEXpBiosampleQueryDocument,
    "\n  query MotifRankingQuery($motifinputs: [MotifRankingInput!]) {\n    motifranking(motifinputs: $motifinputs) {\n      alt\n      ref\n      diff\n      regionid    \n      threshold\n      motif\n    }\n  }\n  ": types.MotifRankingQueryDocument,
    "\n    query RefCheckMotifRankingQuery($inputs: [MotifRankingRefCheckInput!]!) {\n  refcheckmotifranking(refcheckmotifinputs: $inputs) {\n    chrom\n    start\n    end\n    ref\n    regionid\n    refTrue\n  }\n}\n    ": types.RefCheckMotifRankingQueryDocument,
    "\n  query fetchSNPAllele($snp: [String]!){\n  getSNPAllele(snp:$snp){\n    altallele\n    refallele\n    chrom\n    start\n    stop\n    snp\n  }\n}\n": types.FetchSnpAlleleDocument,
    "\nquery bedIntersectCCRE_1 ($user_ccres: [cCRE]!, $assembly: String!, $max_ouput_length: Int) {\n  intersection (\n    userCcres: $user_ccres,\n    assembly: $assembly,\n    maxOutputLength: $max_ouput_length\n  )\n}\n": types.BedIntersectCcre_1Document,
    "\n  query GetLinkedGenesCelltypesByAssay($assay: [String], $method: [String], $biosample_value:[String]){\n  getLinkedGenesCelltypesByAssay(assay: $assay, method: $method,\n    biosample_value: $biosample_value ) {          \n    displayname\n    tissue\n    assay\n    biosample_value\n    celltype  \n  }\n}\n  ": types.GetLinkedGenesCelltypesByAssayDocument,
    "\n  query getCompuLinkedGenesCelltypesQuery($method: [String]){\n\tgetCompuLinkedGenesCelltypes(method: $method ) {    \n    method\n    tissue\n    biosample_value\n    biosample_mapping\n  }\n}\n  ": types.GetCompuLinkedGenesCelltypesQueryDocument,
    "\n  query ComputationalGeneLinks($accession: [String]!, $biosample_value: [String], $method: [String]){\n    ComputationalGeneLinksQuery(accession: $accession, biosample_value:$biosample_value, method: $method){\n      gene: genename\n      geneid\n      genetype\n      method\n      celltype\n      score\n      methodregion\n      fileaccession\n    }\n  }\n  ": types.ComputationalGeneLinksDocument,
    "\n    query getLinkedGenes($assembly: String!, $celltype: [String],$assaytype: [String], $accession: [String!]!, $tissue: [String], $method: [String] ){\n  linkedGenesQuery(assembly: $assembly,    \n    celltype: $celltype,\n    assaytype:$assaytype,\n    accession: $accession,\n    tissue: $tissue,\n    method: $method\n    ) {\n      accession  \n      p_val\n      gene\n      geneid\n    biosample_value\n      genetype\n      method\n      grnaid\n      effectsize\n      assay      \n      experiment_accession\n      tissue\n      variantid\n      source\n      slope\n      score\n      displayname\n    }\n}\n    ": types.GetLinkedGenesDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery getcCREDetails($assembly: String!, $accession: [String!], $coordinates: [GenomicRangeInput]) {\n  getmaxZScoresQuery(assembly: $assembly, accession: $accession, coordinates: $coordinates) {\n    chromosome\n    primates\n    vertebrates\n    mammals\n    start\n    ccre_group\n    stop\n    nearestgenes { gene distance }\n    accession\n    atac_max_zscore\n    ctcf_max_zscore\n    dnase_max_zscore\n    h3k27ac_max_zscore\n    h3k4me3_max_zscore\n  }\n}\n"): (typeof documents)["\nquery getcCREDetails($assembly: String!, $accession: [String!], $coordinates: [GenomicRangeInput]) {\n  getmaxZScoresQuery(assembly: $assembly, accession: $accession, coordinates: $coordinates) {\n    chromosome\n    primates\n    vertebrates\n    mammals\n    start\n    ccre_group\n    stop\n    nearestgenes { gene distance }\n    accession\n    atac_max_zscore\n    ctcf_max_zscore\n    dnase_max_zscore\n    h3k27ac_max_zscore\n    h3k4me3_max_zscore\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery getcCREZscoresDetails($assembly: String!, $accession: [String!], $coordinates: [GenomicRangeInput], $biosample_value: [String]) {\n  getcCREZScoresQuery(assembly: $assembly, accession: $accession, coordinates: $coordinates, biosample_value: $biosample_value, include_biosample_details: true) {\n    chromosome\n    start\n    stop\n    accession\n    atac_max_zscore\n    ctcf_max_zscore\n    dnase_max_zscore\n    h3k27ac_max_zscore\n    h3k4me3_max_zscore\n    zscores\n  }\n}\n"): (typeof documents)["\nquery getcCREZscoresDetails($assembly: String!, $accession: [String!], $coordinates: [GenomicRangeInput], $biosample_value: [String]) {\n  getcCREZScoresQuery(assembly: $assembly, accession: $accession, coordinates: $coordinates, biosample_value: $biosample_value, include_biosample_details: true) {\n    chromosome\n    start\n    stop\n    accession\n    atac_max_zscore\n    ctcf_max_zscore\n    dnase_max_zscore\n    h3k27ac_max_zscore\n    h3k4me3_max_zscore\n    zscores\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query geneSpecificity($geneids: [String]){\n  geneSpecificity(geneid: $geneids) {\n    score\n    stop\n    start\n    chromosome\n    name\n  }\n}\n  "): (typeof documents)["\n  query geneSpecificity($geneids: [String]){\n  geneSpecificity(geneid: $geneids) {\n    score\n    stop\n    start\n    chromosome\n    name\n  }\n}\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query closestAndLinked($accessions: [String]!){\n  closestGenetocCRE(ccre: $accessions) {\n    ccre\n    strand\n    chromosome\n    start\n    stop\n    transcriptid\n    gene {\n      name\n      type\n      geneid\n      chromosome\n      stop\n      start\n    }\n  }\n}\n  "): (typeof documents)["\n  query closestAndLinked($accessions: [String]!){\n  closestGenetocCRE(ccre: $accessions) {\n    ccre\n    strand\n    chromosome\n    start\n    stop\n    transcriptid\n    gene {\n      name\n      type\n      geneid\n      chromosome\n      stop\n      start\n    }\n  }\n}\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query orthoQuery($accessions: [String], $assembly: String){\n  orthologQuery(accession: $accessions, assembly: $assembly) {\n    assembly\n    accession\n    ortholog\n     { \n      accession\n    }\n  }\n}\n   "): (typeof documents)["\n  query orthoQuery($accessions: [String], $assembly: String){\n  orthologQuery(accession: $accessions, assembly: $assembly) {\n    assembly\n    accession\n    ortholog\n     { \n      accession\n    }\n  }\n}\n   "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query BigRequestQuery($requests: [BigRequest!]!) {\n  bigRequests(requests: $requests) {\n    data\n  }\n}\n     "): (typeof documents)["\n    query BigRequestQuery($requests: [BigRequest!]!) {\n  bigRequests(requests: $requests) {\n    data\n  }\n}\n     "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query occurrences($range: [GenomicRegionInput!], $limit: Int) {\n        meme_occurrences(genomic_region: $range, , limit: $limit) {\n            motif {\n              id\n                pwm\n                peaks_file {\n                    assembly\n                    accession\n                    dataset_accession\n                }\n              \n                tomtom_matches {\n                    jaspar_name\n                    target_id\n                    e_value\n                  \n                }\n                flank_p_value\n                shuffled_p_value\n            }\n            strand\n            peaks_accession\n            consensus_regex\n            q_value\n            genomic_region {\n                chromosome\n                start\n                end\n            }\n        }\n    }\n  "): (typeof documents)["\n  query occurrences($range: [GenomicRegionInput!], $limit: Int) {\n        meme_occurrences(genomic_region: $range, , limit: $limit) {\n            motif {\n              id\n                pwm\n                peaks_file {\n                    assembly\n                    accession\n                    dataset_accession\n                }\n              \n                tomtom_matches {\n                    jaspar_name\n                    target_id\n                    e_value\n                  \n                }\n                flank_p_value\n                shuffled_p_value\n            }\n            strand\n            peaks_accession\n            consensus_regex\n            q_value\n            genomic_region {\n                chromosome\n                start\n                end\n            }\n        }\n    }\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query tomtomMatches($peaks_accessions: [String!]!, $ids: [String!]!) {\n        target_motifs(peaks_accessions: $peaks_accessions, motif_id: $ids) {\n            target_id\n            e_value\n            jaspar_name\n        }\n    }\n"): (typeof documents)["\n    query tomtomMatches($peaks_accessions: [String!]!, $ids: [String!]!) {\n        target_motifs(peaks_accessions: $peaks_accessions, motif_id: $ids) {\n            target_id\n            e_value\n            jaspar_name\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query bigRequestsMultipleRegionsSequence($requests: MultipleRegionBigRequest!) {\n  bigRequestsMultipleRegions(requests: $requests) {\n    data\n    error {\n      errortype\n      message\n    }\n  }  \n}\n  "): (typeof documents)["\n  query bigRequestsMultipleRegionsSequence($requests: MultipleRegionBigRequest!) {\n  bigRequestsMultipleRegions(requests: $requests) {\n    data\n    error {\n      errortype\n      message\n    }\n  }  \n}\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query geneOrthologQuery($name: [String]!, $assembly: String!) {\n    geneOrthologQuery: geneorthologQuery(name: $name, assembly: $assembly) {\n      humanGene: external_gene_name\n      mouseGene: mmusculus_homolog_associated_gene_name\n    }\n  }\n    "): (typeof documents)["\n    query geneOrthologQuery($name: [String]!, $assembly: String!) {\n    geneOrthologQuery: geneorthologQuery(name: $name, assembly: $assembly) {\n      humanGene: external_gene_name\n      mouseGene: mmusculus_homolog_associated_gene_name\n    }\n  }\n    "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query test_geneEXpBiosampleQuery($genes: [String!]!, $tissue:  [String!], $biosample:  [String!], $aggregateBy: AggregateByEnum) {\n    geneexpressiontpms(genes: $genes, tissue: $tissue, biosample: $biosample, aggregateBy: $aggregateBy) {\n      tpm \n      gene\n      geneid\n    }\n  }\n  "): (typeof documents)["\n  query test_geneEXpBiosampleQuery($genes: [String!]!, $tissue:  [String!], $biosample:  [String!], $aggregateBy: AggregateByEnum) {\n    geneexpressiontpms(genes: $genes, tissue: $tissue, biosample: $biosample, aggregateBy: $aggregateBy) {\n      tpm \n      gene\n      geneid\n    }\n  }\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query MotifRankingQuery($motifinputs: [MotifRankingInput!]) {\n    motifranking(motifinputs: $motifinputs) {\n      alt\n      ref\n      diff\n      regionid    \n      threshold\n      motif\n    }\n  }\n  "): (typeof documents)["\n  query MotifRankingQuery($motifinputs: [MotifRankingInput!]) {\n    motifranking(motifinputs: $motifinputs) {\n      alt\n      ref\n      diff\n      regionid    \n      threshold\n      motif\n    }\n  }\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query RefCheckMotifRankingQuery($inputs: [MotifRankingRefCheckInput!]!) {\n  refcheckmotifranking(refcheckmotifinputs: $inputs) {\n    chrom\n    start\n    end\n    ref\n    regionid\n    refTrue\n  }\n}\n    "): (typeof documents)["\n    query RefCheckMotifRankingQuery($inputs: [MotifRankingRefCheckInput!]!) {\n  refcheckmotifranking(refcheckmotifinputs: $inputs) {\n    chrom\n    start\n    end\n    ref\n    regionid\n    refTrue\n  }\n}\n    "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query fetchSNPAllele($snp: [String]!){\n  getSNPAllele(snp:$snp){\n    altallele\n    refallele\n    chrom\n    start\n    stop\n    snp\n  }\n}\n"): (typeof documents)["\n  query fetchSNPAllele($snp: [String]!){\n  getSNPAllele(snp:$snp){\n    altallele\n    refallele\n    chrom\n    start\n    stop\n    snp\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery bedIntersectCCRE_1 ($user_ccres: [cCRE]!, $assembly: String!, $max_ouput_length: Int) {\n  intersection (\n    userCcres: $user_ccres,\n    assembly: $assembly,\n    maxOutputLength: $max_ouput_length\n  )\n}\n"): (typeof documents)["\nquery bedIntersectCCRE_1 ($user_ccres: [cCRE]!, $assembly: String!, $max_ouput_length: Int) {\n  intersection (\n    userCcres: $user_ccres,\n    assembly: $assembly,\n    maxOutputLength: $max_ouput_length\n  )\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetLinkedGenesCelltypesByAssay($assay: [String], $method: [String], $biosample_value:[String]){\n  getLinkedGenesCelltypesByAssay(assay: $assay, method: $method,\n    biosample_value: $biosample_value ) {          \n    displayname\n    tissue\n    assay\n    biosample_value\n    celltype  \n  }\n}\n  "): (typeof documents)["\n  query GetLinkedGenesCelltypesByAssay($assay: [String], $method: [String], $biosample_value:[String]){\n  getLinkedGenesCelltypesByAssay(assay: $assay, method: $method,\n    biosample_value: $biosample_value ) {          \n    displayname\n    tissue\n    assay\n    biosample_value\n    celltype  \n  }\n}\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query getCompuLinkedGenesCelltypesQuery($method: [String]){\n\tgetCompuLinkedGenesCelltypes(method: $method ) {    \n    method\n    tissue\n    biosample_value\n    biosample_mapping\n  }\n}\n  "): (typeof documents)["\n  query getCompuLinkedGenesCelltypesQuery($method: [String]){\n\tgetCompuLinkedGenesCelltypes(method: $method ) {    \n    method\n    tissue\n    biosample_value\n    biosample_mapping\n  }\n}\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query ComputationalGeneLinks($accession: [String]!, $biosample_value: [String], $method: [String]){\n    ComputationalGeneLinksQuery(accession: $accession, biosample_value:$biosample_value, method: $method){\n      gene: genename\n      geneid\n      genetype\n      method\n      celltype\n      score\n      methodregion\n      fileaccession\n    }\n  }\n  "): (typeof documents)["\n  query ComputationalGeneLinks($accession: [String]!, $biosample_value: [String], $method: [String]){\n    ComputationalGeneLinksQuery(accession: $accession, biosample_value:$biosample_value, method: $method){\n      gene: genename\n      geneid\n      genetype\n      method\n      celltype\n      score\n      methodregion\n      fileaccession\n    }\n  }\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query getLinkedGenes($assembly: String!, $celltype: [String],$assaytype: [String], $accession: [String!]!, $tissue: [String], $method: [String] ){\n  linkedGenesQuery(assembly: $assembly,    \n    celltype: $celltype,\n    assaytype:$assaytype,\n    accession: $accession,\n    tissue: $tissue,\n    method: $method\n    ) {\n      accession  \n      p_val\n      gene\n      geneid\n    biosample_value\n      genetype\n      method\n      grnaid\n      effectsize\n      assay      \n      experiment_accession\n      tissue\n      variantid\n      source\n      slope\n      score\n      displayname\n    }\n}\n    "): (typeof documents)["\n    query getLinkedGenes($assembly: String!, $celltype: [String],$assaytype: [String], $accession: [String!]!, $tissue: [String], $method: [String] ){\n  linkedGenesQuery(assembly: $assembly,    \n    celltype: $celltype,\n    assaytype:$assaytype,\n    accession: $accession,\n    tissue: $tissue,\n    method: $method\n    ) {\n      accession  \n      p_val\n      gene\n      geneid\n    biosample_value\n      genetype\n      method\n      grnaid\n      effectsize\n      assay      \n      experiment_accession\n      tissue\n      variantid\n      source\n      slope\n      score\n      displayname\n    }\n}\n    "];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;