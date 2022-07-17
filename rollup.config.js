import dts from "rollup-plugin-dts";

const config = [
    {
        input: "build/main.js",
        output: [{file: "dist/script.js", format: "es"}],
    },
    {
        input: "build/main.d.ts",
        output: [{file: "dist/script.d.ts", format: "es"}],
        plugins: [dts()],
    }
];

export default config;