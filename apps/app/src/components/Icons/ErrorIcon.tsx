/**
 * @interface Props
 * @param {string} [className] - The CSS class name(s) for styling purposes.
 */

interface Props {
  className: string;
}

const ErrorIcon = (props: Props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      width={16}
      height={16}
      {...props}
    >
      <path
        fill="#ef4444"
        d="M479.579-257Q505-257 519.5-270.579t14.5-39Q534-335 519.921-350t-39.5-15Q455-365 440.5-350.193T426-309.965q0 25.421 14.079 39.193Q454.158-257 479.579-257ZM437-432h91v-269h-91v269Zm42.945 373q-87.053 0-164.146-32.604-77.094-32.603-134.343-89.852-57.249-57.249-89.852-134.41Q59-393.028 59-480.362q0-87.228 32.662-163.934 32.663-76.706 90.203-134.253 57.54-57.547 134.252-90.499Q392.829-902 479.836-902q87.369 0 164.544 32.858 77.175 32.858 134.401 90.257 57.225 57.399 90.222 134.514Q902-567.257 902-479.724q0 87.468-32.952 163.882t-90.499 133.781q-57.547 57.367-134.421 90.214Q567.255-59 479.945-59Z"
      />
    </svg>
  );
};

export default ErrorIcon;