import withDynamicHandlers from "../../hoc/withDynamicHandlers/withDynamicHandlers"

const MainContent = ({content}) => {
    const handleClick = () => {
        console.log("Button clicked in MainContent");
        alert("Yeah, the functionality retains after personalization! 🤯")
    }
    const DynamicComponent = withDynamicHandlers(content, {
        handleClick
    })
    return (
        <DynamicComponent />
    )
}

export default MainContent;