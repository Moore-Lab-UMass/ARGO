import React from "react";
import { IconButton } from "@mui/material";
import VerticalAlignTop from "@mui/icons-material/VerticalAlignTop";
import { Table } from "../types";

export interface SubTableTitleProps {
  table: "sequence" | "elements" | "genes";
  setTableOrder: React.Dispatch<React.SetStateAction<Table[]>>;
}

const TableToTop: React.FC<SubTableTitleProps> = ({ table, setTableOrder }) => {

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
      <IconButton onClick={() => bringTableToTop(table)} size="small">
        <VerticalAlignTop fontSize="small"/>
      </IconButton>
  );
};

export default TableToTop;
