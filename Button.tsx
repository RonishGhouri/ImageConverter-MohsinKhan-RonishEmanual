// ... (other imports)

import './Button.css'

type ButtonProps = {
    text: string;
    onClick?: () => void;
    isSelected: boolean;
    onSelect: () => void;
  };
  
  export const Button = (props: ButtonProps) => {
    const handleClick = () => {
      props.onSelect();
      if (props.onClick) {
        props.onClick();
      }
    };
  
    return (
      <div
        className={`btn ${props.isSelected ? 'selected' : ''}`}
        onClick={handleClick}
      >
        <p style={{color:"white"}}>{props.text}</p>
      </div>
    );
  };
  