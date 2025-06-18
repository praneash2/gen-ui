export const responseParserUtil=(rawString)=>{
    const sectionKeys = ["header", "main", "blog", "footer"];
    const result={}
    let str = rawString.trim();
    if (str.startsWith('{') && str.endsWith('}')) {
        const parsedString=JSON.parse(str);
        parsedString.components.map((key,index)=>{
            sectionKeys.map((sectionKey,index)=>{
                if(sectionKey.toLowerCase()===key.name.toLowerCase()){
                    result[key.name.toLowerCase()]=key.code;
                }
                    
            })
            
        });
    }
    return result;
}