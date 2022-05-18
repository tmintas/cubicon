import './FormButton.scss';

type ButtonProps = {
    onClick: () => void,
    text: string,
    disabled: boolean,
}

const FormButton = (props: ButtonProps) => {

    return (
        <button className='form-button' disabled={props.disabled} onClick={props.onClick}>{props.text}</button>
    )
}

export default FormButton;