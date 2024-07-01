import React from "react";
import { DEVICE_STATUS } from "../constants";

export const LightSvg = ({ status, color }) => {
  const statusColor =
    status === DEVICE_STATUS.ON
      ? "#4CAF50"
      : status === DEVICE_STATUS.OFF
      ? "#F44336"
      : "#9E9E9E";

  // Set default color for the bulb depending on the status
  const bulbColor =
    status === DEVICE_STATUS.ON
      ? color
      : status === DEVICE_STATUS.OFF
      ? "#FFFFFF"
      : "#9E9E9E";

  return (
    <div
      className={
        status === DEVICE_STATUS.OFFLINE ? "svg-wrapper-offline" : "svg-wrapper"
      }
    >
      <svg
        width="100px"
        height="100px"
        viewBox="0 0 1024 1024"
        className="icon"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        fill="#000000"
        transform="rotate(180)"
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <path
            d="M513.311597 95.397443c-156.598141 0-253.554962 137.570256-253.554962 265.040908 0 105.370087 44.014782 155.726815 82.912186 200.192106l7.377094 8.41429c20.519686 23.753116 25.437407 101.224375 22.39442 158.053082a25.298159 25.298159 0 0 0 6.79655 18.445294c4.725231 4.920793 11.19721 7.767194 18.057242 7.767194h8.122482v115.854673c0 13.722111 11.134753 24.853792 24.853793 24.853792h58.187403v9.967524c0 13.719039 11.130657 24.853792 24.853792 24.853792s24.853792-11.134753 24.853792-24.853792v-9.967524h58.283649c13.722111 0 24.853792-11.131681 24.853792-24.853792V753.310317h8.155247c6.860032 0 13.332011-2.846401 18.057241-7.767194a25.293039 25.293039 0 0 0 6.796551-18.445294c-3.041963-56.828707 1.875758-134.299966 22.39442-158.053082l7.442622-8.546371c38.831875-44.398739 82.845633-94.752396 82.845634-200.060025 0.001024-127.470651-96.954773-265.040907-253.682948-265.040908z"
            fill="#27323A"
          ></path>
          <path
            d="M571.595245 844.311197H455.124194v-91.00088h116.471051v91.00088z"
            fill={statusColor}
          ></path>
          <path
            d="M646.740237 527.812885l-7.638184 8.705073c-30.355128 35.176604-35.404931 104.432208-35.404931 155.239445 0 4.467212 0.12901 7.896204 0.195562 11.843282H422.827779c0.066553-3.947078 0.195562-7.37607 0.195562-11.843282 0-50.87379-5.049802-120.063865-35.372166-155.239445 0-0.032764-7.571632-8.639544-7.571632-8.639544-36.310045-41.552338-70.614299-80.774313-70.614299-167.441087 0-105.85336 76.244645-215.333323 203.847377-215.333323 127.731742 0 203.976387 109.478938 203.976387 215.333323-0.001024 86.601245-34.238725 125.824244-70.548771 167.375558z"
            fill={bulbColor}
          ></path>
          <path
            d="M460.237477 205.622794c3.496568 8.476747-0.517062 18.186251-8.993808 21.68282-42.134929 17.473627-61.196602 49.383013-69.739901 73.069576-13.917673 38.642456-10.163086 84.691699 10.160014 123.168285 4.27165 8.09279 1.166205 18.123794-6.925561 22.39442-8.088694 4.27165-18.123794 1.166205-22.39442-6.92556-24.916249-47.311693-29.317932-101.907306-12.035771-149.897836 15.336778-42.361208 46.665621-75.207449 88.247652-92.426128 8.479818-3.492473 18.189323 0.520134 21.681795 8.934423z"
            fill="#FFFFFF"
          ></path>
        </g>
      </svg>
    </div>
  );
};

