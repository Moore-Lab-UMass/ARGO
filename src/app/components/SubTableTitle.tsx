import React from "react";
import { Stack, Typography, IconButton } from "@mui/material";
import VerticalAlignTop from "@mui/icons-material/VerticalAlignTop";

export interface SubTableTitleProps {
  title: string;
  table: "sequence" | "elements" | "genes";
  setTableOrder: React.Dispatch<React.SetStateAction<("sequence" | "elements" | "genes")[]>>;
}

const SubTableTitle: React.FC<SubTableTitleProps> = ({ title, table, setTableOrder }) => {

    // snap sub table to top of the page
    const bringTableToTop = (table: "sequence" | "elements" | "genes") => {
        setTableOrder((prevOrder) => {
            // Remove the table from its current position
            const newOrder = prevOrder.filter((t) => t !== table);
            // Prepend the table to the beginning of the array
            return [table, ...newOrder];
        });
    };

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography
          variant="h5"
          noWrap
          component="div"
          sx={{
            display: { xs: "none", sm: "block" },
            fontWeight: "normal",
          }}
        >
          {title}
        </Typography>
      </Stack>
      <IconButton onClick={() => bringTableToTop(table)} color="inherit">
        <VerticalAlignTop color="inherit" />
      </IconButton>
    </Stack>
  );
};

export default SubTableTitle;
