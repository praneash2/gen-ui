import withDynamicHandlers from "../../hoc/withDynamicHandlers/withDynamicHandlers"

const Footer = ({content}) => {
    const DynamicComponent = withDynamicHandlers(content, {
    })
    return (
        <DynamicComponent />
    )
}

export default Footer;