export const OutletSVG = ({ status }) => {
  const fillColor =
    status === DEVICE_STATUS.ON
      ? "#4CAF50"
      : status === DEVICE_STATUS.OFF
      ? "#F44336"
      : "#9E9E9E";
  return (
    <div
      className={
        status === DEVICE_STATUS.OFFLINE ? "svg-wrapper-offline" : "svg-wrapper"
      }
    >
      <svg
        version="1.1"
        id="_x36_"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 512 512"
        xmlSpace="preserve"
        fill="#000000"
        transform="matrix(1, 0, 0, -1, 0, 0)"
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <g>
            <g>
              <path
                style={{ fill: "#E3E2E2" }}
                d="M460.208,35.205v441.589c0,19.38-15.826,35.206-35.205,35.206H35.206 C15.825,512,0,496.175,0,476.794V35.205C0,15.825,15.825,0,35.206,0h389.797c0.508,0,1.016,0,1.439,0.085 c18.28,0.677,33.005,15.487,33.682,33.682C460.208,34.274,460.208,34.697,460.208,35.205z"
              ></path>
              <path
                style={{ fill: "#F7F4EC" }}
                d="M425.04,14.827H35.168c-11.218,0-20.344,9.127-20.344,20.344v441.658 c0,11.217,9.127,20.344,20.344,20.344H425.04c11.218,0,20.344-9.127,20.344-20.344V35.171 C445.384,23.954,436.258,14.827,425.04,14.827z"
              ></path>
              <g>
                <g>
                  <circle
                    style={{ fill: "#E3E2E2" }}
                    cx="230.104"
                    cy="256"
                    r="147.027"
                  ></circle>
                  <path
                    style={{ fill: "#E3E2E2" }}
                    d="M227.527,392.645c-75.347-1.421-135.49-63.876-134.069-139.222 c1.421-75.347,63.876-135.49,139.223-134.069c75.347,1.421,135.49,63.876,134.069,139.222 C365.329,333.923,302.874,394.066,227.527,392.645z"
                  ></path>
                </g>
                <g>
                  <rect
                    x="170.369"
                    y="196.265"
                    style={{ fill: "#FFFFFF" }}
                    width="32.18"
                    height="77.675"
                  ></rect>
                  <rect
                    x="268.017"
                    y="196.265"
                    style={{ fill: "#FFFFFF" }}
                    width="32.18"
                    height="77.675"
                  ></rect>
                </g>
                <g>
                  <rect
                    x="165.19"
                    y="191.086"
                    style={{ fill: `${fillColor}` }}
                    width="32.179"
                    height="77.675"
                  ></rect>
                  <rect
                    x="262.838"
                    y="191.086"
                    style={{ fill: `${fillColor}` }}
                    width="32.18"
                    height="77.675"
                  ></rect>
                </g>
                <path
                  style={{ fill: "#FFFFFF" }}
                  d="M235.761,295.886h-0.957c-15.257,0-27.741,12.483-27.741,27.741v27.741h56.438v-27.742 C263.502,308.369,251.019,295.886,235.761,295.886z"
                ></path>
                <path
                  style={{ fill: `${fillColor}` }}
                  d="M230.583,290.954h-0.957c-15.257,0-27.741,12.483-27.741,27.741v27.741h56.438v-27.742 C258.323,303.437,245.84,290.954,230.583,290.954z"
                ></path>
              </g>
              <g style={{ opacity: 0.5 }}>
                <g>
                  <circle
                    style={{ fill: "#E3E2E2" }}
                    cx="62.576"
                    cy="61.132"
                    r="31.071"
                  ></circle>
                  <circle
                    style={{ fill: "#E3E2E2" }}
                    cx="399.922"
                    cy="61.132"
                    r="31.071"
                  ></circle>
                </g>
                <g>
                  <circle
                    style={{ fill: "#E3E2E2" }}
                    cx="62.576"
                    cy="452.484"
                    r="31.071"
                  ></circle>
                  <circle
                    style={{ fill: "#E3E2E2" }}
                    cx="399.922"
                    cy="452.484"
                    r="31.071"
                  ></circle>
                </g>
              </g>
            </g>
            <path
              style={{ opacity: 0.02, fill: "#040000" }}
              d="M460.208,35.205v441.589c0,19.38-15.826,35.206-35.205,35.206H230.104V0h194.899 c0.508,0,1.016,0,1.439,0.085c18.28,0.677,33.005,15.487,33.682,33.682C460.208,34.274,460.208,34.697,460.208,35.205z"
            ></path>
          </g>
        </g>
      </svg>
    </div>
  );
};

