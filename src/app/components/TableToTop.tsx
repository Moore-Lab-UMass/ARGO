import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import VerticalAlignTop from "@mui/icons-material/VerticalAlignTop";
import { Table } from "../types";

export interface SubTableTitleProps {
  table: "sequence" | "elements" | "genes";
  setTableOrder: React.Dispatch<React.SetStateAction<Table[]>>;
  tableOrder: Table[];
}

const TableToTop: React.FC<SubTableTitleProps> = ({ table, setTableOrder, tableOrder }) => {
  const disabled = tableOrder[0] === table;

    // snap sub table to top of the page
    const bringTableToTop = (table: Table) => {
        setTableOrder((prevOrder) => {
            // Remove the table from its current position
            const newOrder = prevOrder.filter((t) => t !== table);
            // Prepend the table to the beginning of the array
            return [table, ...newOrder];
        });
    };

  return (
    <Tooltip title="Bring Table to Top">
      <IconButton onClick={() => bringTableToTop(table)} size="small" disabled={disabled}>
        <VerticalAlignTop fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default TableToTop;
