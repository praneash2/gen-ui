import withDynamicHandlers from "../../hoc/withDynamicHandlers/withDynamicHandlers"

const BlogContent = ({ content }) => {
    const DynamicComponent = withDynamicHandlers(content, {
    })
    return (
        <DynamicComponent />
    )
}

export default BlogContent;