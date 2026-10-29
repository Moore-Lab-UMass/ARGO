import { ReactNode } from "react";
import { IconButton, Modal, Paper, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 1000,
    p: 4,
};

/** Centered dialog with a title and close button, used for per-region details. */
export default function DetailsModal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
    return (
        <Modal open onClose={onClose}>
            <Paper sx={style}>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: "absolute", top: 8, right: 8, color: (theme) => theme.palette.grey[500] }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography variant="h4">{title}</Typography>
                <br />
                {children}
            </Paper>
        </Modal>
    );
}
