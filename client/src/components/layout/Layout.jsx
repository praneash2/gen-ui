import sanitizeHtml from 'sanitize-html';
import { memo } from "react";
import Header from '../header/Header';
import MainContent from '../mainContent/MainContent';
import BlogContent from '../blogContent/BlogContent';
import Footer from '../footer/Footer';


const Layout = ({ content, setOpen }) => {
    const sample = [<Header content={content.header} setOpen={setOpen} />, <MainContent content={content.main} />, <BlogContent content={content.blog} />, <Footer content={content.footer} />];
    return (
        <div class="font-sans antialiased bg-gray-100">
            {sample.map((Component, index) => (
                <div key={index}>
                    {Component}
                </div>
            ))}
        </div>
    );
}

export default memo(Layout);