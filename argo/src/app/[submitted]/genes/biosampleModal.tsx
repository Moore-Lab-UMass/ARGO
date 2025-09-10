import { Typography, Modal, Paper, IconButton } from "@mui/material";
import { DataTableColumn, DataTable } from "@weng-lab/ui-components";
import CloseIcon from '@mui/icons-material/Close';
import { GeneLinkingMethod } from "../../types";
import GeneLink from "../../_utility/GeneLink";

type ModalProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    onClose: () => void;
    onSubmit: () => void;
    method?: GeneLinkingMethod;
};

const GenesModal: React.FC<ModalProps> = ({
    open,
    setOpen,
    onClose,
    onSubmit,
    method
}) => {

    const style = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 1000,
        p: 4,
    };

    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <Paper sx={style}>
                <IconButton
                    aria-label="close"
                    onClick={() => setOpen(false)}
                    sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <br />
            </Paper>
        </Modal>
    );
};

export default GenesModal;