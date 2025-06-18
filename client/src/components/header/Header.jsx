import withDynamicHandlers from "../../hoc/withDynamicHandlers/withDynamicHandlers"

const Header = ({content, setOpen}) => {
    const handlePersonalise = () => {
        setOpen(true)
    }
    const DynamicComponent = withDynamicHandlers(content, {handlePersonalise})
    return (
        <DynamicComponent />
    )
}

export default Header;