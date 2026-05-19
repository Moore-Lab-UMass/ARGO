import React from "react";
import { Dialog, DialogContent } from "@mui/material";
import { GridRowParams, useGridApiRef } from "@mui/x-data-grid-premium";
import { gridRowNodeSelector } from "@mui/x-data-grid/hooks/features/rows";
import {
  assaysCol,
  BiosampleTable,
  collectionCol,
  displayNameCol,
  EncodeBiosample,
  ontologyCol,
} from "@weng-lab/ui-components";

interface BiosampleSelectProps {
  open: boolean;
  onClose: () => void;
  assembly: "GRCh38" | "mm10";
  selected: EncodeBiosample;
  onSelectionChange: (biosample: EncodeBiosample) => void;
  prefilterBiosamples?: (biosample: EncodeBiosample) => boolean;
}

export const BiosampleModal: React.FC<BiosampleSelectProps> = ({
  assembly,
  selected,
  open,
  onSelectionChange,
  onClose,
  prefilterBiosamples,
}) => {
  
  const handleSelectionChange = (samples: EncodeBiosample[]) => {
    onSelectionChange(samples[0]); // will only be length one since we specify disableMultipleRowSelection, and are disabling grouped row selection
    onClose();
  };

  const cols = [displayNameCol, ontologyCol, assaysCol, collectionCol];

  const apiRef = useGridApiRef();

  // used to apply cursor: "pointer" to clickable leaf nodes
  const getRowClassName = (params: GridRowParams) => {
    if (gridRowNodeSelector(apiRef, params.id)?.type !== "group") {
      return "is-leaf-row";
    }
    return "";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth keepMounted>
      <DialogContent>
        <BiosampleTable
          apiRef={apiRef}
          label={"Select a Biosample"}
          columns={cols}
          assembly={assembly}
          disableMultipleRowSelection
          isRowSelectable={(params) => gridRowNodeSelector(apiRef, params.id)?.type !== "group"}
          disableRowSelectionOnClick={false}
          onSelectionChange={handleSelectionChange}
          rowSelectionModel={{ type: "include", ids: new Set(selected ? [selected?.name] : []) }}
          divHeight={{ maxHeight: 650 }}
          getRowClassName={getRowClassName}
          sx={{ "& .is-leaf-row:hover": { cursor: "pointer" } }} // used to apply cursor: "pointer" to clickable leaf nodes
          //temp, remove when enabled in theme
          disableRowGrouping={false}
          prefilterBiosamples={prefilterBiosamples}
          initialState={{
            rowGrouping: { model: ["ontology"] },
            columns: {
              columnVisibilityModel: {
                ontology: true,
                assays: prefilterBiosamples ? false : true,
                collection: prefilterBiosamples ? false : true,
                displayname: false, //only false since it is used as "leafField" in groupingColDef
              }
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
