import { ReactNode } from "react";
import { Checkbox, FormControl, FormControlLabel, FormGroup, Grid, Stack, Tooltip, Typography } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";

export type CheckboxOption<K extends string> = {
    key: K;
    label: string;
    /** Option can't be toggled (e.g. an assay the selected biosample has no data for) */
    unavailable?: boolean;
};

type CheckboxGroupProps<K extends string> = {
    label: string;
    info?: ReactNode;
    options: CheckboxOption<K>[];
    values: Record<K, boolean>;
    onChange: (values: Record<K, boolean>) => void;
    disabled?: boolean;
    /** "row": options on one line; "columns": options split into two columns */
    layout?: "row" | "columns";
    selectAllLabel?: string;
    sx?: object;
};

/**
 * A labelled group of checkboxes with a "Select all" box.
 * Unavailable options are left out of "Select all" and its checked/indeterminate state.
 */
export default function CheckboxGroup<K extends string>({
    label,
    info,
    options,
    values,
    onChange,
    disabled = false,
    layout = "columns",
    selectAllLabel = "Select all",
    sx,
}: CheckboxGroupProps<K>) {
    const available = options.filter((o) => !o.unavailable);
    const checkedCount = available.filter((o) => values[o.key]).length;
    const allChecked = options.every((o) => (o.unavailable ? !values[o.key] : values[o.key]));
    const indeterminate = checkedCount > 0 && checkedCount < available.length;

    const setAll = (checked: boolean) => {
        const next = { ...values };
        for (const o of available) next[o.key] = checked;
        onChange(next);
    };

    const renderOption = (o: CheckboxOption<K>) => (
        <FormControlLabel
            key={o.key}
            label={o.label}
            control={
                <Checkbox
                    checked={values[o.key]}
                    onChange={() => onChange({ ...values, [o.key]: !values[o.key] })}
                    disabled={disabled || o.unavailable}
                />
            }
        />
    );

    const half = Math.ceil(options.length / 2);

    return (
        <FormControl sx={sx}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Typography>{label}</Typography>
                {info && (
                    <Tooltip arrow placement="right-end" title={info}>
                        <InfoOutlined fontSize="small" />
                    </Tooltip>
                )}
            </Stack>
            <FormControlLabel
                label={selectAllLabel}
                disabled={disabled}
                control={<Checkbox checked={allChecked} indeterminate={indeterminate} onChange={(e) => setAll(e.target.checked)} />}
            />
            {layout === "row" ? (
                <FormGroup row sx={{ ml: 2 }}>
                    {options.map(renderOption)}
                </FormGroup>
            ) : (
                <Grid container spacing={0} ml={2}>
                    <Grid size={6}>
                        <FormGroup>{options.slice(0, half).map(renderOption)}</FormGroup>
                    </Grid>
                    <Grid size={6}>
                        <FormGroup>{options.slice(half).map(renderOption)}</FormGroup>
                    </Grid>
                </Grid>
            )}
        </FormControl>
    );
}
