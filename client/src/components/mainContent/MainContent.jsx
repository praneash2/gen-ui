import withDynamicHandlers from "../../hoc/withDynamicHandlers/withDynamicHandlers"

const MainContent = ({content}) => {
    const handleClick = () => {
        console.log("Button clicked in MainContent");
    }
    const DynamicComponent = withDynamicHandlers(content, {
        handleClick
    })
    return (
        <DynamicComponent />
    )
}

export default MainContent;