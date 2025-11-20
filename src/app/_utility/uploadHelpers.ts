export function parseDataInput(data) {
        const allLines = []
        data.split("\n").forEach((line) => {
            if (!(line.startsWith("#") ||
                line.startsWith("browser") ||
                line.startsWith("track") ||
                line.length === 0
            )) {
                allLines.push(line.split("\t"))
            }
        })
        return allLines
    }