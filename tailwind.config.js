const plugin = require("tailwindcss/plugin");

module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'green-color': '#3BB89F',
        'blue-color': '#6221E8',
        'violet-color': '#BA30E5',
        'orange-color': '#FA9972',
        'yellow-color': '#FCF776',
        'rose-color': '#EE75BB',
        'box-color': '#1A1735',
        'back-color': '#131128',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    plugin(({ addComponents }) => {
      addComponents(
        (function (background) {

          return (
            {
              ".scrollbar::-webkit-scrollbar": {
                maxHeight: ".5rem",
                maxWidth: ".5rem",
                transition: "all 1s",
                paddingTop: "1rem",
                direction: "center"
              },

              /* Track */
              /* // &::-webkit-scrollbar-track {
              //     box-shadow: inset 0 0 5px grey; 
              //     border-radius: 1px;
              //     border: 5px solid transparent;
              // } */

              /* Handle */
              ".scrollbar::-webkit-scrollbar-thumb": {
                background: "#D9D4BA",
                borderRadius: "10px",
                borderRadius: "10px",
                width: "20%",
              },

              /* Handle on hover */
              ".scrollbar::-webkit-scrollbar-thumb:hover": {
                background: "rgb(78, 82, 83) "
              },
              ".scrollbar-arrows::-webkit-scrollbar-button:start:decrement": {
                position: "fixed",
                marginBottom: "3rem",
                backgroundColor: "green"
              },
              ".scrollbar-arrows::-webkit-scrollbar-button:end:increment": {
                position: "fixed",
                backgroundColor: "red"
              },
              ".date::-webkit-calendar-picker-indicator": {
                background: "transparent",
                bottom: 0,
                // color: transparent;
                cursor: "pointer",
                height: "auto",
                left: 0,
                position: "absolute",
                right: 0,
                top: 0,
                width: "auto",
              },
              ".font-layer": {
                "background": "transparent",
                "-webkit-background-clip": "text",
              },
              ".break-text":{
                "overflow-wrap": "anywhere"
              }
            }
          )
        })()
      );
    })
  ],
}