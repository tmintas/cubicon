import './FormButton.scss';

type ButtonProps = {
    onClick: () => void,
    text: string,
}

const FormButton = (props: ButtonProps) => {

    return (
        <button onClick={props.onClick}>{props.text}</button>
    )
}

export default FormButton;