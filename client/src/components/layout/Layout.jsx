import sanitizeHtml from 'sanitize-html';
import { memo } from "react";

const Layout = ({ content }) => {
    return (
        <div dangerouslySetInnerHTML={{
            __html: sanitizeHtml(content, {
                allowedTags: false,
                allowedAttributes: false,
            })
        }}></div>
    );
}

export default memo(Layout);