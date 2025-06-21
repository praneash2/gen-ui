export const responseParserUtil=(rawString)=>{
    const sectionKeys = ["header", "main", "blog", "footer"];
    const result = {};
    let str = rawString.trim();
    if (str.startsWith('{') && str.endsWith('}')) {
        const parsedString = JSON.parse(str);
        // Extract components
        if (Array.isArray(parsedString.components)) {
            parsedString.components.forEach((key) => {
                sectionKeys.forEach((sectionKey) => {
                    if (sectionKey.toLowerCase() === key.name.toLowerCase()) {
                        result[key.name.toLowerCase()] = key.code;
                        result[key.name.toLowerCase()] = result[key.name.toLowerCase()].replace(/class(Name)?/gi, 'class');
                    }
                });
                
            });
        }
        // Extract logo_url if present
        if (parsedString.logo_url) {
            result.logo_url = parsedString.logo_url;
        }
    }
    return result;
}
