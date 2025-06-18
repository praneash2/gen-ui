export const responseParser = (rawString) => {
   const sectionKeys = ["header", "main", "blog", "footer"];
  const result = {};
 
  // Trim surrounding braces/quotes if present, to simplify matching:
  // e.g. rawString may start with "{" and end with "}"
  let str = rawString.trim();
  if (str.startsWith('"')) {
    // remove leading and trailing quote if the entire JSON is wrapped in quotes
    str = str.replace(/^"+|"+$/g, '');
  }
  if (str.startsWith('{') && str.endsWith('}')) {
    str = str.slice(1, -1);
  }
 
  // Regex: match key: then capture everything until next key: or end-of-input
  const sectionRegex = /(\b(?:header|main|blog|footer)\b)\s*:\s*([\s\S]*?)(?=(?:\b(?:header|main|blog|footer)\b)\s*:|$)/g;
 
  let match;
  while ((match = sectionRegex.exec(str)) !== null) {
    const key = match[1].trim();
    // captured HTML block:
    let html = match[2].trim();
    // Remove trailing comma if present
    html = html.replace(/,\s*$/, "");
    result[key] = html;
  }
 
  // Ensure all keys exist
  for (const key of sectionKeys) {
    if (!result.hasOwnProperty(key)) {
      result[key] = "";
    }
  }
 
  return result;
}