export const SpeakerSVG = () => {
  return (
    <div
      className="svg-wrapper"
      style={{
        cursor: "default",
      }}
    >
      <svg
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        fill="#000000"
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <title>Speaker</title>
          <path
            d="M32,19c-7,0-12.87-2.51-15.07-6A5.6,5.6,0,0,0,16,16c0,5,7.16,9,16,9s16-4,16-9a5.6,5.6,0,0,0-.93-3C44.87,16.49,39,19,32,19Z"
            fill="#c8f1fb"
          ></path>
          <ellipse
            cx="32"
            cy="10"
            rx="16"
            ry="9"
            fill="none"
            stroke="#47caf3"
            strokeMiterlimit="10"
            strokeWidth="2"
          ></ellipse>
          <path
            d="M16.13,7.8L14,34.14a42.3,42.3,0,0,0,0,10.31,37.22,37.22,0,0,0,4.81,15.08C21.69,61.62,26.52,63,32,63s10.27-1.36,13.16-3.45a37.38,37.38,0,0,0,4.91-15.1,42.3,42.3,0,0,0,0-10.31L47.93,7.8"
            fill="none"
            stroke="#47caf3"
            strokeMiterlimit="10"
            strokeWidth="2"
          ></path>
          <line
            x1="14"
            y1="38"
            x2="50"
            y2="38"
            fill="none"
            stroke="#47caf3"
            strokeMiterlimit="10"
            strokeWidth="2"
          ></line>
          <circle cx="32" cy="7" r="1" fill="#47caf3"></circle>
          <circle cx="32" cy="12" r="1" fill="#47caf3"></circle>
          <circle cx="28" cy="9" r="1" fill="#47caf3"></circle>
          <circle cx="36" cy="9" r="1" fill="#47caf3"></circle>
          <circle cx="19.5" cy="47" r="1" fill="#47caf3"></circle>
          <circle cx="24.5" cy="47" r="1" fill="#47caf3"></circle>
          <circle cx="29.5" cy="47" r="1" fill="#47caf3"></circle>
          <circle cx="34.5" cy="47" r="1" fill="#47caf3"></circle>
          <circle cx="39.5" cy="47" r="1" fill="#47caf3"></circle>
          <circle cx="44.5" cy="47" r="1" fill="#47caf3"></circle>
          <circle cx="22.5" cy="43" r="1" fill="#47caf3"></circle>
          <circle cx="27.5" cy="43" r="1" fill="#47caf3"></circle>
          <circle cx="32.5" cy="43" r="1" fill="#47caf3"></circle>
          <circle cx="37.5" cy="43" r="1" fill="#47caf3"></circle>
          <circle cx="42.5" cy="43" r="1" fill="#47caf3"></circle>
          <circle cx="24.5" cy="55" r="1" fill="#47caf3"></circle>
          <circle cx="29.5" cy="55" r="1" fill="#47caf3"></circle>
          <circle cx="34.5" cy="55" r="1" fill="#47caf3"></circle>
          <circle cx="39.5" cy="55" r="1" fill="#47caf3"></circle>
          <circle cx="22.5" cy="51" r="1" fill="#47caf3"></circle>
          <circle cx="27.5" cy="51" r="1" fill="#47caf3"></circle>
          <circle cx="32.5" cy="51" r="1" fill="#47caf3"></circle>
          <circle cx="37.5" cy="51" r="1" fill="#47caf3"></circle>
          <circle cx="42.5" cy="51" r="1" fill="#47caf3"></circle>
        </g>
      </svg>
    </div>
  );
};
