const OscillatorIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    viewBox="0 0 20 20"
  >
    <g id="seismometer-circle" transform="translate(-2 -2)">
      <circle
        id="secondary"
        fill="#f97316"
        cx="9"
        cy="9"
        r="9"
        transform="translate(3 3)"
      />
      <path
        id="primary"
        d="M7,12H8l1,2,2-5,2,6,2-3h2"
        fill="none"
        stroke="#000000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <circle
        id="primary-2"
        data-name="primary"
        cx="9"
        cy="9"
        r="9"
        transform="translate(3 3)"
        fill="none"
        stroke="#000000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </g>
  </svg>
);

const EffectIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="#000000"
    className="w-5 h-5"
    viewBox="0 0 24 24"
    id="decrease-circle"
    data-name="Flat Line"
  >
    <circle
      id="secondary"
      cx="12"
      cy="12"
      r="9"
      style={{
        fill: '#f97316',
        strokeWidth: 2,
      }}
    />
    <path
      id="primary"
      d="M7.76,12h8.48M12,3a9,9,0,1,0,9,9A9,9,0,0,0,12,3Z"
      style={{
        fill: 'none',
        stroke: '#000000',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
      }}
    />
  </svg>
);

const ScrewIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    viewBox="-1.02 0 20.053 20.053"
  >
    <g id="nut-2" transform="translate(-3 -1.974)">
      <path
        id="secondary"
        fill="#f97316"
        d="M19.49,7.07l-7-3.94a1,1,0,0,0-1,0l-7,3.94A1,1,0,0,0,4,7.94v8.12a1,1,0,0,0,.51.87l7,3.94a1,1,0,0,0,1,0l7-3.94a1,1,0,0,0,.51-.87V7.94a1,1,0,0,0-.53-.87ZM12,15a3,3,0,1,1,3-3A3,3,0,0,1,12,15Z"
      />
      <path
        id="primary"
        d="M9,12a3,3,0,1,1,3,3A3,3,0,0,1,9,12ZM4,16.06a1,1,0,0,0,.51.87l7,3.94a1,1,0,0,0,1,0l7-3.94a1,1,0,0,0,.51-.87V7.94a1,1,0,0,0-.51-.87l-7-3.94a1,1,0,0,0-1,0l-7,3.94A1,1,0,0,0,4,7.94Z"
        fill="none"
        stroke="#000000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </g>
  </svg>
);

const SaveIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="#000000"
    className="w-5 h-5"
    viewBox="0 0 24 24"
    id="box"
    data-name="Flat Line"
  >
    <path
      id="secondary"
      d="M20,3H16v9l-4-1L8,12V3H4A1,1,0,0,0,3,4V20a1,1,0,0,0,1,1H20a1,1,0,0,0,1-1V4A1,1,0,0,0,20,3Z"
      style={{
        fill: '#f97316',
        strokeWidth: 2,
      }}
    />
    <path
      id="primary"
      d="M16,12l-4-1L8,12V3h8Zm5,8V4a1,1,0,0,0-1-1H4A1,1,0,0,0,3,4V20a1,1,0,0,0,1,1H20A1,1,0,0,0,21,20Z"
      style={{
        fill: 'none',
        stroke: '#000000',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
      }}
    />
  </svg>
);

const PresetsIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="#000000"
    className="w-5 h-5"
    viewBox="0 0 24 24"
    id="file-folder-document-2"
    data-name="Flat Line"
  >
    <path
      id="secondary"
      d="M8,11,9.71,9.29a1,1,0,0,1,.7-.29H19V4a1,1,0,0,0-1-1H6A1,1,0,0,0,5,4v7Z"
      style={{
        fill: '#f97316',
        strokeWidth: 2,
      }}
    />
    <path
      id="primary"
      d="M5,11V4A1,1,0,0,1,6,3H18a1,1,0,0,1,1,1V9H10.41a1,1,0,0,0-.7.29L8,11Zm12,6H13M9.71,9.29,8,11H4a1,1,0,0,0-1,1v8a1,1,0,0,0,1,1H20a1,1,0,0,0,1-1V10a1,1,0,0,0-1-1H10.41A1,1,0,0,0,9.71,9.29Z"
      style={{
        fill: 'none',
        stroke: '#000000',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
      }}
    />
  </svg>
);

export { OscillatorIcon, EffectIcon, ScrewIcon, SaveIcon, PresetsIcon };
