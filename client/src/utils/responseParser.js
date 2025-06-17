export const responseParser = (response) => {
    function parseHtmlSections(rawString) {
        const sectionKeys = ["header", "main", "blog", "footer"];
        const result = {};

        // Create a regex to match each section key followed by colon
        const sectionRegex = /(\bheader\b|\bmain\b|\bblog\b|\bfooter\b)\s*:\s*(<[^>]+>[\s\S]*?)(?=(\bheader\b|\bmain\b|\bblog\b|\bfooter\b)\s*:|}$)/g;

        let match;
        while ((match = sectionRegex.exec(rawString)) !== null) {
            const key = match[1].trim();
            const html = match[2].trim().replace(/^"|"$/g, ""); // Trim quotes if any
            result[key] = html;
        }

        // Ensure all keys exist even if they are missing in the input
        for (const key of sectionKeys) {
            if (!result.hasOwnProperty(key)) {
                result[key] = "";
            }
        }

        return result;
    }

    // sample Usage 
    const rawString = `"{\n header: \n <header class=\\"bg-green-800 ... </header>, \n section: ...}"`;
    const parsedObject = parseHtmlSections(rawString);

    console.log(parsedObject);
    return parsedObject;
}