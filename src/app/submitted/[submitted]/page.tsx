"use client"
import React, { useEffect, useMemo, useRef } from "react"
import { useState } from "react"
import { Box, Stack } from "@mui/material"
import { useLazyQuery } from "@apollo/client"
import { client } from "../../client"
import { ElementFilterState, SequenceFilterState, GeneFilterState, CCREs, InputRegions } from "../../types"
import Filters, { initialElementFilterState, initialGeneFilterState, initialSequenceFilterState } from "./Filters"
import { BED_INTERSECT_QUERY } from "../../queries"
import { decodeRegions } from "../../_utility/coding"
import Tables from "./tables/Tables"
import SubmissionHeader from "../../components/SubmissionHeader"

export default function Argo() {
    const [fileName, setFileName] = useState<string | null>(null);
    const [regions, setRegions] = useState<InputRegions>([]);
    const [inputRegions, setInputRegions] = useState<InputRegions>([]);
    const [getIntersectingCcres, { data: intersectArray, loading: loadingIntersect }] = useLazyQuery(BED_INTERSECT_QUERY)

    //UI state variables
    const [drawerOpen, setDrawerOpen] = useState(true);
    const toggleDrawer = () => setDrawerOpen(!drawerOpen);

    // Filter state variables
    const [sequenceFilterVariables, setSequenceFilterVariables] = useState<SequenceFilterState>(initialSequenceFilterState);
    const [elementFilterVariables, setElementFilterVariables] = useState<ElementFilterState>(initialElementFilterState);
    const [geneFilterVariables, setGeneFilterVariables] = useState<GeneFilterState>(initialGeneFilterState);

    const filtersWidth = "25vw";
    const headerHeight = 64

    const filtersRef = useRef<HTMLDivElement>(null);
    const [filtersHeight, setfiltersHeight] = useState<number>(0);

    useEffect(() => {
        if (filtersRef.current) {
            setfiltersHeight(filtersRef.current.getBoundingClientRect().height);
        }
    }, [filtersRef]);

    //Run on first page load to decode the submitted regions and file name
    useEffect(() => {
        const encodedRegions = sessionStorage.getItem("encodedRegions")
        const file = sessionStorage.getItem("fileName")
        if (encodedRegions) {
            try {
                const decoded = decodeRegions(encodedRegions);
                setRegions(decoded);
                setFileName(file)
            } catch (err) {
                console.error("Failed to get regions:", err);
            }
        }
    }, []);

    //Query the intersecting ccres based on the user inputed regions
    useEffect(() => {
        if (regions && regions.length > 0) {
            setInputRegions(regions);
            const user_ccres = regions.map(region => [
                region.chr,
                region.start.toString(),
                region.end.toString(),
            ]);
            getIntersectingCcres({
                variables: {
                    user_ccres: user_ccres,
                    assembly: "GRCh38",
                },
                client: client,
                fetchPolicy: 'cache-and-network',
            })
        } else {
            setInputRegions([]);
        }
    }, [regions, getIntersectingCcres]);

    //update specific variable in sequence filters
    const updateSequenceFilter = (key: keyof SequenceFilterState, value: unknown) => {
        setSequenceFilterVariables((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    };

    //update specific variable in element filters
    const updateElementFilter = (key: keyof ElementFilterState, value: unknown) => {
        setElementFilterVariables((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    };

    //update specific variable in gene filters
    const updateGeneFilter = (key: keyof GeneFilterState, value: unknown) => {
        setGeneFilterVariables((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    };

    //all ccres intersecting the user inputted regions
    const intersectingCcres: CCREs = useMemo(() => {
        if (intersectArray) {
            const transformedData: CCREs = intersectArray.intersection.map(ccre => {
                // Find the matching input region by chr, start, and end
                const matchingRegion = inputRegions.find(region =>
                    region.chr === ccre[6] &&
                    region.start === parseInt(ccre[7]) &&
                    region.end === parseInt(ccre[8])
                );

                return {
                    chr: ccre[0],
                    start: parseInt(ccre[1]),
                    end: parseInt(ccre[2]),
                    accession: ccre[4],
                    inputRegion: {
                        chr: ccre[6],
                        start: parseInt(ccre[7]),
                        end: parseInt(ccre[8])
                    },
                    regionID: matchingRegion ? matchingRegion.regionID : undefined // Add ID if a match is found
                };
            });

            return transformedData;
        }
    }, [inputRegions, intersectArray]);

    return (
        <Stack direction={"row"} height={"100%"} minHeight={`${filtersHeight}px` || 0}>
            <Box
                id="filters-wrapper"
                sx={{
                    position: "sticky",
                    top: 0,
                    width: drawerOpen ? filtersWidth : 0,
                    height: `calc(100vh + ${headerHeight}px)`,
                }}
            >
                <Filters
                    sequenceFilterVariables={sequenceFilterVariables}
                    elementFilterVariables={elementFilterVariables}
                    geneFilterVariables={geneFilterVariables}
                    updateSequenceFilter={updateSequenceFilter}
                    updateElementFilter={updateElementFilter}
                    updateGeneFilter={updateGeneFilter}
                    drawerOpen={drawerOpen}
                    toggleDrawer={toggleDrawer}
                    ref={filtersRef}
                />
            </Box>
            <Box
                sx={{
                    flexGrow: 1,
                    height: "100%",
                    minWidth: 0,
                    padding: 3,
                    zIndex: 1,
                }}
            >
                <SubmissionHeader fileName={fileName} drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />
                <Tables
                    sequenceFilterVariables={sequenceFilterVariables}
                    elementFilterVariables={elementFilterVariables}
                    geneFilterVariables={geneFilterVariables}
                    inputRegions={inputRegions}
                    intersectingCcres={intersectingCcres}
                    loadingIntersect={loadingIntersect}
                />
            </Box>
        </Stack>
    )
}