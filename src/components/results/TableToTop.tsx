import { IconButton, Tooltip } from "@mui/material";
import VerticalAlignTop from "@mui/icons-material/VerticalAlignTop";

/** Toolbar button that moves a detail table to the top of the list. */
export default function TableToTop({ isTop, onClick }: { isTop: boolean; onClick: () => void }) {
    return (
        <Tooltip title="Bring Table to Top">
            <IconButton onClick={onClick} size="small" disabled={isTop}>
                <VerticalAlignTop fontSize="small" />
            </IconButton>
        </Tooltip>
    );
}
