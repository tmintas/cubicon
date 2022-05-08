import './button.scss';

type ButtonProps = {
    onClick: () => void,
    text: string,
}

const Button = (props: ButtonProps) => {

    return (
        <button onClick={props.onClick}>{props.text}</button>
    )
}

export default Button;